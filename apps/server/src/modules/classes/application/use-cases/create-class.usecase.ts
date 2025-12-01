import { Injectable } from '@nestjs/common';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { CreateClassDto } from '../../presentation/dtos/create-class.dto';
import { Class } from '../../domain/entities/class.entity';

@Injectable()
export class CreateClassUseCase {
  constructor(private readonly classRepository: ClassRepository) {}

  async execute(data: CreateClassDto): Promise<Class> {
    const classEntity = new Class();
    classEntity.courseId = data.courseId;
    classEntity.shiftId = data.shiftId;
    classEntity.year = data.year;
    classEntity.semester = data.semester;
    classEntity.currentStudents = data.currentStudents;
    if (data.isAssumed !== undefined) {
      classEntity.isAssumed = data.isAssumed;
    }

    return await this.classRepository.create(classEntity);
  }
}
