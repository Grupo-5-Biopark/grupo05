import { Injectable } from '@nestjs/common';
import { RoomsRepository } from '../../infrastructure/repositories/rooms.repository';
import { Rooms } from '../../domain/entities/rooms.entity';
import { RoomsNotFoundException } from '../../domain/exceptions/room-not-found.exception';

@Injectable()
export class FindRoomsByIdUseCase {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async execute(id: number): Promise<Rooms> {
    const roomsEntity = await this.roomsRepository.findById(id);
    if (!roomsEntity) {
      throw new RoomsNotFoundException(id);
    }
    return roomsEntity;
  }
}
