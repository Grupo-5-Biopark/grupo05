import { Test, TestingModule } from '@nestjs/testing';
import { CreateClassUseCase } from './create-class.usecase';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { CreateClassDto } from '../../presentation/dtos/create-class.dto';
import { Class } from '../../domain/entities/class.entity';

describe('CreateClassUseCase', () => {
  let useCase: CreateClassUseCase;
  let repository: ClassRepository;

  const mockRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClassUseCase,
        { provide: ClassRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateClassUseCase>(CreateClassUseCase);
    repository = module.get<ClassRepository>(ClassRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a class successfully', async () => {
      const dto: CreateClassDto = {
        courseId: 1,
        shiftId: 1,
        year: 2024,
        semester: 1,
        currentStudents: 30,
      };

      const mockClass: Class = {
        id: 1,
        ...dto,
      } as Class;

      mockRepository.create.mockResolvedValue(mockClass);

      const result = await useCase.execute(dto);

      expect(result).toEqual(mockClass);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId: dto.courseId,
          shiftId: dto.shiftId,
          year: dto.year,
          semester: dto.semester,
          currentStudents: dto.currentStudents,
        }),
      );
    });

    it('should throw error when repository fails', async () => {
      const dto: CreateClassDto = {
        courseId: 1,
        shiftId: 1,
        year: 2024,
        semester: 1,
        currentStudents: 30,
      };

      mockRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(dto)).rejects.toThrow('Database error');
    });

    it('should create a class with isAssumed when provided', async () => {
      const dto: CreateClassDto = {
        courseId: 1,
        shiftId: 1,
        year: 2024,
        semester: 1,
        currentStudents: 30,
        isAssumed: true,
      };

      const mockClass: Class = {
        id: 1,
        ...dto,
      } as Class;

      mockRepository.create.mockResolvedValue(mockClass);

      const result = await useCase.execute(dto);

      expect(result).toEqual(mockClass);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId: dto.courseId,
          shiftId: dto.shiftId,
          year: dto.year,
          semester: dto.semester,
          currentStudents: dto.currentStudents,
          isAssumed: true,
        }),
      );
    });

    it('should create a class with isAssumed false when explicitly set to false', async () => {
      const dto: CreateClassDto = {
        courseId: 1,
        shiftId: 1,
        year: 2024,
        semester: 1,
        currentStudents: 30,
        isAssumed: false,
      };

      const mockClass: Class = {
        id: 1,
        ...dto,
      } as Class;

      mockRepository.create.mockResolvedValue(mockClass);

      const result = await useCase.execute(dto);

      expect(result).toEqual(mockClass);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isAssumed: false,
        }),
      );
    });
  });
});
