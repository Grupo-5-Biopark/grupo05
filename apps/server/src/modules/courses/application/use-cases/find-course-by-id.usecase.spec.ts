import { Test, TestingModule } from '@nestjs/testing';
import { FindCourseByIdUseCase } from './find-course-by-id.usecase';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { Course } from '../../domain/entities/course.entity';
import { CourseNotFoundException } from '../../domain/exceptions/course-not-found.exception';

describe('FindCourseByIdUseCase', () => {
  let useCase: FindCourseByIdUseCase;
  let repository: CourseRepository;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindCourseByIdUseCase,
        { provide: CourseRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindCourseByIdUseCase>(FindCourseByIdUseCase);
    repository = module.get<CourseRepository>(CourseRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a course when found', async () => {
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

      const result = await useCase.execute(1);

      expect(result).toEqual(mockCourse);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw CourseNotFoundException when course is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(
        CourseNotFoundException,
      );
    });
  });
});
