import { Injectable } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { UpdateCourseDto } from '../../presentation/dtos/update-course.dto';
import { CourseNotFoundException } from '../../domain/exceptions/course-not-found.exception';
import { DuplicateCourseNameException } from '../../domain/exceptions/duplicate-course-name.exception';

@Injectable()
export class UpdateCourseUseCase {
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(id: number, data: UpdateCourseDto): Promise<void> {
    const existingCourse = await this.courseRepository.findById(id);
    if (!existingCourse) {
      throw new CourseNotFoundException(id);
    }

    // Check if the new name already exists (if name is being updated)
    if (data.name && data.name !== existingCourse.name) {
      const courseWithSameName = await this.courseRepository.findByName(
        data.name,
      );
      if (courseWithSameName) {
        throw new DuplicateCourseNameException(data.name);
      }
    }

    await this.courseRepository.update(id, data);
  }
}
