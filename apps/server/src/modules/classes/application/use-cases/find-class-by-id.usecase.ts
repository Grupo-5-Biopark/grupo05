import { Injectable } from '@nestjs/common';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { Class } from '../../domain/entities/class.entity';
import { ClassNotFoundException } from '../../domain/exceptions/class-not-found.exception';

@Injectable()
export class FindClassByIdUseCase {
  constructor(private readonly classRepository: ClassRepository) {}

  async execute(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findById(id);
    if (!classEntity) {
      throw new ClassNotFoundException(id);
    }
    return classEntity;
  }
}
