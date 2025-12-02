import { Test, TestingModule } from '@nestjs/testing';
import { FindAllCalculationParametersUseCase } from './find-all-calculation-parameters.usecase';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

describe('FindAllCalculationParametersUseCase', () => {
  let useCase: FindAllCalculationParametersUseCase;
  let repository: CalculationParametersRepository;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllCalculationParametersUseCase,
        {
          provide: CalculationParametersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllCalculationParametersUseCase>(
      FindAllCalculationParametersUseCase,
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
    it('should return all calculation parameters', async () => {
      const mockParams: CalculationParameters[] = [
        {
          id: 1,
          dropoutPercentage: 10.5,
          studentsPerSmallRoom: 30,
          studentsPerMediumRoom: 50,
          studentsPerBigRoom: 100,
        } as CalculationParameters,
      ];

      mockRepository.findAll.mockResolvedValue(mockParams);

      const result = await useCase.execute();

      expect(result).toEqual(mockParams);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no parameters exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
    });
  });
});
