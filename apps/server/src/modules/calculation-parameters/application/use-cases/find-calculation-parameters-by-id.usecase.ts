import { Injectable, NotFoundException } from '@nestjs/common';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

@Injectable()
export class FindCalculationParametersByIdUseCase {
  constructor(private readonly repository: CalculationParametersRepository) {}

  async execute(): Promise<CalculationParameters> {
    const all = await this.repository.findAll();
    if (!all || all.length === 0)
      throw new NotFoundException('Calculation parameters not found');
    return all[0];
  }
}
