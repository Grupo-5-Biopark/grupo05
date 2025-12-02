import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteCalculationParametersUseCase } from './delete-calculation-parameters.usecase';
import { CalculationParametersRepository } from '../../infrastructure/repositories/calculation-parameters.repository';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';

describe('DeleteCalculationParametersUseCase', () => {
  let useCase: DeleteCalculationParametersUseCase;
  let repository: CalculationParametersRepository;

  const mockRepository = {
    findAll: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCalculationParametersUseCase,
        {
          provide: CalculationParametersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteCalculationParametersUseCase>(
      DeleteCalculationParametersUseCase,
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
    it('should delete calculation parameters successfully', async () => {
      const mockParams: CalculationParameters = {
        id: 1,
        dropoutPercentage: 10.5,
        studentsPerSmallRoom: 30,
        studentsPerMediumRoom: 50,
        studentsPerBigRoom: 100,
      } as CalculationParameters;

      mockRepository.findAll.mockResolvedValue([mockParams]);
      mockRepository.delete.mockResolvedValue(undefined);

      await useCase.execute();

      expect(repository.findAll).toHaveBeenCalled();
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when no parameters exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await expect(useCase.execute()).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
