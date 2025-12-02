import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { CreateRoomsUseCase } from '../../application/use-cases/create-rooms.usecase';
import { FindAllRoomsUseCase } from '../../application/use-cases/find-all-rooms.usecase';
import { FindRoomsByIdUseCase } from '../../application/use-cases/find-rooms-by-id.usecase';
import { UpdateRoomsUseCase } from '../../application/use-cases/update-rooms.usecase';
import { DeleteRoomsUseCase } from '../../application/use-cases/delete-rooms.usecase';
import { CreateRoomsDto } from '../dtos/create-rooms.dto';
import { UpdateRoomsDto } from '../dtos/update-rooms.dto';
import { Rooms } from '../../domain/entities/rooms.entity';
import { Class } from '../../../classes/domain/entities/class.entity';

describe('RoomsController', () => {
  let controller: RoomsController;
  let createRoomsUseCase: CreateRoomsUseCase;
  let findAllRoomsUseCase: FindAllRoomsUseCase;
  let findRoomsByIdUseCase: FindRoomsByIdUseCase;
  let updateRoomsUseCase: UpdateRoomsUseCase;
  let deleteRoomsUseCase: DeleteRoomsUseCase;

  const mockRoom: Rooms = {
    id: 1,
    block: 'Bloco A',
    number: 101,
    size: 'G',
    classId: 1,
    class: undefined as unknown as Class,
  };

  const mockCreateRoomsUseCase = {
    execute: jest.fn(),
  };

  const mockFindAllRoomsUseCase = {
    execute: jest.fn(),
  };

  const mockFindRoomsByIdUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateRoomsUseCase = {
    execute: jest.fn(),
  };

  const mockDeleteRoomsUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        { provide: CreateRoomsUseCase, useValue: mockCreateRoomsUseCase },
        { provide: FindAllRoomsUseCase, useValue: mockFindAllRoomsUseCase },
        { provide: FindRoomsByIdUseCase, useValue: mockFindRoomsByIdUseCase },
        { provide: UpdateRoomsUseCase, useValue: mockUpdateRoomsUseCase },
        { provide: DeleteRoomsUseCase, useValue: mockDeleteRoomsUseCase },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
    createRoomsUseCase = module.get<CreateRoomsUseCase>(CreateRoomsUseCase);
    findAllRoomsUseCase = module.get<FindAllRoomsUseCase>(FindAllRoomsUseCase);
    findRoomsByIdUseCase =
      module.get<FindRoomsByIdUseCase>(FindRoomsByIdUseCase);
    updateRoomsUseCase = module.get<UpdateRoomsUseCase>(UpdateRoomsUseCase);
    deleteRoomsUseCase = module.get<DeleteRoomsUseCase>(DeleteRoomsUseCase);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a room and return response dto', async () => {
      const createDto: CreateRoomsDto = {
        block: 'Bloco A',
        number: 101,
        size: 'G',
        classId: 1,
      };

      mockCreateRoomsUseCase.execute.mockResolvedValue(mockRoom);

      const result = await controller.create(createDto);

      expect(createRoomsUseCase.execute).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        id: mockRoom.id,
        block: mockRoom.block,
        number: mockRoom.number,
        size: mockRoom.size,
        classId: mockRoom.classId,
      });
    });
  });

  describe('findAll', () => {
    it('should return all rooms as response dtos', async () => {
      const mockRooms: Rooms[] = [
        mockRoom,
        {
          id: 2,
          block: 'Bloco B',
          number: 202,
          size: 'M',
          classId: 2,
          class: undefined as unknown as Class,
        },
      ];

      mockFindAllRoomsUseCase.execute.mockResolvedValue(mockRooms);

      const result = await controller.findAll();

      expect(findAllRoomsUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        block: 'Bloco A',
        number: 101,
        size: 'G',
        classId: 1,
      });
    });

    it('should return empty array when no rooms exist', async () => {
      mockFindAllRoomsUseCase.execute.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a room by id as response dto', async () => {
      mockFindRoomsByIdUseCase.execute.mockResolvedValue(mockRoom);

      const result = await controller.findOne(1);

      expect(findRoomsByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: mockRoom.id,
        block: mockRoom.block,
        number: mockRoom.number,
        size: mockRoom.size,
        classId: mockRoom.classId,
      });
    });
  });

  describe('update', () => {
    it('should update a room', async () => {
      const updateDto: UpdateRoomsDto = {
        block: 'Bloco B',
        number: 202,
        size: 'M',
      };

      mockUpdateRoomsUseCase.execute.mockResolvedValue(undefined);

      await controller.update(1, updateDto);

      expect(updateRoomsUseCase.execute).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a room', async () => {
      mockDeleteRoomsUseCase.execute.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(deleteRoomsUseCase.execute).toHaveBeenCalledWith(1);
    });
  });
});
