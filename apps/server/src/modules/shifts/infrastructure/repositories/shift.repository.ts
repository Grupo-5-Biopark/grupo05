import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../../domain/entities/shift.entity';

@Injectable()
export class ShiftRepository {
  constructor(
    @InjectRepository(Shift)
    private readonly repository: Repository<Shift>,
  ) {}

  async findAll(): Promise<Shift[]> {
    return await this.repository.find();
  }

  async findById(id: number): Promise<Shift | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByName(name: string): Promise<Shift | null> {
    return await this.repository.findOneBy({ name });
  }

  async create(shiftData: Partial<Shift>): Promise<Shift> {
    const shift = this.repository.create(shiftData);
    return await this.repository.save(shift);
  }
}
