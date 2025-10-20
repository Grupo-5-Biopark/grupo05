import { Injectable } from '@nestjs/common';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { CreateClassDto } from '../../presentation/dtos/create-class.dto';
import { Class } from '../../domain/entities/class.entity';
import { InvalidClassDataException } from '../../domain/exceptions/invalid-class-data.exception';

@Injectable()
export class CreateClassUseCase {
  constructor(private readonly classRepository: ClassRepository) {}

  async execute(data: CreateClassDto): Promise<Class> {
    // Validação: currentStudents não pode ser maior que expectedStudents
    if (data.currentStudents > data.expectedStudents) {
      throw new InvalidClassDataException(
        'currentStudents cannot be greater than expectedStudents',
      );
    }

    // Verifica se já existe uma turma para o mesmo curso, turno, ano e semestre
    const existingClass = await this.classRepository.findByCourseAndShift(
      data.courseId,
      data.shiftId,
      data.year,
      data.semester,
    );

    if (existingClass) {
      throw new InvalidClassDataException(
        'Class already exists for this course, shift, year and semester',
      );
    }

    const classEntity = new Class();
    classEntity.courseId = data.courseId;
    classEntity.shiftId = data.shiftId;
    classEntity.year = data.year;
    classEntity.semester = data.semester;
    classEntity.expectedStudents = data.expectedStudents;
    classEntity.currentStudents = data.currentStudents;
    classEntity.dropoutRate = data.dropoutRate;

    return await this.classRepository.create(classEntity);
  }
}
