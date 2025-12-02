import { Test, TestingModule } from '@nestjs/testing';
import { FindRoomsByIdUseCase } from './find-rooms-by-id.usecase';
import { RoomsRepository } from '../../infrastructure/repositories/rooms.repository';
import { Rooms } from '../../domain/entities/rooms.entity';
import { RoomsNotFoundException } from '../../domain/exceptions/room-not-found.exception';
import { Class } from '../../../classes/domain/entities/class.entity';

describe('FindRoomsByIdUseCase', () => {
  let useCase: FindRoomsByIdUseCase;
  let repository: RoomsRepository;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindRoomsByIdUseCase,
        { provide: RoomsRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindRoomsByIdUseCase>(FindRoomsByIdUseCase);
    repository = module.get<RoomsRepository>(RoomsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a room when found', async () => {
      const mockRoom: Rooms = {
        id: 1,
        block: 'Bloco A',
        number: 101,
        size: 'G',
        classId: 1,
        class: undefined as unknown as Class,
      };

      mockRepository.findById.mockResolvedValue(mockRoom);

      const result = await useCase.execute(1);

      expect(result).toEqual(mockRoom);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw RoomsNotFoundException when room is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(
        RoomsNotFoundException,
      );
    });

    it('should throw an error when repository fails', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(1)).rejects.toThrow('Database error');
    });
  });
});
