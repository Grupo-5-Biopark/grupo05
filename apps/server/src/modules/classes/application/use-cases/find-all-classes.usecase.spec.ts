import { Test, TestingModule } from '@nestjs/testing';
import { FindAllClassesUseCase } from './find-all-classes.usecase';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { Class } from '../../domain/entities/class.entity';

describe('FindAllClassesUseCase', () => {
  let useCase: FindAllClassesUseCase;
  let repository: ClassRepository;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllClassesUseCase,
        { provide: ClassRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindAllClassesUseCase>(FindAllClassesUseCase);
    repository = module.get<ClassRepository>(ClassRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all classes', async () => {
      const mockClasses: Class[] = [
        {
          id: 1,
          courseId: 1,
          shiftId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 30,
        } as Class,
        {
          id: 2,
          courseId: 2,
          shiftId: 2,
          year: 2024,
          semester: 2,
          currentStudents: 25,
        } as Class,
      ];

      mockRepository.findAll.mockResolvedValue(mockClasses);

      const result = await useCase.execute();

      expect(result).toEqual(mockClasses);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no classes exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
    });
  });
});
