import { Injectable, Logger } from '@nestjs/common';
import { CreateClassUseCase } from '../../../classes/application/use-cases/create-class.usecase';
import { CreateClassDto } from '../../../classes/presentation/dtos/create-class.dto';
import { Class as ClassEntity } from '../../../classes/domain/entities/class.entity';

@Injectable()
export class ClassProjectionService {
  private readonly logger = new Logger(ClassProjectionService.name);

  constructor(private readonly createClassUseCase: CreateClassUseCase) {}
  async projectMissingClasses(
    targetYear: number,
    courses: Array<{
      id: number;
      shiftId?: number;
      semester?: number;
      vacancies?: number;
      name?: string;
    }>,
    existingClasses: Array<{ year: number }>,
  ): Promise<ClassEntity[]> {
    const createdClasses: ClassEntity[] = [];
    const existingYears = new Set(existingClasses.map((c) => Number(c.year)));

    const LOOKBACK_LIMIT = 10;
    let currentYearCheck = targetYear;

    while (true) {
      if (existingYears.has(currentYearCheck)) {
        break;
      }

      for (const course of courses) {
        const createDto: CreateClassDto = {
          courseId: course.id,

          shiftId: course.shiftId ?? 1,
          year: currentYearCheck,

          semester: course.semester ?? 1,
          currentStudents: course.vacancies ?? 0,
          isAssumed: true,
        };

        try {
          const created = await this.createClassUseCase.execute(createDto);
          createdClasses.push(created);
        } catch (err) {
          this.logger.error(
            `Failed to create projected class for course ${course.id} year ${currentYearCheck}: ${
              (err as Error).message || err
            }`,
          );
        }
      }

      currentYearCheck--;

      if (targetYear - currentYearCheck > LOOKBACK_LIMIT) {
        break;
      }
    }
    return createdClasses;
  }
}
