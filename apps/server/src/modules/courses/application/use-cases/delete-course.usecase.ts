import { Injectable } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CourseNotFoundException } from '../../domain/exceptions/course-not-found.exception';

@Injectable()
export class DeleteCourseUseCase {
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(id: number): Promise<void> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new CourseNotFoundException(id);
    }

    await this.courseRepository.delete(id);
  }
}
