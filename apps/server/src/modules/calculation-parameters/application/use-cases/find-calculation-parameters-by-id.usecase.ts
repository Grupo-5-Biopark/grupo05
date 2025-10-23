import { Injectable, NotFoundException } from '@nestjs/common';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

@Injectable()
export class FindCalculationParametersByIdUseCase {
  constructor(private readonly repository: CalculationParametersRepository) {}

  async execute(id: number): Promise<CalculationParameters> {
    const params = await this.repository.findById(id);
    if (!params)
      throw new NotFoundException('Calculation parameters not found');
    return params;
  }
}
