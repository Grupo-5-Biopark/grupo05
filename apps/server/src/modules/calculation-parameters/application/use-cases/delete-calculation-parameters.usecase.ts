import { Injectable, NotFoundException } from '@nestjs/common';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';

@Injectable()
export class DeleteCalculationParametersUseCase {
  constructor(private readonly repository: CalculationParametersRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing)
      throw new NotFoundException('Calculation parameters not found');
    await this.repository.delete(id);
  }
}
