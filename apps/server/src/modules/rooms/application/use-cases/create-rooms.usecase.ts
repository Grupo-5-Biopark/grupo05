import { Injectable } from '@nestjs/common';
import { RoomsRepository } from '../../infrastructure/repositories/rooms.repository';
import { CreateRoomsDto } from '../../presentation/dtos/create-rooms.dto';
import { Rooms } from '../../domain/entities/rooms.entity';

@Injectable()
export class CreateRoomsUseCase {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async execute(data: CreateRoomsDto): Promise<Rooms> {
    const roomsEntity = new Rooms();
    roomsEntity.block = data.block;
    roomsEntity.number = data.number;
    roomsEntity.size = data.size;
    if (data.classId !== undefined) {
      roomsEntity.classId = data.classId;
    }

    return await this.roomsRepository.create(roomsEntity);
  }
}
