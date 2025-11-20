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

    // DTO guarantees camelCase properties (we keep @Transform to accept snake_case inputs),
    // so normalize using camelCase only.
    const payload: Partial<any> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.knowledgeArea !== undefined)
      payload.knowledgeArea = data.knowledgeArea;
    if (data.vacancies !== undefined) payload.vacancies = data.vacancies;
    if (data.periodQuantities !== undefined)
      payload.periodQuantities = data.periodQuantities;
    if (data.openingYear !== undefined) payload.openingYear = data.openingYear;

    await this.courseRepository.update(id, payload);
  }
}
