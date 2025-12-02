import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculationParametersRepository } from '../calculation-parameters.repository';
import { CalculationParameters } from '../../../domain/entities/calculation-parameters.entity';

describe('CalculationParametersRepository', () => {
  let repository: CalculationParametersRepository;
  let typeormRepository: Repository<CalculationParameters>;

  const mockParameters = {
    id: 1,
    dropoutPercentage: 5.5,
    studentsPerSmallRoom: 10,
    studentsPerMediumRoom: 20,
    studentsPerBigRoom: 30,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculationParametersRepository,
        {
          provide: getRepositoryToken(CalculationParameters),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<CalculationParametersRepository>(
      CalculationParametersRepository,
    );
    typeormRepository = module.get<Repository<CalculationParameters>>(
      getRepositoryToken(CalculationParameters),
    );

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save calculation parameters', async () => {
      const data = {
        dropoutPercentage: 10.0,
        studentsPerSmallRoom: 15,
        studentsPerMediumRoom: 25,
        studentsPerBigRoom: 35,
      };

      mockRepository.create.mockReturnValue(data);
      mockRepository.save.mockResolvedValue({ ...mockParameters, ...data });

      const result = await repository.create(data);

      expect(typeormRepository.create).toHaveBeenCalledWith(data);
      expect(typeormRepository.save).toHaveBeenCalled();
      expect(result.dropoutPercentage).toBe(data.dropoutPercentage);
    });
  });

  describe('findAll', () => {
    it('should return an array of parameters', async () => {
      mockRepository.find.mockResolvedValue([mockParameters]);

      const result = await repository.findAll();

      expect(typeormRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockParameters]);
    });

    it('should return empty array when no parameters exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('count', () => {
    it('should return the count of parameters', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await repository.count();

      expect(typeormRepository.count).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('should return 0 when no parameters exist', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });

  describe('findById', () => {
    it('should return parameters when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockParameters);

      const result = await repository.findById(1);

      expect(typeormRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockParameters);
    });

    it('should return null when parameters not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update calculation parameters', async () => {
      const updateData = { dropoutPercentage: 12.5 };
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await repository.update(1, updateData);

      expect(typeormRepository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('delete', () => {
    it('should delete calculation parameters', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await repository.delete(1);

      expect(typeormRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
