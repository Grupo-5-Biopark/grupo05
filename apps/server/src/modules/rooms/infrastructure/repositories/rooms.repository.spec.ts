import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomsRepository } from './rooms.repository';
import { Rooms } from '../../domain/entities/rooms.entity';
import { Class } from '../../../classes/domain/entities/class.entity';
import { Course } from '../../../courses/domain/entities/course.entity';

describe('RoomsRepository', () => {
  let roomsRepository: RoomsRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<Rooms>>;

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

  beforeEach(async () => {
    mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<Rooms>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsRepository,
        {
          provide: getRepositoryToken(Rooms),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    roomsRepository = module.get<RoomsRepository>(RoomsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(roomsRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a room', async () => {
      const createRoomData: Partial<Rooms> = {
        block: 'Bloco A',
        number: 101,
        size: 'G',
        classId: 1,
      };

      mockTypeOrmRepository.create.mockReturnValue(mockRoom);
      mockTypeOrmRepository.save.mockResolvedValue(mockRoom);

      const result = await roomsRepository.create(createRoomData);

      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(createRoomData);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockRoom);
      expect(result).toEqual(mockRoom);
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const mockRooms: Rooms[] = [
        mockRoom,
        {
          id: 2,
          block: 'Bloco B',
          number: 202,
          size: 'M',
          courseId: 2,
          course: undefined as unknown as Course,
          classId: 2,
          class: undefined as unknown as Class,
        },
      ];

      mockTypeOrmRepository.find.mockResolvedValue(mockRooms);

      const result = await roomsRepository.findAll();

      expect(mockTypeOrmRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRooms);
    });

    it('should return empty array when no rooms exist', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      const result = await roomsRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a room when found', async () => {
      mockTypeOrmRepository.findOneBy.mockResolvedValue(mockRoom);

      const result = await roomsRepository.findById(1);

      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockRoom);
    });

    it('should return null when room not found', async () => {
      mockTypeOrmRepository.findOneBy.mockResolvedValue(null);

      const result = await roomsRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a room', async () => {
      const updateData: Partial<Rooms> = {
        block: 'Bloco B',
        number: 202,
      };

      mockTypeOrmRepository.update.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      await roomsRepository.update(1, updateData);

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('delete', () => {
    it('should delete a room', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({
        affected: 1,
        raw: [],
      });

      await roomsRepository.delete(1);

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
