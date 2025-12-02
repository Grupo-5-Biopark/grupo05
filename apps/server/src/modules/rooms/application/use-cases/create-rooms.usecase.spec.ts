import { Test, TestingModule } from '@nestjs/testing';
import { CreateRoomsUseCase } from './create-rooms.usecase';
import { RoomsRepository } from '../../infrastructure/repositories/rooms.repository';
import { CreateRoomsDto } from '../../presentation/dtos/create-rooms.dto';
import { Rooms } from '../../domain/entities/rooms.entity';
import { Class } from '../../../classes/domain/entities/class.entity';
import { Course } from '../../../courses/domain/entities/course.entity';

describe('CreateRoomsUseCase', () => {
  let useCase: CreateRoomsUseCase;
  let repository: RoomsRepository;

  const mockRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoomsUseCase,
        { provide: RoomsRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateRoomsUseCase>(CreateRoomsUseCase);
    repository = module.get<RoomsRepository>(RoomsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateRoomsDto = {
      block: 'Bloco A',
      number: 101,
      size: 'G',
    };

    it('should create a room successfully', async () => {
      const mockRoom: Rooms = {
        id: 1,
        block: dto.block,
        number: dto.number,
        size: dto.size,
        courseId: undefined as unknown as number,
        course: undefined as unknown as Course,
        classId: undefined as unknown as number,
        class: undefined as unknown as Class,
      };

      mockRepository.create.mockResolvedValue(mockRoom);

      const result = await useCase.execute(dto);

      expect(result).toEqual(mockRoom);
      expect(repository.create).toHaveBeenCalled();
    });

    it('should create a room with classId when provided', async () => {
      const dtoWithClassId: CreateRoomsDto = {
        block: 'Bloco B',
        number: 202,
        size: 'M',
        classId: 5,
      };

      const mockRoom: Rooms = {
        id: 2,
        block: dtoWithClassId.block,
        number: dtoWithClassId.number,
        size: dtoWithClassId.size,
        courseId: undefined as unknown as number,
        course: undefined as unknown as Course,
        classId: 5,
        class: undefined as unknown as Class,
      };

      mockRepository.create.mockResolvedValue(mockRoom);

      const result = await useCase.execute(dtoWithClassId);

      expect(result).toEqual(mockRoom);
      expect(result.classId).toBe(5);
    });

    it('should throw an error when repository fails', async () => {
      mockRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(dto)).rejects.toThrow('Database error');
    });
  });
});
