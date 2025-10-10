import { Injectable } from '@nestjs/common';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { Course } from '../../domain/entities/course.entity';

@Injectable()
export class FindAllCoursesUseCase {
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(): Promise<Course[]> {
    return await this.courseRepository.findAll();
  }
}
