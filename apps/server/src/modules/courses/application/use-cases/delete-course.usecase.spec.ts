import { Test, TestingModule } from '@nestjs/testing';
import { DeleteCourseUseCase } from './delete-course.usecase';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { Course } from '../../domain/entities/course.entity';
import { CourseNotFoundException } from '../../domain/exceptions/course-not-found.exception';

describe('DeleteCourseUseCase', () => {
  let useCase: DeleteCourseUseCase;
  let repository: CourseRepository;

  const mockRepository = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCourseUseCase,
        { provide: CourseRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteCourseUseCase>(DeleteCourseUseCase);
    repository = module.get<CourseRepository>(CourseRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a course successfully', async () => {
      const mockCourse: Course = {
        id: 1,
        name: 'Computer Science',
        knowledgeArea: 'Technology',
        vacancies: 40,
        periodQuantities: 4,
        openingYear: 2024,
        numberOfSemesters: 8,
        classes: [],
      } as Course;

      mockRepository.findById.mockResolvedValue(mockCourse);
      mockRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw CourseNotFoundException when course is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(
        CourseNotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
