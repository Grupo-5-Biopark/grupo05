import { Injectable } from '@nestjs/common';
import { RoomsRepository } from '../../infrastructure/repositories/rooms.repository';
import { Rooms } from '../../domain/entities/rooms.entity';

@Injectable()
export class FindAllRoomsUseCase {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async execute(): Promise<Rooms[]> {
    return await this.roomsRepository.findAll();
  }
}
