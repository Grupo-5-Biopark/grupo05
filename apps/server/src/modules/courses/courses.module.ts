import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './domain/entities/course.entity';
import { CourseRepository } from './infrastructure/repositories/course.repository';
import { CourseController } from './presentation/controllers/course.controller';
import { CreateCourseUseCase } from './application/use-cases/create-course.usecase';
import { FindAllCoursesUseCase } from './application/use-cases/find-all-courses.usecase';
import { FindCourseByIdUseCase } from './application/use-cases/find-course-by-id.usecase';
import { UpdateCourseUseCase } from './application/use-cases/update-course.usecase';
import { DeleteCourseUseCase } from './application/use-cases/delete-course.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  controllers: [CourseController],
  providers: [
    CourseRepository,
    CreateCourseUseCase,
    FindAllCoursesUseCase,
    FindCourseByIdUseCase,
    UpdateCourseUseCase,
    DeleteCourseUseCase,
  ],
  exports: [CourseRepository, FindCourseByIdUseCase],
})
export class CoursesModule {}
