import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { ClassRepository } from '../../../classes/infrastructure/repositories/class.repository';
import { CalculationParametersRepository } from '../../../calculation-parameters/infrastructure/repositories/calculation-parameters.repository';
import { ClassProjectionService } from '../services/ClassProjectionService';
import { Class } from '../../../classes/domain/entities/class.entity';

/**
 * Extended Class interface that includes projected classes.
 * Used to distinguish real classes from simulated ones.
 */
interface ClassWithProjection extends Class {
  isAssumed?: boolean;
}

/**
 * Main system use case: Calculates classroom requirements.
 *
 * @description This use case implements the core business of the system, calculating
 * how many rooms of each size (S, M, L) are needed for a given year/semester,
 * considering:
 * - Dropout rate configured in parameters
 * - Capacity of each room type
 * - Projection of future classes when necessary
 *
 * @example
 * ```typescript
 * // Calculate requirements for 2025, 1st semester
 * const result = await calculateRoomRequirementsUseCase.execute(2025, 1);
 *
 * // Result includes:
 * // - totalRoomsRequired: { small: 5, medium: 10, big: 3 }
 * // - exceededLimits: classes exceeding maximum capacity
 * // - details: detailed information per class
 * ```
 */
@Injectable()
export class CalculateRoomRequirementsUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly calculationParametersRepository: CalculationParametersRepository,
    private readonly classProjectionService: ClassProjectionService,
    private readonly classRepository?: ClassRepository,
  ) {}

  /**
   * Executes the room requirements calculation.
   *
   * @param requestedYear - Year for calculation (optional, uses current year if not provided)
   * @param requestedSemester - Semester for calculation (1 or 2, optional)
   * @returns Object containing total rooms required, exceeded limits, and details
   * @throws NotFoundException - When calculation parameters are not configured
   */
  async execute(requestedYear?: number, requestedSemester?: number) {
    const courses = await this.courseRepository.findAll();
    const paramsList = await this.calculationParametersRepository.findAll();

    if (!paramsList || paramsList.length === 0)
      throw new NotFoundException('Calculation parameters not found');

    const params = paramsList[0];
    const dropout = Number(params.dropoutPercentage);

    const smallCap = params.studentsPerSmallRoom;
    const medCap = params.studentsPerMediumRoom;
    const bigCap = params.studentsPerBigRoom;

    const realClasses = this.classRepository
      ? await this.classRepository.findAll()
      : [];

    let allClasses: ClassWithProjection[] = [...realClasses];

    // 1. Aplica a projeção se houver ano solicitado
    if (requestedYear) {
      const projectedClasses =
        await this.classProjectionService.projectMissingClasses(
          requestedYear,
          courses,
          realClasses,
        );

      // Une turmas reais com virtuais
      allClasses = [...realClasses, ...projectedClasses];
    }

    // 2. Inicializa contadores
    let totalSmall = 0;
    let totalMedium = 0;
    let totalBig = 0;

    const exceededLimits: Array<{
      type: 'Class'; // Removi 'Course' já que tudo agora é tratado como turma
      name: string;
      studentCount: number;
      maxLimit: number;
      isProjected?: boolean;
    }> = [];

    // 3. Filtra turmas ativas no ano solicitado
    const classesFiltered = allClasses.filter((cls) => {
      if (!requestedYear) return true;

      const course = cls.course;
      if (!course?.periodQuantities) return true;

      const periods = Number(course.periodQuantities) || 0;
      const durationYears = Math.ceil(periods / 2);

      const startYear = Number(cls.year) || 0;
      const lastActiveYear = startYear + Math.max(1, durationYears) - 1;

      // Filtra por ano
      const isInYearRange =
        requestedYear >= startYear && requestedYear <= lastActiveYear;

      // Se não especificou semestre, retorna apenas baseado no ano
      if (!requestedSemester) return isInYearRange;

      // Se especificou semestre, filtra também por semestre
      if (!isInYearRange) return false;

      // Calcula o "semestre acadêmico" da turma no ano/semestre solicitado
      const academicSemester =
        (requestedYear - startYear) * 2 +
        (requestedSemester - cls.semester) +
        1;

      // A turma está ativa se o semestre acadêmico for positivo e não exceder a duração do curso
      const isActive = academicSemester > 0 && academicSemester <= periods;

      return isActive;
    });

    // 4. Processa APENAS as turmas (Reais + Projetadas)
    const classesSummary = classesFiltered.map((cls) => {
      // Se for projetada, usa vacancies do curso. Se real, usa currentStudents.
      const expected = cls.isAssumed
        ? (cls.course?.vacancies ?? 0)
        : (cls.currentStudents ?? 0);

      let afterDropout = expected;
      let currentSemester = cls.semester;

      if (requestedYear && cls.year && requestedSemester) {
        const academicSemester =
          (requestedYear - cls.year) * 2 +
          (requestedSemester - cls.semester) +
          1;
        currentSemester = academicSemester;

        const semestersPassed = academicSemester - 1;
        for (let i = 0; i < semestersPassed; i++) {
          afterDropout *= 1 - dropout / 100;
        }
      }
      afterDropout = Math.ceil(afterDropout);
      let sizeCode: 'P' | 'M' | 'G' | 'EXCEDIDO' | null = null;

      let identifier = cls.course?.name
        ? `${cls.course.name} (Turma ${cls.id})`
        : `Turma ${cls.id}`;

      if (cls.isAssumed) {
        identifier += ' [PROJEÇÃO]';
      }

      if (afterDropout > 0) {
        if (afterDropout > bigCap) {
          sizeCode = 'EXCEDIDO';
          exceededLimits.push({
            type: 'Class',
            name: identifier,
            studentCount: afterDropout,
            maxLimit: bigCap,
            isProjected: cls.isAssumed,
          });
        } else if (afterDropout > medCap) {
          sizeCode = 'G';
          totalBig++;
        } else if (afterDropout > smallCap) {
          sizeCode = 'M';
          totalMedium++;
        } else {
          sizeCode = 'P';
          totalSmall++;
        }
      }

      return {
        classId: cls.id,
        courseName: cls.course?.name ?? null,
        studentCount: afterDropout,
        roomSize: sizeCode,
        isAssumed: cls.isAssumed || false,
        startYear: cls.year,
        semester: currentSemester,
      };
    });

    return {
      exceededLimits,
      totalRoomsRequired: {
        small: totalSmall,
        medium: totalMedium,
        big: totalBig,
      },
      details: {
        // Removida a propriedade 'courses', retornando apenas as turmas processadas
        classes: classesSummary,
      },
      metadata: {
        requestedYear,
        requestedSemester,
        isProjection: requestedYear > new Date().getFullYear(),
        simulatedClassesCount: allClasses.length - realClasses.length,
      },
    };
  }
}
