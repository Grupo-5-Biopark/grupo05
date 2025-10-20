import { Injectable } from '@nestjs/common';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { UpdateClassDto } from '../../presentation/dtos/update-class.dto';
import { ClassNotFoundException } from '../../domain/exceptions/class-not-found.exception';
import { InvalidClassDataException } from '../../domain/exceptions/invalid-class-data.exception';

@Injectable()
export class UpdateClassUseCase {
  constructor(private readonly classRepository: ClassRepository) {}

  async execute(id: number, data: UpdateClassDto): Promise<void> {
    const existingClass = await this.classRepository.findById(id);
    if (!existingClass) {
      throw new ClassNotFoundException(id);
    }

    // Validação: currentStudents não pode ser maior que expectedStudents
    const newCurrentStudents =
      data.currentStudents ?? existingClass.currentStudents;
    const newExpectedStudents =
      data.expectedStudents ?? existingClass.expectedStudents;

    if (newCurrentStudents > newExpectedStudents) {
      throw new InvalidClassDataException(
        'currentStudents cannot be greater than expectedStudents',
      );
    }

    await this.classRepository.update(id, data);
  }
}
