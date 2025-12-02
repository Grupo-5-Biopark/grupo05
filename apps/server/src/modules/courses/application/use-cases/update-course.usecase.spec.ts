import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCourseUseCase } from './update-course.usecase';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { UpdateCourseDto } from '../../presentation/dtos/update-course.dto';
import { Course } from '../../domain/entities/course.entity';
import { CourseNotFoundException } from '../../domain/exceptions/course-not-found.exception';
import { DuplicateCourseNameException } from '../../domain/exceptions/duplicate-course-name.exception';

describe('UpdateCourseUseCase', () => {
  let useCase: UpdateCourseUseCase;
  let repository: CourseRepository;

  const mockRepository = {
    findById: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCourseUseCase,
        { provide: CourseRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<UpdateCourseUseCase>(UpdateCourseUseCase);
    repository = module.get<CourseRepository>(CourseRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
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

    it('should update a course successfully', async () => {
      const dto: UpdateCourseDto = {
        vacancies: 50,
      };

      mockRepository.findById.mockResolvedValue(mockCourse);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, dto);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw CourseNotFoundException when course is not found', async () => {
      const dto: UpdateCourseDto = {
        vacancies: 50,
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, dto)).rejects.toThrow(
        CourseNotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should update name when new name is available', async () => {
      const dto: UpdateCourseDto = {
        name: 'New Course Name',
      };

      mockRepository.findById.mockResolvedValue(mockCourse);
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, dto);

      expect(repository.findByName).toHaveBeenCalledWith(dto.name);
      expect(repository.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw DuplicateCourseNameException when new name already exists', async () => {
      const dto: UpdateCourseDto = {
        name: 'Existing Course',
      };

      const existingCourse: Course = {
        id: 2,
        name: 'Existing Course',
      } as Course;

      mockRepository.findById.mockResolvedValue(mockCourse);
      mockRepository.findByName.mockResolvedValue(existingCourse);

      await expect(useCase.execute(1, dto)).rejects.toThrow(
        DuplicateCourseNameException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to the same name', async () => {
      const dto: UpdateCourseDto = {
        name: 'Computer Science',
      };

      mockRepository.findById.mockResolvedValue(mockCourse);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, dto);

      expect(repository.findByName).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(1, dto);
    });

    it('should update all fields when all are provided', async () => {
      const dto: UpdateCourseDto = {
        name: 'New Course Name',
        knowledgeArea: 'Engineering',
        vacancies: 60,
        periodQuantities: 10,
        openingYear: 2025,
      };

      mockRepository.findById.mockResolvedValue(mockCourse);
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, dto);

      expect(repository.update).toHaveBeenCalledWith(1, {
        name: 'New Course Name',
        knowledgeArea: 'Engineering',
        vacancies: 60,
        periodQuantities: 10,
        openingYear: 2025,
      });
    });

    it('should update vacancies when provided', async () => {
      const dto: UpdateCourseDto = {
        vacancies: 100,
      };

      mockRepository.findById.mockResolvedValue(mockCourse);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, dto);

      expect(repository.update).toHaveBeenCalledWith(1, { vacancies: 100 });
    });

    it('should update periodQuantities when provided', async () => {
      const dto: UpdateCourseDto = {
        periodQuantities: 12,
      };

      mockRepository.findById.mockResolvedValue(mockCourse);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, dto);

      expect(repository.update).toHaveBeenCalledWith(1, {
        periodQuantities: 12,
      });
    });

    it('should update openingYear when provided', async () => {
      const dto: UpdateCourseDto = {
        openingYear: 2030,
      };

      mockRepository.findById.mockResolvedValue(mockCourse);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, dto);

      expect(repository.update).toHaveBeenCalledWith(1, { openingYear: 2030 });
    });

    it('should update knowledgeArea when provided', async () => {
      const dto: UpdateCourseDto = {
        knowledgeArea: 'Health Sciences',
      };

      mockRepository.findById.mockResolvedValue(mockCourse);
      mockRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, dto);

      expect(repository.update).toHaveBeenCalledWith(1, {
        knowledgeArea: 'Health Sciences',
      });
    });
  });
});
