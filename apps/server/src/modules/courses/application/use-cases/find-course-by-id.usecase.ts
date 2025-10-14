import { Injectable } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { Course } from '../../domain/entities/course.entity';
import { CourseNotFoundException } from '../../domain/exceptions/course-not-found.exception';

@Injectable()
export class FindCourseByIdUseCase {
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(id: number): Promise<Course> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new CourseNotFoundException(id);
    }
    return course;
  }
}
