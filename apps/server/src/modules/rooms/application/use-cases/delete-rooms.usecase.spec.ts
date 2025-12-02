import { Test, TestingModule } from '@nestjs/testing';
import { DeleteRoomsUseCase } from './delete-rooms.usecase';
import { RoomsRepository } from '../../infrastructure/repositories/rooms.repository';
import { Rooms } from '../../domain/entities/rooms.entity';
import { RoomsNotFoundException } from '../../domain/exceptions/room-not-found.exception';
import { Class } from '../../../classes/domain/entities/class.entity';
import { Course } from '../../../courses/domain/entities/course.entity';

describe('DeleteRoomsUseCase', () => {
  let useCase: DeleteRoomsUseCase;
  let repository: RoomsRepository;

  const mockRepository = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRoomsUseCase,
        { provide: RoomsRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteRoomsUseCase>(DeleteRoomsUseCase);
    repository = module.get<RoomsRepository>(RoomsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a room successfully', async () => {
      const mockRoom: Rooms = {
        id: 1,
        block: 'Bloco A',
        number: 101,
        size: 'G',
        courseId: 1,
        course: undefined as unknown as Course,
        classId: 1,
        class: undefined as unknown as Class,
      };

      mockRepository.findById.mockResolvedValue(mockRoom);
      mockRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw RoomsNotFoundException when room is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(
        RoomsNotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw an error when delete fails', async () => {
      const mockRoom: Rooms = {
        id: 1,
        block: 'Bloco A',
        number: 101,
        size: 'G',
        courseId: 1,
        course: undefined as unknown as Course,
        classId: 1,
        class: undefined as unknown as Class,
      };

      mockRepository.findById.mockResolvedValue(mockRoom);
      mockRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(1)).rejects.toThrow('Database error');
    });
  });
});
