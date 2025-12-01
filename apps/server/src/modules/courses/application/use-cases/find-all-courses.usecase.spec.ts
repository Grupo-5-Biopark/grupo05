import { Test, TestingModule } from '@nestjs/testing';
import { FindAllCoursesUseCase } from './find-all-courses.usecase';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { Course } from '../../domain/entities/course.entity';

describe('FindAllCoursesUseCase', () => {
  let useCase: FindAllCoursesUseCase;
  let repository: CourseRepository;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllCoursesUseCase,
        { provide: CourseRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindAllCoursesUseCase>(FindAllCoursesUseCase);
    repository = module.get<CourseRepository>(CourseRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all courses', async () => {
      const mockCourses: Course[] = [
        {
          id: 1,
          name: 'Computer Science',
          knowledgeArea: 'Technology',
          vacancies: 40,
          periodQuantities: 4,
          openingYear: 2024,
          numberOfSemesters: 8,
          classes: [],
        } as Course,
        {
          id: 2,
          name: 'Engineering',
          knowledgeArea: 'Engineering',
          vacancies: 50,
          periodQuantities: 5,
          openingYear: 2024,
          numberOfSemesters: 10,
          classes: [],
        } as Course,
      ];

      mockRepository.findAll.mockResolvedValue(mockCourses);

      const result = await useCase.execute();

      expect(result).toEqual(mockCourses);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no courses exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
    });
  });
});
