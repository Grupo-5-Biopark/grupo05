import { Injectable } from '@nestjs/common';
import { RoomsRepository } from '../../infrastructure/repositories/rooms.repository';
import { UpdateRoomsDto } from '../../presentation/dtos/update-rooms.dto';
import { RoomsNotFoundException } from '../../domain/exceptions/room-not-found.exception';

@Injectable()
export class UpdateRoomsUseCase {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async execute(id: number, data: UpdateRoomsDto): Promise<void> {
    const existingRooms = await this.roomsRepository.findById(id);
    if (!existingRooms) {
      throw new RoomsNotFoundException(id);
    }

    // Allow updating classId when provided
    const updateData: Partial<typeof existingRooms> = { ...data };
    await this.roomsRepository.update(id, updateData);
  }
}
