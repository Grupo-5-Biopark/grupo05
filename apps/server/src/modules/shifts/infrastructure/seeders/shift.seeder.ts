import { Injectable, Logger } from '@nestjs/common';
import { ShiftRepository } from '../repositories/shift.repository';

@Injectable()
export class ShiftSeeder {
  private readonly logger = new Logger(ShiftSeeder.name);

  constructor(private readonly shiftRepository: ShiftRepository) {}

  async seed(): Promise<void> {
    const shifts = [
      { name: 'Morning' },
      { name: 'Afternoon' },
      { name: 'Night' },
    ];

    for (const shiftData of shifts) {
      const existingShift = await this.shiftRepository.findByName(
        shiftData.name,
      );
      if (!existingShift) {
        await this.shiftRepository.create(shiftData);
        this.logger.log(`Created shift: ${shiftData.name}`);
      }
    }
  }
}
