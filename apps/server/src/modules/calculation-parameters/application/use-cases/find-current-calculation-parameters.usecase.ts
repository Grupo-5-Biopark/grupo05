import { Injectable, NotFoundException } from '@nestjs/common';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

@Injectable()
export class FindCurrentCalculationParametersUseCase {
  constructor(private readonly repository: CalculationParametersRepository) {}

  async execute(): Promise<CalculationParameters> {
    const list = await this.repository.findAll();
    if (!list || list.length === 0) {
      throw new NotFoundException('Calculation parameters not found');
    }
    return list[0];
  }
}
