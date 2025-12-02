import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateRoomsUseCase } from '../../application/use-cases/create-rooms.usecase';
import { FindAllRoomsUseCase } from '../../application/use-cases/find-all-rooms.usecase';
import { FindRoomsByIdUseCase } from '../../application/use-cases/find-rooms-by-id.usecase';
import { UpdateRoomsUseCase } from '../../application/use-cases/update-rooms.usecase';
import { DeleteRoomsUseCase } from '../../application/use-cases/delete-rooms.usecase';
import { CreateRoomsDto } from '../dtos/create-rooms.dto';
import { UpdateRoomsDto } from '../dtos/update-rooms.dto';
import { RoomsResponseDto } from '../dtos/rooms-response.dto';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
@ApiTags('Rooms')
@ApiBearerAuth()
export class RoomsController {
  constructor(
    private readonly createRoomsUseCase: CreateRoomsUseCase,
    private readonly findAllRoomsesUseCase: FindAllRoomsUseCase,
    private readonly findRoomsByIdUseCase: FindRoomsByIdUseCase,
    private readonly updateRoomsUseCase: UpdateRoomsUseCase,
    private readonly deleteRoomsUseCase: DeleteRoomsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new rooms' })
  async create(
    @Body() createRoomsDto: CreateRoomsDto,
  ): Promise<RoomsResponseDto> {
    const roomsEntity = await this.createRoomsUseCase.execute(createRoomsDto);
    return {
      id: roomsEntity.id,
      block: roomsEntity.block,
      number: roomsEntity.number,
      size: roomsEntity.size,
      courseId: roomsEntity.courseId,
      classId: roomsEntity.classId,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  async findAll(): Promise<RoomsResponseDto[]> {
    const rooms = await this.findAllRoomsesUseCase.execute();
    return rooms.map((roomsEntity) => ({
      id: roomsEntity.id,
      block: roomsEntity.block,
      number: roomsEntity.number,
      size: roomsEntity.size,
      courseId: roomsEntity.courseId,
      classId: roomsEntity.classId,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rooms by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RoomsResponseDto> {
    const roomsEntity = await this.findRoomsByIdUseCase.execute(id);
    return {
      id: roomsEntity.id,
      block: roomsEntity.block,
      number: roomsEntity.number,
      size: roomsEntity.size,
      courseId: roomsEntity.courseId,
      classId: roomsEntity.classId,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update rooms' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomsDto: UpdateRoomsDto,
  ): Promise<void> {
    await this.updateRoomsUseCase.execute(id, updateRoomsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete room' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteRoomsUseCase.execute(id);
  }
}
