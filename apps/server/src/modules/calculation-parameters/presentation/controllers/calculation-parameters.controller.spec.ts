import { Test, TestingModule } from '@nestjs/testing';
import { CalculationParametersController } from './calculation-parameters.controller';
import { CreateCalculationParametersUseCase } from '../../application/use-cases/create-calculation-parameters.usecase';
import { FindAllCalculationParametersUseCase } from '../../application/use-cases/find-all-calculation-parameters.usecase';
import { UpdateCalculationParametersUseCase } from '../../application/use-cases/update-calculation-parameters.usecase';
import { DeleteCalculationParametersUseCase } from '../../application/use-cases/delete-calculation-parameters.usecase';
import { CalculationParameters } from '../../domain/entities/calculation-parameters.entity';
import { CreateCalculationParametersDto } from '../dtos/create-calculation-parameters.dto';
import { UpdateCalculationParametersDto } from '../dtos/update-calculation-parameters.dto';

describe('CalculationParametersController', () => {
  let controller: CalculationParametersController;

  const mockParams: CalculationParameters = {
    id: 1,
    dropoutPercentage: 10.5,
    studentsPerSmallRoom: 30,
    studentsPerMediumRoom: 50,
    studentsPerBigRoom: 100,
  } as CalculationParameters;

  const mockUseCases = {
    create: { execute: jest.fn() },
    findAll: { execute: jest.fn() },
    update: { execute: jest.fn() },
    delete: { execute: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalculationParametersController],
      providers: [
        {
          provide: CreateCalculationParametersUseCase,
          useValue: mockUseCases.create,
        },
        {
          provide: FindAllCalculationParametersUseCase,
          useValue: mockUseCases.findAll,
        },
        {
          provide: UpdateCalculationParametersUseCase,
          useValue: mockUseCases.update,
        },
        {
          provide: DeleteCalculationParametersUseCase,
          useValue: mockUseCases.delete,
        },
      ],
    }).compile();

    controller = module.get<CalculationParametersController>(
      CalculationParametersController,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create calculation parameters successfully', async () => {
      const dto: CreateCalculationParametersDto = {
        dropoutPercentage: 10.5,
        studentsPerSmallRoom: 30,
        studentsPerMediumRoom: 50,
        studentsPerBigRoom: 100,
      };

      mockUseCases.create.execute.mockResolvedValue(mockParams);

      const result = await controller.create(dto);

      expect(result).toEqual({
        id: mockParams.id,
        dropoutPercentage: Number(mockParams.dropoutPercentage),
        studentsPerSmallRoom: mockParams.studentsPerSmallRoom,
        studentsPerMediumRoom: mockParams.studentsPerMediumRoom,
        studentsPerBigRoom: mockParams.studentsPerBigRoom,
      });
    });
  });

  describe('findAll', () => {
    it('should return all calculation parameters', async () => {
      mockUseCases.findAll.execute.mockResolvedValue([mockParams]);

      const result = await controller.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockParams.id,
        dropoutPercentage: Number(mockParams.dropoutPercentage),
        studentsPerSmallRoom: mockParams.studentsPerSmallRoom,
        studentsPerMediumRoom: mockParams.studentsPerMediumRoom,
        studentsPerBigRoom: mockParams.studentsPerBigRoom,
      });
    });

    it('should return empty array when no parameters exist', async () => {
      mockUseCases.findAll.execute.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update calculation parameters successfully', async () => {
      const dto: UpdateCalculationParametersDto = {
        dropoutPercentage: 15,
      };

      mockUseCases.update.execute.mockResolvedValue(undefined);

      await controller.update(dto);

      expect(mockUseCases.update.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('remove', () => {
    it('should delete calculation parameters successfully', async () => {
      mockUseCases.delete.execute.mockResolvedValue(undefined);

      await controller.remove();

      expect(mockUseCases.delete.execute).toHaveBeenCalled();
    });
  });
});
