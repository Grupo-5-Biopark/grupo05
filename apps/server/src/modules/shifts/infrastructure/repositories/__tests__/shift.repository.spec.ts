import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftRepository } from '../shift.repository';
import { Shift } from '../../../domain/entities/shift.entity';

describe('ShiftRepository', () => {
  let shiftRepository: ShiftRepository;
  let mockRepository: Partial<Repository<Shift>>;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftRepository,
        {
          provide: getRepositoryToken(Shift),
          useValue: mockRepository,
        },
      ],
    }).compile();

    shiftRepository = module.get<ShiftRepository>(ShiftRepository);
  });

  describe('findAll', () => {
    it('should return all shifts', async () => {
      const mockShifts: Shift[] = [
        { id: 1, name: 'Morning', classes: [] },
        { id: 2, name: 'Afternoon', classes: [] },
      ];
      (mockRepository.find as jest.Mock).mockResolvedValue(mockShifts);

      const result = await shiftRepository.findAll();

      expect(result).toEqual(mockShifts);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a shift by id', async () => {
      const mockShift: Shift = {
        id: 1,
        name: 'Morning',
        classes: [],
      };
      (mockRepository.findOneBy as jest.Mock).mockResolvedValue(mockShift);

      const result = await shiftRepository.findById(1);

      expect(result).toEqual(mockShift);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return null when shift not found', async () => {
      (mockRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await shiftRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return a shift by name', async () => {
      const mockShift: Shift = {
        id: 1,
        name: 'Morning',
        classes: [],
      };
      (mockRepository.findOneBy as jest.Mock).mockResolvedValue(mockShift);

      const result = await shiftRepository.findByName('Morning');

      expect(result).toEqual(mockShift);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        name: 'Morning',
      });
    });

    it('should return null when shift not found', async () => {
      (mockRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await shiftRepository.findByName('NonExistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a shift', async () => {
      const shiftData: Partial<Shift> = { name: 'Evening' };
      const createdShift: Shift = {
        id: 3,
        name: 'Evening',
        classes: [],
      };

      (mockRepository.create as jest.Mock).mockReturnValue(createdShift);
      (mockRepository.save as jest.Mock).mockResolvedValue(createdShift);

      const result = await shiftRepository.create(shiftData);

      expect(result).toEqual(createdShift);
      expect(mockRepository.create).toHaveBeenCalledWith(shiftData);
      expect(mockRepository.save).toHaveBeenCalledWith(createdShift);
    });
  });
});
