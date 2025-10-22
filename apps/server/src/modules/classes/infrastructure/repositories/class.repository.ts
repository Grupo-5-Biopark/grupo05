import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../../domain/entities/class.entity';

@Injectable()
export class ClassRepository {
  constructor(
    @InjectRepository(Class)
    private readonly repository: Repository<Class>,
  ) {}

  async create(classData: Partial<Class>): Promise<Class> {
    const classEntity = this.repository.create(classData);
    return await this.repository.save(classEntity);
  }

  async findAll(): Promise<Class[]> {
    return await this.repository.find();
  }

  async findById(id: number): Promise<Class | null> {
    return await this.repository.findOneBy({ id });
  }

  async update(id: number, classData: Partial<Class>): Promise<void> {
    await this.repository.update(id, classData);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
