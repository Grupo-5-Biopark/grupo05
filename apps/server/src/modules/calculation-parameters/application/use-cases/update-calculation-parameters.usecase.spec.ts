import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateCalculationParametersUseCase } from './update-calculation-parameters.usecase';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

describe('UpdateCalculationParametersUseCase', () => {
  let useCase: UpdateCalculationParametersUseCase;
  let repository: CalculationParametersRepository;

  const mockRepository = {
    findAll: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCalculationParametersUseCase,
        {
          provide: CalculationParametersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateCalculationParametersUseCase>(
      UpdateCalculationParametersUseCase,
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
    it('should update calculation parameters successfully', async () => {
      const mockParams: CalculationParameters = {
        id: 1,
        dropoutPercentage: 10.5,
        studentsPerSmallRoom: 30,
        studentsPerMediumRoom: 50,
        studentsPerBigRoom: 100,
      } as CalculationParameters;

      const updateData: Partial<CalculationParameters> = {
        dropoutPercentage: 15,
      };

      mockRepository.findAll.mockResolvedValue([mockParams]);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(updateData);

      expect(repository.findAll).toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw NotFoundException when no parameters exist', async () => {
      const updateData: Partial<CalculationParameters> = {
        dropoutPercentage: 15,
      };

      mockRepository.findAll.mockResolvedValue([]);

      await expect(useCase.execute(updateData)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
