import { Injectable } from '@nestjs/common';
import { ShiftRepository } from '../../infrastructure/repositories/shift.repository';
import { Shift } from '../../domain/entities/shift.entity';

@Injectable()
export class FindAllShiftsUseCase {
  constructor(private readonly shiftRepository: ShiftRepository) {}

  async execute(): Promise<Shift[]> {
    return await this.shiftRepository.findAll();
  }
}
