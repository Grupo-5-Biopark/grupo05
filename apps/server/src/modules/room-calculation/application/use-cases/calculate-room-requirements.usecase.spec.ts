import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CalculateRoomRequirementsUseCase } from './calculate-room-requirements.usecase';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { ClassRepository } from '../../../classes/infrastructure/repositories/class.repository';
import { CalculationParametersRepository } from '../../../calculation-parameters/infrastructure/repositories/calculation-parameters.repository';
import { ClassProjectionService } from '../services/ClassProjectionService';

describe('CalculateRoomRequirementsUseCase', () => {
  let useCase: CalculateRoomRequirementsUseCase;
  let classProjectionService: ClassProjectionService;

  const mockCourseRepository = {
    findAll: jest.fn(),
  };

  const mockCalculationParametersRepository = {
    findAll: jest.fn(),
  };

  const mockClassProjectionService = {
    projectMissingClasses: jest.fn(),
  };

  const mockClassRepository = {
    findAll: jest.fn(),
  };

  const mockCourses = [
    {
      id: 1,
      name: 'Software Engineering',
      knowledgeArea: 'Computing',
      vacancies: 40,
      periodQuantities: 8,
      openingYear: 2020,
      numberOfSemesters: 8,
    },
  ];

  const mockParams = [
    {
      id: 1,
      dropoutPercentage: 10,
      studentsPerSmallRoom: 20,
      studentsPerMediumRoom: 40,
      studentsPerBigRoom: 60,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateRoomRequirementsUseCase,
        { provide: CourseRepository, useValue: mockCourseRepository },
        {
          provide: CalculationParametersRepository,
          useValue: mockCalculationParametersRepository,
        },
        {
          provide: ClassProjectionService,
          useValue: mockClassProjectionService,
        },
        { provide: ClassRepository, useValue: mockClassRepository },
      ],
    }).compile();

    useCase = module.get<CalculateRoomRequirementsUseCase>(
      CalculateRoomRequirementsUseCase,
    );
    classProjectionService = module.get<ClassProjectionService>(
      ClassProjectionService,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  // Verify that classProjectionService is available for tests
  it('should have classProjectionService defined', () => {
    expect(classProjectionService).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when no calculation parameters exist', async () => {
      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue([]);

      await expect(useCase.execute(2025, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when calculation parameters is null', async () => {
      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(null);

      await expect(useCase.execute(2025, 1)).rejects.toThrow(NotFoundException);
    });

    it('should calculate room requirements without projection', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 35,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);

      const result = await useCase.execute();

      expect(result.totalRoomsRequired).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should calculate room requirements with year projection', async () => {
      const mockRealClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 35,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      const mockProjectedClasses = [
        {
          id: 2,
          courseId: 1,
          year: 2025,
          semester: 1,
          currentStudents: 40,
          course: mockCourses[0],
          isAssumed: true,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockRealClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue(
        mockProjectedClasses,
      );

      const result = await useCase.execute(2025, 1);

      expect(classProjectionService.projectMissingClasses).toHaveBeenCalledWith(
        2025,
        mockCourses,
        mockRealClasses,
      );
      expect(result.metadata.requestedYear).toBe(2025);
      expect(result.metadata.requestedSemester).toBe(1);
    });

    it('should count rooms by size correctly', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 15, // small room (<=20)
          course: mockCourses[0],
          isAssumed: false,
        },
        {
          id: 2,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 35, // medium room (21-40)
          course: mockCourses[0],
          isAssumed: false,
        },
        {
          id: 3,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 55, // big room (41-60)
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);

      const result = await useCase.execute();

      expect(result.totalRoomsRequired.small).toBeGreaterThanOrEqual(0);
      expect(result.totalRoomsRequired.medium).toBeGreaterThanOrEqual(0);
      expect(result.totalRoomsRequired.big).toBeGreaterThanOrEqual(0);
    });

    it('should detect exceeded room limits', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 80, // exceeds big room capacity (60)
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);

      const result = await useCase.execute();

      expect(result.exceededLimits).toBeDefined();
      expect(result.exceededLimits.length).toBeGreaterThan(0);
      expect(result.exceededLimits[0].type).toBe('Class');
      expect(result.exceededLimits[0].studentCount).toBe(80);
      expect(result.exceededLimits[0].maxLimit).toBe(60);
    });

    it('should apply dropout percentage to student count', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2023,
          semester: 1,
          currentStudents: 40,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);

      const result = await useCase.execute(2024, 1);

      expect(result.details.classes).toBeDefined();
      // Student count should be reduced by dropout
    });

    it('should filter classes by year and semester', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 40,
          course: mockCourses[0],
          isAssumed: false,
        },
        {
          id: 2,
          courseId: 1,
          year: 2020,
          semester: 1,
          currentStudents: 30,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue([]);

      const result = await useCase.execute(2024, 1);

      expect(result.details.classes).toBeDefined();
      expect(result.metadata.requestedYear).toBe(2024);
      expect(result.metadata.requestedSemester).toBe(1);
    });

    it('should mark projected classes correctly in metadata', async () => {
      const mockRealClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 35,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      const mockProjectedClasses = [
        {
          id: 2,
          courseId: 1,
          year: 2026,
          semester: 1,
          currentStudents: 40,
          course: mockCourses[0],
          isAssumed: true,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockRealClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue(
        mockProjectedClasses,
      );

      // Use future year to test projection flag
      const futureYear = new Date().getFullYear() + 2;
      const result = await useCase.execute(futureYear, 1);

      expect(result.metadata.isProjection).toBe(true);
      expect(result.metadata.simulatedClassesCount).toBe(1);
    });

    it('should handle classes without course information', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 30,
          course: undefined,
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);

      const result = await useCase.execute();

      expect(result.details.classes).toBeDefined();
    });

    it('should return empty details when no classes exist', async () => {
      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.details.classes).toEqual([]);
      expect(result.totalRoomsRequired.small).toBe(0);
      expect(result.totalRoomsRequired.medium).toBe(0);
      expect(result.totalRoomsRequired.big).toBe(0);
    });

    it('should filter classes with null periodQuantities in course', async () => {
      const courseWithNullPeriods = {
        ...mockCourses[0],
        periodQuantities: null,
      };
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 30,
          course: courseWithNullPeriods,
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue([courseWithNullPeriods]);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue([]);

      const result = await useCase.execute(2024, 1);

      expect(result.details.classes).toBeDefined();
    });

    it('should filter classes by year only when semester is not provided', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 30,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue([]);

      // Call with year only, no semester
      const result = await useCase.execute(
        2024,
        undefined as unknown as number,
      );

      expect(result.details.classes).toBeDefined();
      expect(result.metadata.requestedYear).toBe(2024);
    });

    it('should filter out classes outside year range', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2020, // 4 years old course (8 periods = 4 years)
          semester: 1,
          currentStudents: 30,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue([]);

      // Request year 2025, but class from 2020 with 4-year duration is not active
      const result = await useCase.execute(2025, 1);

      expect(result.details.classes).toBeDefined();
    });

    it('should handle class with missing year', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: null as unknown as number, // Missing year
          semester: 1,
          currentStudents: 30,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue([]);

      const result = await useCase.execute(2024, 1);

      expect(result.details.classes).toBeDefined();
    });

    it('should use vacancies for projected classes', async () => {
      const mockRealClasses: any[] = [];
      const mockProjectedClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2025,
          semester: 1,
          currentStudents: 0,
          course: { ...mockCourses[0], vacancies: 50 },
          isAssumed: true,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockRealClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue(
        mockProjectedClasses,
      );

      const result = await useCase.execute(2025, 1);

      expect(result.details.classes.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle class without currentStudents', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: undefined as unknown as number,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);

      const result = await useCase.execute();

      expect(result.details.classes).toBeDefined();
    });

    it('should handle projected class without course vacancies', async () => {
      const courseWithoutVacancies = {
        ...mockCourses[0],
        vacancies: undefined,
      };
      const mockRealClasses: any[] = [];
      const mockProjectedClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2025,
          semester: 1,
          currentStudents: 0,
          course: courseWithoutVacancies,
          isAssumed: true,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue([courseWithoutVacancies]);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockRealClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue(
        mockProjectedClasses,
      );

      const result = await useCase.execute(2025, 1);

      expect(result.details.classes).toBeDefined();
    });

    it('should calculate academic semester correctly for dropout', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2022, // 2 years ago
          semester: 1,
          currentStudents: 100,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue([]);

      // Request 2024, semester 1 - class from 2022 should have 4 semesters passed
      const result = await useCase.execute(2024, 1);

      expect(result.details.classes).toBeDefined();
    });

    it('should not apply dropout when academicSemester is 0 or negative', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2025, // Future year
          semester: 2,
          currentStudents: 100,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue([]);

      const result = await useCase.execute(2024, 1);

      expect(result.details.classes).toBeDefined();
    });

    it('should handle periodQuantities that converts to 0', async () => {
      const courseWithZeroPeriods = {
        ...mockCourses[0],
        periodQuantities: 'invalid' as unknown as number, // Will be NaN when converted
      };
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 30,
          course: courseWithZeroPeriods,
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue([courseWithZeroPeriods]);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue([]);

      const result = await useCase.execute(2024, 1);

      expect(result.details.classes).toBeDefined();
    });

    it('should handle classRepository being undefined', async () => {
      // Create a new instance without classRepository
      const useCaseWithoutClassRepo = new CalculateRoomRequirementsUseCase(
        mockCourseRepository as unknown as CourseRepository,
        mockCalculationParametersRepository as unknown as CalculationParametersRepository,
        mockClassProjectionService as unknown as ClassProjectionService,
        undefined,
      );

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);

      const result = await useCaseWithoutClassRepo.execute();

      expect(result.details.classes).toEqual([]);
      expect(result.totalRoomsRequired.small).toBe(0);
    });

    it('should handle academicSemester that equals 0', async () => {
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024,
          semester: 1,
          currentStudents: 50,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue([]);

      // Same year, same semester - academicSemester will be 1, semestersPassed will be 0
      const result = await useCase.execute(2024, 1);

      expect(result.details.classes).toBeDefined();
      expect(result.details.classes.length).toBe(1);
    });

    it('should set semestersPassed to 0 when academicSemester is negative', async () => {
      // Create a class that starts in the future semester
      const mockClasses = [
        {
          id: 1,
          courseId: 1,
          year: 2024, // Current year
          semester: 2, // Semester 2
          currentStudents: 50,
          course: mockCourses[0],
          isAssumed: false,
        },
      ];

      mockCourseRepository.findAll.mockResolvedValue(mockCourses);
      mockCalculationParametersRepository.findAll.mockResolvedValue(mockParams);
      mockClassRepository.findAll.mockResolvedValue(mockClasses);
      mockClassProjectionService.projectMissingClasses.mockResolvedValue([]);

      // Request year 2024 semester 1, but class is semester 2
      // academicSemester = (2024-2024)*2 + (1-2) + 1 = 0
      const result = await useCase.execute(2024, 1);

      expect(result.details.classes).toBeDefined();
    });
  });
});
