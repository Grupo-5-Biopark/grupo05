import { Test, TestingModule } from '@nestjs/testing';
import { DeleteClassUseCase } from './delete-class.usecase';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { Class } from '../../domain/entities/class.entity';
import { ClassNotFoundException } from '../../domain/exceptions/class-not-found.exception';

describe('DeleteClassUseCase', () => {
  let useCase: DeleteClassUseCase;
  let repository: ClassRepository;

  const mockRepository = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteClassUseCase,
        { provide: ClassRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteClassUseCase>(DeleteClassUseCase);
    repository = module.get<ClassRepository>(ClassRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a class successfully', async () => {
      const mockClass: Class = {
        id: 1,
        courseId: 1,
        shiftId: 1,
        year: 2024,
        semester: 1,
        currentStudents: 30,
      } as Class;

      mockRepository.findById.mockResolvedValue(mockClass);
      mockRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ClassNotFoundException when class is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(
        ClassNotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
