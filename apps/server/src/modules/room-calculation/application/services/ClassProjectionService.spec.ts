import { Test, TestingModule } from '@nestjs/testing';
import { ClassProjectionService } from './ClassProjectionService';
import { CreateClassUseCase } from '../../../classes/application/use-cases/create-class.usecase';
import { Class as ClassEntity } from '../../../classes/domain/entities/class.entity';
import { Course } from '../../../courses/domain/entities/course.entity';
import { Shift } from '../../../shifts/domain/entities/shift.entity';

describe('ClassProjectionService', () => {
  let service: ClassProjectionService;
  let createClassUseCase: CreateClassUseCase;

  const mockCreateClassUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassProjectionService,
        { provide: CreateClassUseCase, useValue: mockCreateClassUseCase },
      ],
    }).compile();

    service = module.get<ClassProjectionService>(ClassProjectionService);
    createClassUseCase = module.get<CreateClassUseCase>(CreateClassUseCase);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('projectMissingClasses', () => {
    it('should create class for course without existing class in target year', async () => {
      const targetYear = 2025;
      const courses = [
        {
          id: 1,
          shiftId: 1,
          semester: 1,
          vacancies: 40,
          name: 'Course 1',
          openingYear: 2020,
        },
      ];
      const existingClasses = [{ year: 2024, courseId: 1 }];

      const mockCreatedClass: ClassEntity = {
        id: 1,
        courseId: 1,
        shiftId: 1,
        year: 2025,
        semester: 1,
        currentStudents: 40,
        isAssumed: true,
        course: undefined as unknown as Course,
        shift: undefined as unknown as Shift,
      };

      mockCreateClassUseCase.execute.mockResolvedValue(mockCreatedClass);

      const result = await service.projectMissingClasses(
        targetYear,
        courses,
        existingClasses,
      );

      expect(createClassUseCase.execute).toHaveBeenCalledWith({
        courseId: 1,
        shiftId: 1,
        year: 2025,
        semester: 1,
        currentStudents: 40,
        isAssumed: true,
      });
      expect(result).toHaveLength(1);
    });

    it('should not create class if course already has class in target year', async () => {
      const targetYear = 2025;
      const courses = [
        {
          id: 1,
          shiftId: 1,
          semester: 1,
          vacancies: 40,
          name: 'Course 1',
          openingYear: 2020,
        },
      ];
      const existingClasses = [{ year: 2025, courseId: 1 }];

      const result = await service.projectMissingClasses(
        targetYear,
        courses,
        existingClasses,
      );

      expect(createClassUseCase.execute).not.toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });

    it('should not create class if course openingYear is after target year', async () => {
      const targetYear = 2025;
      const courses = [
        {
          id: 1,
          shiftId: 1,
          semester: 1,
          vacancies: 40,
          name: 'Course 1',
          openingYear: 2026,
        },
      ];
      const existingClasses: Array<{ year: number; courseId: number }> = [];

      const result = await service.projectMissingClasses(
        targetYear,
        courses,
        existingClasses,
      );

      expect(createClassUseCase.execute).not.toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });

    it('should create class for course starting in target year', async () => {
      const targetYear = 2025;
      const courses = [
        {
          id: 1,
          shiftId: 1,
          semester: 1,
          vacancies: 40,
          name: 'Course 1',
          openingYear: 2025,
        },
      ];
      const existingClasses: Array<{ year: number; courseId: number }> = [];

      const mockCreatedClass: ClassEntity = {
        id: 1,
        courseId: 1,
        shiftId: 1,
        year: 2025,
        semester: 1,
        currentStudents: 40,
        isAssumed: true,
        course: undefined as unknown as Course,
        shift: undefined as unknown as Shift,
      };

      mockCreateClassUseCase.execute.mockResolvedValue(mockCreatedClass);

      const result = await service.projectMissingClasses(
        targetYear,
        courses,
        existingClasses,
      );

      expect(createClassUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });

    it('should use default values when optional fields are missing', async () => {
      const targetYear = 2025;
      const courses = [{ id: 1 }]; // minimal course data
      const existingClasses: Array<{ year: number; courseId: number }> = [];

      const mockCreatedClass: ClassEntity = {
        id: 1,
        courseId: 1,
        shiftId: 1,
        year: 2025,
        semester: 1,
        currentStudents: 0,
        isAssumed: true,
        course: undefined as unknown as Course,
        shift: undefined as unknown as Shift,
      };

      mockCreateClassUseCase.execute.mockResolvedValue(mockCreatedClass);

      await service.projectMissingClasses(targetYear, courses, existingClasses);

      expect(createClassUseCase.execute).toHaveBeenCalledWith({
        courseId: 1,
        shiftId: 1, // default
        year: 2025,
        semester: 1, // default
        currentStudents: 0, // default when vacancies not provided
        isAssumed: true,
      });
    });

    it('should handle errors when creating classes', async () => {
      const targetYear = 2025;
      const courses = [
        {
          id: 1,
          shiftId: 1,
          semester: 1,
          vacancies: 40,
          name: 'Course 1',
          openingYear: 2020,
        },
      ];
      const existingClasses: Array<{ year: number; courseId: number }> = [];

      mockCreateClassUseCase.execute.mockRejectedValue(
        new Error('Creation failed'),
      );

      const result = await service.projectMissingClasses(
        targetYear,
        courses,
        existingClasses,
      );

      expect(createClassUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle errors without message property', async () => {
      const targetYear = 2025;
      const courses = [
        {
          id: 1,
          shiftId: 1,
          semester: 1,
          vacancies: 40,
          name: 'Course 1',
          openingYear: 2020,
        },
      ];
      const existingClasses: Array<{ year: number; courseId: number }> = [];

      mockCreateClassUseCase.execute.mockRejectedValue('String error');

      const result = await service.projectMissingClasses(
        targetYear,
        courses,
        existingClasses,
      );

      expect(createClassUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle multiple courses independently', async () => {
      const targetYear = 2025;
      const courses = [
        { id: 1, shiftId: 1, semester: 1, vacancies: 40, openingYear: 2020 },
        { id: 2, shiftId: 2, semester: 1, vacancies: 30, openingYear: 2020 },
      ];
      // Course 1 already has class in 2025, Course 2 does not
      const existingClasses = [{ year: 2025, courseId: 1 }];

      const mockCreatedClass: ClassEntity = {
        id: 2,
        courseId: 2,
        shiftId: 2,
        year: 2025,
        semester: 1,
        currentStudents: 30,
        isAssumed: true,
        course: undefined as unknown as Course,
        shift: undefined as unknown as Shift,
      };

      mockCreateClassUseCase.execute.mockResolvedValue(mockCreatedClass);

      const result = await service.projectMissingClasses(
        targetYear,
        courses,
        existingClasses,
      );

      // Only course 2 should have class created
      expect(createClassUseCase.execute).toHaveBeenCalledTimes(1);
      expect(createClassUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 2 }),
      );
      expect(result).toHaveLength(1);
    });

    it('should create classes for all courses without existing classes', async () => {
      const targetYear = 2025;
      const courses = [
        { id: 1, shiftId: 1, semester: 1, vacancies: 40, openingYear: 2020 },
        { id: 2, shiftId: 2, semester: 1, vacancies: 30, openingYear: 2020 },
        { id: 3, shiftId: 1, semester: 2, vacancies: 25, openingYear: 2020 },
      ];
      const existingClasses: Array<{ year: number; courseId: number }> = [];

      const mockCreatedClass: ClassEntity = {
        id: 1,
        courseId: 1,
        shiftId: 1,
        year: 2025,
        semester: 1,
        currentStudents: 40,
        isAssumed: true,
        course: undefined as unknown as Course,
        shift: undefined as unknown as Shift,
      };

      mockCreateClassUseCase.execute.mockResolvedValue(mockCreatedClass);

      const result = await service.projectMissingClasses(
        targetYear,
        courses,
        existingClasses,
      );

      expect(createClassUseCase.execute).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
    });
  });
});
