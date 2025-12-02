import { Test, TestingModule } from '@nestjs/testing';
import { ClassController } from './class.controller';
import { CreateClassUseCase } from '../../application/use-cases/create-class.usecase';
import { FindAllClassesUseCase } from '../../application/use-cases/find-all-classes.usecase';
import { FindClassByIdUseCase } from '../../application/use-cases/find-class-by-id.usecase';
import { UpdateClassUseCase } from '../../application/use-cases/update-class.usecase';
import { DeleteClassUseCase } from '../../application/use-cases/delete-class.usecase';
import { CreateClassDto } from '../dtos/create-class.dto';
import { UpdateClassDto } from '../dtos/update-class.dto';
import { Class } from '../../domain/entities/class.entity';

describe('ClassController', () => {
  let controller: ClassController;

  const mockClass: Class = {
    id: 1,
    courseId: 1,
    shiftId: 1,
    year: 2024,
    semester: 1,
    currentStudents: 30,
  } as Class;

  const mockUseCases = {
    create: { execute: jest.fn() },
    findAll: { execute: jest.fn() },
    findById: { execute: jest.fn() },
    update: { execute: jest.fn() },
    delete: { execute: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassController],
      providers: [
        { provide: CreateClassUseCase, useValue: mockUseCases.create },
        { provide: FindAllClassesUseCase, useValue: mockUseCases.findAll },
        { provide: FindClassByIdUseCase, useValue: mockUseCases.findById },
        { provide: UpdateClassUseCase, useValue: mockUseCases.update },
        { provide: DeleteClassUseCase, useValue: mockUseCases.delete },
      ],
    }).compile();

    controller = module.get<ClassController>(ClassController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a class successfully', async () => {
      const dto: CreateClassDto = {
        courseId: 1,
        shiftId: 1,
        year: 2024,
        semester: 1,
        currentStudents: 30,
      };

      mockUseCases.create.execute.mockResolvedValue(mockClass);

      const result = await controller.create(dto);

      expect(result).toEqual({
        id: mockClass.id,
        courseId: mockClass.courseId,
        shiftId: mockClass.shiftId,
        year: mockClass.year,
        semester: mockClass.semester,
        currentStudents: mockClass.currentStudents,
      });
    });
  });

  describe('findAll', () => {
    it('should return all classes', async () => {
      mockUseCases.findAll.execute.mockResolvedValue([mockClass]);

      const result = await controller.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockClass.id,
        courseId: mockClass.courseId,
        shiftId: mockClass.shiftId,
        year: mockClass.year,
        semester: mockClass.semester,
        currentStudents: mockClass.currentStudents,
      });
    });

    it('should return empty array when no classes exist', async () => {
      mockUseCases.findAll.execute.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a class by id', async () => {
      mockUseCases.findById.execute.mockResolvedValue(mockClass);

      const result = await controller.findOne(1);

      expect(result).toEqual({
        id: mockClass.id,
        courseId: mockClass.courseId,
        shiftId: mockClass.shiftId,
        year: mockClass.year,
        semester: mockClass.semester,
        currentStudents: mockClass.currentStudents,
      });
    });

    it('should throw an error when class is not found', async () => {
      mockUseCases.findById.execute.mockRejectedValue(
        new Error('Class not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow('Class not found');
    });
  });

  describe('update', () => {
    it('should update a class successfully', async () => {
      const dto: UpdateClassDto = {
        currentStudents: 35,
      };

      mockUseCases.update.execute.mockResolvedValue(undefined);

      await controller.update(1, dto);

      expect(mockUseCases.update.execute).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a class successfully', async () => {
      mockUseCases.delete.execute.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockUseCases.delete.execute).toHaveBeenCalledWith(1);
    });
  });
});
