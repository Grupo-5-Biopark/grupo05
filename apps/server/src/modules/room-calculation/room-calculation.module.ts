import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../courses/domain/entities/course.entity';
import { Class } from '../classes/domain/entities/class.entity';
import { CalculationParameters } from '../calculation-parameters/domain/entities/calculation-parameters.entity';
import { CourseRepository } from '../courses/infrastructure/repositories/course.repository';
import { ClassRepository } from '../classes/infrastructure/repositories/class.repository';
import { CalculationParametersRepository } from '../calculation-parameters/infrastructure/repositories/calculation-parameters.repository';
import { CalculateRoomRequirementsUseCase } from './application/use-cases/calculate-room-requirements.usecase';
import { RoomCalculationController } from './presentation/controllers/room-calculation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Class, CalculationParameters])],
  controllers: [RoomCalculationController],
  providers: [
    CourseRepository,
    ClassRepository,
    CalculationParametersRepository,
    CalculateRoomRequirementsUseCase,
  ],
  exports: [CalculateRoomRequirementsUseCase],
})
export class RoomCalculationModule {}
