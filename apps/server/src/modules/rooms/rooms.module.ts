import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rooms } from './domain/entities/rooms.entity';
import { RoomsRepository } from './infrastructure/repositories/rooms.repository';
import { RoomsController } from './presentation/controllers/rooms.controller';
import { CreateRoomsUseCase } from './application/use-cases/create-rooms.usecase';
import { FindAllRoomsUseCase } from './application/use-cases/find-all-rooms.usecase';
import { FindRoomsByIdUseCase } from './application/use-cases/find-rooms-by-id.usecase';
import { UpdateRoomsUseCase } from './application/use-cases/update-rooms.usecase';
import { DeleteRoomsUseCase } from './application/use-cases/delete-rooms.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Rooms])],
  controllers: [RoomsController],
  providers: [
    RoomsRepository,
    CreateRoomsUseCase,
    FindAllRoomsUseCase,
    FindRoomsByIdUseCase,
    UpdateRoomsUseCase,
    DeleteRoomsUseCase,
  ],
  exports: [RoomsRepository, FindRoomsByIdUseCase],
})
export class RoomsModule {}
