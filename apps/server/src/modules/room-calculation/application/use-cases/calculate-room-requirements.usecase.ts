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

  async execute() {
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

    const coursesSummary = courses.map((c) => {
      const expected = c.expectedStudents ?? 0;
      const afterDropout = Math.ceil(expected * (1 - dropout / 100));

      let remaining = afterDropout;

      const big = bigCap > 0 ? Math.floor(remaining / bigCap) : 0;
      remaining = remaining - big * bigCap;

      const medium = medCap > 0 ? Math.floor(remaining / medCap) : 0;
      remaining = remaining - medium * medCap;

      let small = 0;
      if (smallCap > 0) {
        if (remaining > 0) {
          small = Math.ceil(remaining / smallCap);
        } else {
          small = 0;
        }
      }

      const primarySize =
        big > 0 ? 'G' : medium > 0 ? 'M' : small > 0 ? 'P' : null;

      if (primarySize === 'G') {
        totalBig++;
      } else if (primarySize === 'M') {
        totalMedium++;
      } else if (primarySize === 'P') {
        totalSmall++;
      }

      return {
        courseName: c.name,
        roomSize: primarySize,
      };
    });

    const classes = this.classRepository
      ? await this.classRepository.findAll()
      : [];

    let classesTotalSmall = 0;
    let classesTotalMedium = 0;
    let classesTotalBig = 0;

    const classesSummary = classes.map((cls) => {
      const expected = cls.currentStudents ?? 0;
      const afterDropout = Math.ceil(expected * (1 - dropout / 100));

      let remaining = afterDropout;

      const big = bigCap > 0 ? Math.floor(remaining / bigCap) : 0;
      remaining = remaining - big * bigCap;

      const medium = medCap > 0 ? Math.floor(remaining / medCap) : 0;
      remaining = remaining - medium * medCap;

      let small = 0;
      if (smallCap > 0) {
        if (remaining > 0) {
          small = Math.ceil(remaining / smallCap);
        } else {
          small = 0;
        }
      }

      const primarySize =
        big > 0 ? 'G' : medium > 0 ? 'M' : small > 0 ? 'P' : null;

      if (primarySize === 'G') {
        classesTotalBig++;
      } else if (primarySize === 'M') {
        classesTotalMedium++;
      } else if (primarySize === 'P') {
        classesTotalSmall++;
      }

      return {
        classId: cls.id,
        courseName: cls.course?.name ?? null,
        roomSize: primarySize,
      };
    });

    const combinedSmall = totalSmall + classesTotalSmall;
    const combinedMedium = totalMedium + classesTotalMedium;
    const combinedBig = totalBig + classesTotalBig;

    return {
      totalRooms: {
        small: combinedSmall,
        medium: combinedMedium,
        big: combinedBig,
      },
      courses: coursesSummary,
      classes: classesSummary,
    };
  }
}
