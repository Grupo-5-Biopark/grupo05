import { Injectable, NotFoundException } from '@nestjs/common';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

@Injectable()
export class UpdateCalculationParametersUseCase {
  constructor(private readonly repository: CalculationParametersRepository) {}

  async execute(
    id: number,
    data: Partial<CalculationParameters>,
  ): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing)
      throw new NotFoundException('Calculation parameters not found');
    await this.repository.update(id, data);
  }
}
