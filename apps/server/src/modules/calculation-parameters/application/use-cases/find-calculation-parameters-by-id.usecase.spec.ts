import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindCalculationParametersByIdUseCase } from './find-calculation-parameters-by-id.usecase';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

describe('FindCalculationParametersByIdUseCase', () => {
  let useCase: FindCalculationParametersByIdUseCase;
  let repository: CalculationParametersRepository;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindCalculationParametersByIdUseCase,
        {
          provide: CalculationParametersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindCalculationParametersByIdUseCase>(
      FindCalculationParametersByIdUseCase,
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
    it('should return calculation parameters when found', async () => {
      const mockParams: CalculationParameters = {
        id: 1,
        dropoutPercentage: 10.5,
        studentsPerSmallRoom: 30,
        studentsPerMediumRoom: 50,
        studentsPerBigRoom: 100,
      } as CalculationParameters;

      mockRepository.findAll.mockResolvedValue([mockParams]);

      const result = await useCase.execute();

      expect(result).toEqual(mockParams);
      expect(repository.findAll).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no parameters exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await expect(useCase.execute()).rejects.toThrow(NotFoundException);
    });
  });
});
