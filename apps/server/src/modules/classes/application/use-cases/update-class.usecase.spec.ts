import { Test, TestingModule } from '@nestjs/testing';
import { UpdateClassUseCase } from './update-class.usecase';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { UpdateClassDto } from '../../presentation/dtos/update-class.dto';
import { Class } from '../../domain/entities/class.entity';
import { ClassNotFoundException } from '../../domain/exceptions/class-not-found.exception';

describe('UpdateClassUseCase', () => {
  let useCase: UpdateClassUseCase;
  let repository: ClassRepository;

  const mockRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClassUseCase,
        { provide: ClassRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<UpdateClassUseCase>(UpdateClassUseCase);
    repository = module.get<ClassRepository>(ClassRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update a class successfully', async () => {
      const mockClass: Class = {
        id: 1,
        courseId: 1,
        shiftId: 1,
        year: 2024,
        semester: 1,
        currentStudents: 30,
      } as Class;

      const dto: UpdateClassDto = {
        currentStudents: 35,
      };

      mockRepository.findById.mockResolvedValue(mockClass);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, dto);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw ClassNotFoundException when class is not found', async () => {
      const dto: UpdateClassDto = {
        currentStudents: 35,
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, dto)).rejects.toThrow(
        ClassNotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
