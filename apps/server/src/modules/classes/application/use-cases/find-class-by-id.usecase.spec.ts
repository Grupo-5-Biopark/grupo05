import { Test, TestingModule } from '@nestjs/testing';
import { FindClassByIdUseCase } from './find-class-by-id.usecase';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { Class } from '../../domain/entities/class.entity';
import { ClassNotFoundException } from '../../domain/exceptions/class-not-found.exception';

describe('FindClassByIdUseCase', () => {
  let useCase: FindClassByIdUseCase;
  let repository: ClassRepository;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindClassByIdUseCase,
        { provide: ClassRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindClassByIdUseCase>(FindClassByIdUseCase);
    repository = module.get<ClassRepository>(ClassRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a class when found', async () => {
      const mockClass: Class = {
        id: 1,
        courseId: 1,
        shiftId: 1,
        year: 2024,
        semester: 1,
        currentStudents: 30,
      } as Class;

      mockRepository.findById.mockResolvedValue(mockClass);

      const result = await useCase.execute(1);

      expect(result).toEqual(mockClass);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw ClassNotFoundException when class is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(
        ClassNotFoundException,
      );
    });
  });
});
