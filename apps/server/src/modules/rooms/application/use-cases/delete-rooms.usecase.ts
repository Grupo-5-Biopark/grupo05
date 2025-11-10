import { Injectable } from '@nestjs/common';
import { RoomsRepository } from '../../infrastructure/repositories/rooms.repository';
import { RoomsNotFoundException } from '../../domain/exceptions/room-not-found.exception';

@Injectable()
export class DeleteRoomsUseCase {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async execute(id: number): Promise<void> {
    const classEntity = await this.roomsRepository.findById(id);
    if (!classEntity) {
      throw new RoomsNotFoundException(id);
    }

    await this.roomsRepository.delete(id);
  }
}
