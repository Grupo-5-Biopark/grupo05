import { Injectable, OnModuleInit } from '@nestjs/common';
import { CalculationParametersRepository } from '../repositories/calculation-parameters.repository';

@Injectable()
export class CalculationParametersSeeder implements OnModuleInit {
  constructor(private readonly repository: CalculationParametersRepository) {}

  async onModuleInit(): Promise<void> {
    const count = await this.repository.count();
    if (count === 0) {
      await this.repository.create({
        dropoutPercentage: 0,
        studentsPerSmallRoom: 10,
        studentsPerMediumRoom: 20,
        studentsPerBigRoom: 30,
      });
    }
  }
}
