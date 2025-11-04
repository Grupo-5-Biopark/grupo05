import { Injectable, NotFoundException } from '@nestjs/common';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

@Injectable()
export class UpdateCalculationParametersUseCase {
  constructor(private readonly repository: CalculationParametersRepository) {}

  async execute(data: Partial<CalculationParameters>): Promise<void> {
    const all = await this.repository.findAll();
    if (!all || all.length === 0)
      throw new NotFoundException('Calculation parameters not found');
    const id = all[0].id;
    await this.repository.update(id, data);
  }
}
