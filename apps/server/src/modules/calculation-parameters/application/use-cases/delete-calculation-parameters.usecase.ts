import { Injectable, NotFoundException } from '@nestjs/common';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';

@Injectable()
export class DeleteCalculationParametersUseCase {
  constructor(private readonly repository: CalculationParametersRepository) {}

  async execute(): Promise<void> {
    const all = await this.repository.findAll();
    if (!all || all.length === 0)
      throw new NotFoundException('Calculation parameters not found');
    const id = all[0].id;
    await this.repository.delete(id);
  }
}
