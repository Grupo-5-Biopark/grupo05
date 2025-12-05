import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassRepository } from '../class.repository';
import { Class } from '../../../domain/entities/class.entity';

describe('ClassRepository', () => {
  let classRepository: ClassRepository;
  let repository: Repository<Class>;

  const mockClass = {
    id: 1,
    courseId: 1,
    shiftId: 1,
    year: 2024,
    semester: 1,
    currentStudents: 30,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassRepository,
        {
          provide: getRepositoryToken(Class),
          useValue: mockRepository,
        },
      ],
    }).compile();

    classRepository = module.get<ClassRepository>(ClassRepository);
    repository = module.get<Repository<Class>>(getRepositoryToken(Class));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a class', async () => {
      const classData = {
        courseId: 2,
        shiftId: 1,
        year: 2024,
        semester: 2,
        currentStudents: 25,
      };

      mockRepository.create.mockReturnValue(classData);
      mockRepository.save.mockResolvedValue({ ...mockClass, ...classData });

      const result = await classRepository.create(classData);

      expect(repository.create).toHaveBeenCalledWith(classData);
      expect(repository.save).toHaveBeenCalled();
      expect(result.courseId).toBe(classData.courseId);
    });
  });

  describe('findAll', () => {
    it('should return an array of classes', async () => {
      mockRepository.find.mockResolvedValue([mockClass]);

      const result = await classRepository.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockClass]);
    });

    it('should return empty array when no classes exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await classRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a class when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockClass);

      const result = await classRepository.findById(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['course', 'shift'],
      });
      expect(result).toEqual(mockClass);
    });

    it('should return null when class not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await classRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a class', async () => {
      const updateData = { semester: 2 };
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await classRepository.update(1, updateData);

      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('delete', () => {
    it('should delete a class', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await classRepository.delete(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});
