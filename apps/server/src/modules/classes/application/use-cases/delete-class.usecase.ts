import { Injectable } from '@nestjs/common';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { ClassNotFoundException } from '../../domain/exceptions/class-not-found.exception';

@Injectable()
export class DeleteClassUseCase {
  constructor(private readonly classRepository: ClassRepository) {}

  async execute(id: number): Promise<void> {
    const classEntity = await this.classRepository.findById(id);
    if (!classEntity) {
      throw new ClassNotFoundException(id);
    }

    await this.classRepository.delete(id);
  }
}
