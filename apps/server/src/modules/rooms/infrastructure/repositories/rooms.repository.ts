import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rooms } from '../../domain/entities/rooms.entity';

@Injectable()
export class RoomsRepository {
  constructor(
    @InjectRepository(Rooms)
    private readonly repository: Repository<Rooms>,
  ) {}

  async create(roomsData: Partial<Rooms>): Promise<Rooms> {
    const roomsEntity = this.repository.create(roomsData);
    return await this.repository.save(roomsEntity);
  }

  async findAll(): Promise<Rooms[]> {
    return await this.repository.find();
  }

  async findById(id: number): Promise<Rooms | null> {
    return await this.repository.findOneBy({ id });
  }

  async update(id: number, roomsData: Partial<Rooms>): Promise<void> {
    await this.repository.update(id, roomsData);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
