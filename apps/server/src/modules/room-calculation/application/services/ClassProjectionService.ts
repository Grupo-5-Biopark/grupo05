import { Injectable, Logger } from '@nestjs/common';
import { CreateClassUseCase } from '../../../classes/application/use-cases/create-class.usecase';
import { CreateClassDto } from '../../../classes/presentation/dtos/create-class.dto';
import { Class as ClassEntity } from '../../../classes/domain/entities/class.entity';
import { Course } from '../../../courses/domain/entities/course.entity';

interface CourseForProjection {
  id: number;
  shiftId?: number;
  semester?: number;
  vacancies?: number;
  name?: string;
  openingYear?: number;
}

interface ExistingClass {
  year: number;
  courseId: number;
}

@Injectable()
export class ClassProjectionService {
  private readonly logger = new Logger(ClassProjectionService.name);

  constructor(private readonly createClassUseCase: CreateClassUseCase) {}

  async projectMissingClasses(
    targetYear: number,
    courses: CourseForProjection[],
    existingClasses: ExistingClass[],
  ): Promise<ClassEntity[]> {
    const createdClasses: ClassEntity[] = [];

    // Mapa de cursos que já têm turma em cada ano: Map<courseId, Set<year>>
    const existingClassesByCourse = new Map<number, Set<number>>();
    for (const cls of existingClasses) {
      if (!existingClassesByCourse.has(cls.courseId)) {
        existingClassesByCourse.set(cls.courseId, new Set());
      }
      existingClassesByCourse.get(cls.courseId).add(Number(cls.year));
    }

    const currentYear = new Date().getFullYear();

    // Para cada curso, verifica se precisa criar turma projetada
    for (const course of courses) {
      const courseOpeningYear = course.openingYear ?? currentYear;

      // Só projeta se o curso já deveria ter começado
      if (courseOpeningYear > targetYear) {
        continue;
      }

      const courseExistingYears =
        existingClassesByCourse.get(course.id) ?? new Set();

      // Verifica se o curso já tem turma no ano alvo
      if (courseExistingYears.has(targetYear)) {
        continue;
      }

      // Cria turma projetada para o ano alvo
      const createDto: CreateClassDto = {
        courseId: course.id,
        shiftId: course.shiftId ?? 1,
        year: targetYear,
        semester: course.semester ?? 1,
        currentStudents: course.vacancies ?? 0,
        isAssumed: true,
      };

      try {
        const created = await this.createClassUseCase.execute(createDto);
        created.course = course as unknown as Course;
        createdClasses.push(created);
        this.logger.log(
          `Projected class created for course ${course.name ?? course.id} year ${targetYear}`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to create projected class for course ${course.id} year ${targetYear}: ${
            (err as Error).message || err
          }`,
        );
      }
    }

    return createdClasses;
  }
}
