import { Test, TestingModule } from '@nestjs/testing';
import { UpdateRoomsUseCase } from './update-rooms.usecase';
import { RoomsRepository } from '../../infrastructure/repositories/rooms.repository';
import { Rooms } from '../../domain/entities/rooms.entity';
import { UpdateRoomsDto } from '../../presentation/dtos/update-rooms.dto';
import { RoomsNotFoundException } from '../../domain/exceptions/room-not-found.exception';
import { Class } from '../../../classes/domain/entities/class.entity';
import { Course } from '../../../courses/domain/entities/course.entity';

describe('UpdateRoomsUseCase', () => {
  let useCase: UpdateRoomsUseCase;
  let repository: RoomsRepository;

  const mockRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRoomsUseCase,
        { provide: RoomsRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<UpdateRoomsUseCase>(UpdateRoomsUseCase);
    repository = module.get<RoomsRepository>(RoomsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const existingRoom: Rooms = {
      id: 1,
      block: 'Bloco A',
      number: 101,
      size: 'G',
      courseId: 1,
      course: undefined as unknown as Course,
      classId: 1,
      class: undefined as unknown as Class,
    };

    it('should update a room successfully', async () => {
      const updateDto: UpdateRoomsDto = {
        block: 'Bloco B',
        number: 202,
        size: 'M',
      };

      mockRepository.findById.mockResolvedValue(existingRoom);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, updateDto);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, {
        block: 'Bloco B',
        number: 202,
        size: 'M',
        courseId: null,
        classId: null,
      });
    });

    it('should throw RoomsNotFoundException when room is not found', async () => {
      const updateDto: UpdateRoomsDto = {
        block: 'Bloco B',
        number: 1,
        size: 'M',
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, updateDto)).rejects.toThrow(
        RoomsNotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const updateDto: UpdateRoomsDto = {
        size: 'P',
        block: 'Bloco A',
        number: 101,
      };

      mockRepository.findById.mockResolvedValue(existingRoom);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, updateDto);

      expect(repository.update).toHaveBeenCalledWith(1, {
        block: 'Bloco A',
        number: 101,
        size: 'P',
        courseId: null,
        classId: null,
      });
    });

    it('should throw an error when repository fails', async () => {
      const updateDto: UpdateRoomsDto = {
        block: 'Bloco C',
        number: 303,
        size: 'G',
      };

      mockRepository.findById.mockResolvedValue(existingRoom);
      mockRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(1, updateDto)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
