import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { ClassRepository } from '../../../classes/infrastructure/repositories/class.repository';
import { CalculationParametersRepository } from '../../../calculation-parameters/infrastructure/repositories/calculation-parameters.repository';

@Injectable()
export class CalculateRoomRequirementsUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly calculationParametersRepository: CalculationParametersRepository,
    private readonly classRepository?: ClassRepository,
  ) {}

  async execute(requestedYear?: number) {
    const courses = await this.courseRepository.findAll();
    const paramsList = await this.calculationParametersRepository.findAll();
    if (!paramsList || paramsList.length === 0)
      throw new NotFoundException('Calculation parameters not found');

    const params = paramsList[0];
    const dropout = Number(params.dropoutPercentage);

    const smallCap = params.studentsPerSmallRoom;
    const medCap = params.studentsPerMediumRoom;
    const bigCap = params.studentsPerBigRoom;

    let totalSmall = 0;
    let totalMedium = 0;
    let totalBig = 0;

    const exceededLimits: Array<{
      type: 'Course' | 'Class';
      name: string;
      studentCount: number;
      maxLimit: number;
    }> = [];

    const coursesSummary = courses.map((c) => {
      const expected = c.vacancies ?? 0;
      const afterDropout = Math.ceil(expected * (1 - dropout / 100));

      let sizeCode: 'P' | 'M' | 'G' | 'EXCEDIDO' | null = null;

      if (afterDropout > 0) {
        if (afterDropout > bigCap) {
          sizeCode = 'EXCEDIDO';
          exceededLimits.push({
            type: 'Course',
            name: c.name,
            studentCount: afterDropout,
            maxLimit: bigCap,
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
        courseName: c.name,
        studentCount: afterDropout,
        roomSize: sizeCode,
      };
    });

    const classes = this.classRepository
      ? await this.classRepository.findAll()
      : [];

    const classesFiltered = classes.filter((cls) => {
      if (!requestedYear) return true;
      const course = cls.course;
      if (!course || course.periodQuantities == null) return true;

      const periods = Number(course.periodQuantities) || 0;
      const durationYears = Math.ceil(periods / 2);
      const startYear = Number(cls.year) || 0;
      const lastActiveYear = startYear + Math.max(1, durationYears) - 1;

      return requestedYear >= startYear && requestedYear <= lastActiveYear;
    });

    const classesSummary = classesFiltered.map((cls) => {
      const expected = cls.currentStudents ?? 0;
      const afterDropout = Math.ceil(expected * (1 - dropout / 100));

      let sizeCode: 'P' | 'M' | 'G' | 'EXCEDIDO' | null = null;
      const identifier = cls.course?.name
        ? `${cls.course.name} (Turma ${cls.id})`
        : `Turma ${cls.id}`;

      if (afterDropout > 0) {
        if (afterDropout > bigCap) {
          sizeCode = 'EXCEDIDO';
          exceededLimits.push({
            type: 'Class',
            name: identifier,
            studentCount: afterDropout,
            maxLimit: bigCap,
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
        courses: coursesSummary,
        classes: classesSummary,
      },
    };
  }
}
