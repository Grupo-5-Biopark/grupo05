import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

@Injectable()
export class CalculationParametersRepository {
  constructor(
    @InjectRepository(CalculationParameters)
    private readonly repository: Repository<CalculationParameters>,
  ) {}

  async create(
    data: Partial<CalculationParameters>,
  ): Promise<CalculationParameters> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findAll(): Promise<CalculationParameters[]> {
    return await this.repository.find();
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async findById(id: number): Promise<CalculationParameters | null> {
    return await this.repository.findOneBy({ id });
  }

  async update(
    id: number,
    data: Partial<CalculationParameters>,
  ): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
