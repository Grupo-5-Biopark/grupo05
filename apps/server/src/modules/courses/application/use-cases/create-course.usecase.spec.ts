import { Test, TestingModule } from '@nestjs/testing';
import { CreateCourseUseCase } from './create-course.usecase';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { CreateCourseDto } from '../../presentation/dtos/create-course.dto';
import { Course } from '../../domain/entities/course.entity';
import { DuplicateCourseNameException } from '../../domain/exceptions/duplicate-course-name.exception';

describe('CreateCourseUseCase', () => {
  let useCase: CreateCourseUseCase;
  let repository: CourseRepository;

  const mockRepository = {
    findByName: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCourseUseCase,
        { provide: CourseRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateCourseUseCase>(CreateCourseUseCase);
    repository = module.get<CourseRepository>(CourseRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateCourseDto = {
      name: 'Computer Science',
      knowledgeArea: 'Technology',
      vacancies: 40,
      periodQuantities: 4,
      openingYear: 2024,
    };

    it('should create a course successfully', async () => {
      const mockCourse: Course = {
        id: 1,
        ...dto,
      } as Course;

      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockCourse);

      const result = await useCase.execute(dto);

      expect(result).toEqual(mockCourse);
      expect(repository.findByName).toHaveBeenCalledWith(dto.name);
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw DuplicateCourseNameException when course name already exists', async () => {
      const existingCourse: Course = {
        id: 1,
        name: dto.name,
      } as Course;

      mockRepository.findByName.mockResolvedValue(existingCourse);

      await expect(useCase.execute(dto)).rejects.toThrow(
        DuplicateCourseNameException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw DuplicateCourseNameException on database constraint violation', async () => {
      const dbError = {
        code: '23505',
        detail: 'Key (name)=(Computer Science) already exists.',
      };

      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockRejectedValue(dbError);

      await expect(useCase.execute(dto)).rejects.toThrow(
        DuplicateCourseNameException,
      );
    });

    it('should rethrow other database errors', async () => {
      const dbError = new Error('Database connection error');

      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockRejectedValue(dbError);

      await expect(useCase.execute(dto)).rejects.toThrow(
        'Database connection error',
      );
    });
  });
});
