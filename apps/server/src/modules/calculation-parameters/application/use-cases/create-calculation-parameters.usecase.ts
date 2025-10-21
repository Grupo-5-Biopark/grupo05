import { Injectable, ConflictException } from '@nestjs/common';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

@Injectable()
export class CreateCalculationParametersUseCase {
  constructor(private readonly repository: CalculationParametersRepository) {}

  async execute(
    data: Partial<CalculationParameters>,
  ): Promise<CalculationParameters> {
    const existingCount = await this.repository.count();
    if (existingCount >= 1) {
      throw new ConflictException(
        'Only one set of calculation parameters is allowed',
      );
    }
    return await this.repository.create(data);
  }
}
