import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationParameters } from './domain/entities/calculation-parameters.entity';
import { CalculationParametersRepository } from './infrastructure/repositories/calculation-parameters.repository';
import { CalculationParametersController } from './presentation/controllers/calculation-parameters.controller';
import { CreateCalculationParametersUseCase } from './application/use-cases/create-calculation-parameters.usecase';
import { FindAllCalculationParametersUseCase } from './application/use-cases/find-all-calculation-parameters.usecase';
import { FindCalculationParametersByIdUseCase } from './application/use-cases/find-calculation-parameters-by-id.usecase';
import { UpdateCalculationParametersUseCase } from './application/use-cases/update-calculation-parameters.usecase';
import { DeleteCalculationParametersUseCase } from './application/use-cases/delete-calculation-parameters.usecase';
import { CalculationParametersSeeder } from './infrastructure/seeder/calculation-parameters.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([CalculationParameters])],
  controllers: [CalculationParametersController],
  providers: [
    CalculationParametersRepository,
    CreateCalculationParametersUseCase,
    FindAllCalculationParametersUseCase,
    FindCalculationParametersByIdUseCase,
    UpdateCalculationParametersUseCase,
    DeleteCalculationParametersUseCase,
    CalculationParametersSeeder,
  ],
  exports: [
    CalculationParametersRepository,
    FindCalculationParametersByIdUseCase,
  ],
})
export class CalculationParametersModule {}
