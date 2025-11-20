import { Injectable } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CreateCourseDto } from '../../presentation/dtos/create-course.dto';
import { Course } from '../../domain/entities/course.entity';
import { DuplicateCourseNameException } from '../../domain/exceptions/duplicate-course-name.exception';

interface PostgresError {
  code: string;
  detail: string;
}

function isPostgresError(error: unknown): error is PostgresError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'detail' in error &&
    typeof (error as PostgresError).code === 'string' &&
    typeof (error as PostgresError).detail === 'string'
  );
}

@Injectable()
export class CreateCourseUseCase {
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(data: CreateCourseDto): Promise<Course> {
    // Check if course name already exists
    const existingCourse = await this.courseRepository.findByName(data.name);
    if (existingCourse) {
      throw new DuplicateCourseNameException(data.name);
    }

    const course = new Course();
    course.name = data.name;
    course.knowledgeArea = data.knowledgeArea;
    course.vacancies = data.vacancies;
    course.periodQuantities = data.periodQuantities;
    course.openingYear = data.openingYear;

    try {
      return await this.courseRepository.create(course);
    } catch (error: unknown) {
      // If somehow a race condition occurred and the course name was created after our check
      if (
        isPostgresError(error) &&
        error.code === '23505' &&
        error.detail.includes('name')
      ) {
        throw new DuplicateCourseNameException(data.name);
      }
      throw error;
    }
  }
}
