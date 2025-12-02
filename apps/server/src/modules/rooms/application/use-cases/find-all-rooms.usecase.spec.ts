import { Test, TestingModule } from '@nestjs/testing';
import { FindAllRoomsUseCase } from './find-all-rooms.usecase';
import { RoomsRepository } from '../../infrastructure/repositories/rooms.repository';
import { Rooms } from '../../domain/entities/rooms.entity';
import { Class } from '../../../classes/domain/entities/class.entity';

describe('FindAllRoomsUseCase', () => {
  let useCase: FindAllRoomsUseCase;
  let repository: RoomsRepository;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllRoomsUseCase,
        { provide: RoomsRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindAllRoomsUseCase>(FindAllRoomsUseCase);
    repository = module.get<RoomsRepository>(RoomsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all rooms', async () => {
      const mockRooms: Rooms[] = [
        {
          id: 1,
          block: 'Bloco A',
          number: 101,
          size: 'G',
          classId: 1,
          class: undefined as unknown as Class,
        },
        {
          id: 2,
          block: 'Bloco B',
          number: 202,
          size: 'M',
          classId: 2,
          class: undefined as unknown as Class,
        },
      ];

      mockRepository.findAll.mockResolvedValue(mockRooms);

      const result = await useCase.execute();

      expect(result).toEqual(mockRooms);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no rooms exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
    });

    it('should throw an error when repository fails', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute()).rejects.toThrow('Database error');
    });
  });
});
