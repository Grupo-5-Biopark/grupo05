import { Injectable } from '@nestjs/common';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { Class } from '../../domain/entities/class.entity';

@Injectable()
export class FindAllClassesUseCase {
  constructor(private readonly classRepository: ClassRepository) {}

  async execute(): Promise<Class[]> {
    return await this.classRepository.findAll();
  }
}
