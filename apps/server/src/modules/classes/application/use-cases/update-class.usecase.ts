import { Injectable } from '@nestjs/common';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { UpdateClassDto } from '../../presentation/dtos/update-class.dto';
import { ClassNotFoundException } from '../../domain/exceptions/class-not-found.exception';

@Injectable()
export class UpdateClassUseCase {
  constructor(private readonly classRepository: ClassRepository) {}

  async execute(id: number, data: UpdateClassDto): Promise<void> {
    const existingClass = await this.classRepository.findById(id);
    if (!existingClass) {
      throw new ClassNotFoundException(id);
    }

    await this.classRepository.update(id, data);
  }
}
