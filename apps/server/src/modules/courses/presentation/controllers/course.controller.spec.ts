import { Test, TestingModule } from '@nestjs/testing';
import { CourseController } from './course.controller';
import { CreateCourseUseCase } from '../../application/use-cases/create-course.usecase';
import { FindAllCoursesUseCase } from '../../application/use-cases/find-all-courses.usecase';
import { FindCourseByIdUseCase } from '../../application/use-cases/find-course-by-id.usecase';
import { UpdateCourseUseCase } from '../../application/use-cases/update-course.usecase';
import { DeleteCourseUseCase } from '../../application/use-cases/delete-course.usecase';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { UpdateCourseDto } from '../dtos/update-course.dto';
import { Course } from '../../domain/entities/course.entity';

describe('CourseController', () => {
  let controller: CourseController;

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

  const mockUseCases = {
    create: { execute: jest.fn() },
    findAll: { execute: jest.fn() },
    findById: { execute: jest.fn() },
    update: { execute: jest.fn() },
    delete: { execute: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        { provide: CreateCourseUseCase, useValue: mockUseCases.create },
        { provide: FindAllCoursesUseCase, useValue: mockUseCases.findAll },
        { provide: FindCourseByIdUseCase, useValue: mockUseCases.findById },
        { provide: UpdateCourseUseCase, useValue: mockUseCases.update },
        { provide: DeleteCourseUseCase, useValue: mockUseCases.delete },
      ],
    }).compile();

    controller = module.get<CourseController>(CourseController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a course successfully', async () => {
      const dto: CreateCourseDto = {
        name: 'Computer Science',
        knowledgeArea: 'Technology',
        vacancies: 40,
        periodQuantities: 4,
        openingYear: 2024,
      };

      mockUseCases.create.execute.mockResolvedValue(mockCourse);

      const result = await controller.create(dto);

      expect(result).toEqual({
        id: mockCourse.id,
        name: mockCourse.name,
        knowledgeArea: mockCourse.knowledgeArea,
        vacancies: mockCourse.vacancies,
        periodQuantities: mockCourse.periodQuantities,
        openingYear: mockCourse.openingYear,
      });
    });
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      mockUseCases.findAll.execute.mockResolvedValue([mockCourse]);

      const result = await controller.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockCourse.id,
        name: mockCourse.name,
        knowledgeArea: mockCourse.knowledgeArea,
        vacancies: mockCourse.vacancies,
        periodQuantities: mockCourse.periodQuantities,
        openingYear: mockCourse.openingYear,
      });
    });

    it('should return empty array when no courses exist', async () => {
      mockUseCases.findAll.execute.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      mockUseCases.findById.execute.mockResolvedValue(mockCourse);

      const result = await controller.findOne(1);

      expect(result).toEqual({
        id: mockCourse.id,
        name: mockCourse.name,
        knowledgeArea: mockCourse.knowledgeArea,
        vacancies: mockCourse.vacancies,
        periodQuantities: mockCourse.periodQuantities,
        openingYear: mockCourse.openingYear,
      });
    });

    it('should throw an error when course is not found', async () => {
      mockUseCases.findById.execute.mockRejectedValue(
        new Error('Course not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow('Course not found');
    });
  });

  describe('update', () => {
    it('should update a course successfully', async () => {
      const dto: UpdateCourseDto = {
        vacancies: 50,
        periodQuantities: 5,
      };

      mockUseCases.update.execute.mockResolvedValue(undefined);

      await controller.update(1, dto);

      expect(mockUseCases.update.execute).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a course successfully', async () => {
      mockUseCases.delete.execute.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockUseCases.delete.execute).toHaveBeenCalledWith(1);
    });
  });
});
