import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './domain/entities/class.entity';
import { ClassRepository } from './infrastructure/repositories/class.repository';
import { ClassController } from './presentation/controllers/class.controller';
import { CreateClassUseCase } from './application/use-cases/create-class.usecase';
import { FindAllClassesUseCase } from './application/use-cases/find-all-classes.usecase';
import { FindClassByIdUseCase } from './application/use-cases/find-class-by-id.usecase';
import { UpdateClassUseCase } from './application/use-cases/update-class.usecase';
import { DeleteClassUseCase } from './application/use-cases/delete-class.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Class])],
  controllers: [ClassController],
  providers: [
    ClassRepository,
    CreateClassUseCase,
    FindAllClassesUseCase,
    FindClassByIdUseCase,
    UpdateClassUseCase,
    DeleteClassUseCase,
  ],
  exports: [ClassRepository, FindClassByIdUseCase, CreateClassUseCase],
})
export class ClassesModule {}
