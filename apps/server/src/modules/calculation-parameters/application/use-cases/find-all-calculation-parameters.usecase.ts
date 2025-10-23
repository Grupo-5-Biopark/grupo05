import { Injectable } from '@nestjs/common';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

@Injectable()
export class FindAllCalculationParametersUseCase {
  constructor(private readonly repository: CalculationParametersRepository) {}

  async execute(): Promise<CalculationParameters[]> {
    return await this.repository.findAll();
  }
}
