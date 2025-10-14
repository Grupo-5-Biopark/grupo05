import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../domain/entities/course.entity';

@Injectable()
export class CourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
  ) {}

  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.repository.create(courseData);
    return await this.repository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return await this.repository.find();
  }

  async findById(id: number): Promise<Course | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByName(name: string): Promise<Course | null> {
    return await this.repository.findOneBy({ name });
  }

  async update(id: number, courseData: Partial<Course>): Promise<void> {
    await this.repository.update(id, courseData);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
