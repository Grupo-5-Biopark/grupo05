import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateCalculationParametersUseCase } from './create-calculation-parameters.usecase';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

describe('CreateCalculationParametersUseCase', () => {
  let useCase: CreateCalculationParametersUseCase;
  let repository: CalculationParametersRepository;

  const mockRepository = {
    count: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCalculationParametersUseCase,
        {
          provide: CalculationParametersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCalculationParametersUseCase>(
      CreateCalculationParametersUseCase,
    );
    repository = module.get<CalculationParametersRepository>(
      CalculationParametersRepository,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockData: Partial<CalculationParameters> = {
      dropoutPercentage: 10.5,
      studentsPerSmallRoom: 30,
      studentsPerMediumRoom: 50,
      studentsPerBigRoom: 100,
    };

    it('should create calculation parameters when none exist', async () => {
      const mockParams: CalculationParameters = {
        id: 1,
        ...mockData,
      } as CalculationParameters;

      mockRepository.count.mockResolvedValue(0);
      mockRepository.create.mockResolvedValue(mockParams);

      const result = await useCase.execute(mockData);

      expect(result).toEqual(mockParams);
      expect(repository.count).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(mockData);
    });

    it('should throw ConflictException when parameters already exist', async () => {
      mockRepository.count.mockResolvedValue(1);

      await expect(useCase.execute(mockData)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.count).toHaveBeenCalledTimes(1);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw error when repository count fails', async () => {
      mockRepository.count.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(mockData)).rejects.toThrow('Database error');
      expect(repository.create).not.toHaveBeenCalled();
    });
  });
});
