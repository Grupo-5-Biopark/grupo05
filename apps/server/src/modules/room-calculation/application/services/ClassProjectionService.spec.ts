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
    it('should create classes for missing years', async () => {
      const targetYear = 2025;
      const courses = [
        { id: 1, shiftId: 1, semester: 1, vacancies: 40, name: 'Course 1' },
      ];
      const existingClasses = [{ year: 2024 }];

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

    it('should not create classes if target year already exists', async () => {
      const targetYear = 2024;
      const courses = [
        { id: 1, shiftId: 1, semester: 1, vacancies: 40, name: 'Course 1' },
      ];
      const existingClasses = [{ year: 2024 }];

      const result = await service.projectMissingClasses(
        targetYear,
        courses,
        existingClasses,
      );

      expect(createClassUseCase.execute).not.toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });

    it('should create multiple classes for multiple missing years', async () => {
      const targetYear = 2025;
      const courses = [{ id: 1, shiftId: 1, semester: 1, vacancies: 40 }];
      const existingClasses = [{ year: 2022 }];

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

      // Should create classes for 2025, 2024, 2023 (stopping at 2022 which exists)
      expect(createClassUseCase.execute).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
    });

    it('should use default values when optional fields are missing', async () => {
      const targetYear = 2025;
      const courses = [{ id: 1 }]; // minimal course data
      const existingClasses = [{ year: 2024 }];

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
        { id: 1, shiftId: 1, semester: 1, vacancies: 40, name: 'Course 1' },
      ];
      const existingClasses = [{ year: 2024 }];

      mockCreateClassUseCase.execute.mockRejectedValue(
        new Error('Creation failed'),
      );

      const result = await service.projectMissingClasses(
        targetYear,
        courses,
        existingClasses,
      );

      expect(createClassUseCase.execute).toHaveBeenCalled();
      // Should still return array (possibly empty) even on error
      expect(result).toEqual([]);
    });

    it('should handle errors without message property', async () => {
      const targetYear = 2025;
      const courses = [
        { id: 1, shiftId: 1, semester: 1, vacancies: 40, name: 'Course 1' },
      ];
      const existingClasses = [{ year: 2024 }];

      // Throw a non-Error object (string)
      mockCreateClassUseCase.execute.mockRejectedValue('String error');

      const result = await service.projectMissingClasses(
        targetYear,
        courses,
        existingClasses,
      );

      expect(createClassUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should stop after LOOKBACK_LIMIT of 10 years', async () => {
      const targetYear = 2025;
      const courses = [{ id: 1 }];
      const existingClasses: Array<{ year: number }> = []; // No existing classes

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

      // Should stop at LOOKBACK_LIMIT (10 years)
      expect(createClassUseCase.execute).toHaveBeenCalledTimes(11); // targetYear + 10 more years back
    });

    it('should handle multiple courses', async () => {
      const targetYear = 2025;
      const courses = [
        { id: 1, shiftId: 1, semester: 1, vacancies: 40 },
        { id: 2, shiftId: 2, semester: 1, vacancies: 30 },
      ];
      const existingClasses = [{ year: 2024 }];

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

      // 2 courses for 1 missing year
      expect(createClassUseCase.execute).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });
  });
});
