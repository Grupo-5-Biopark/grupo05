import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseRepository } from '../course.repository';
import { Course } from '../../../domain/entities/course.entity';

describe('CourseRepository', () => {
  let courseRepository: CourseRepository;
  let repository: Repository<Course>;

  const mockCourse = {
    id: 1,
    name: 'Computer Science',
    announcement: 2024,
    knowledgeArea: 'Technology',
    status: 'active',
    expectedStudents: 30,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseRepository,
        {
          provide: getRepositoryToken(Course),
          useValue: mockRepository,
        },
      ],
    }).compile();

    courseRepository = module.get<CourseRepository>(CourseRepository);
    repository = module.get<Repository<Course>>(getRepositoryToken(Course));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a course', async () => {
      const courseData = {
        name: 'Engineering',
        announcement: 2024,
      };

      mockRepository.create.mockReturnValue(courseData);
      mockRepository.save.mockResolvedValue({ ...mockCourse, ...courseData });

      const result = await courseRepository.create(courseData);

      expect(repository.create).toHaveBeenCalledWith(courseData);
      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toBe(courseData.name);
    });
  });

  describe('findAll', () => {
    it('should return an array of courses', async () => {
      mockRepository.find.mockResolvedValue([mockCourse]);

      const result = await courseRepository.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockCourse]);
    });

    it('should return empty array when no courses exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await courseRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a course when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockCourse);

      const result = await courseRepository.findById(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockCourse);
    });

    it('should return null when course not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await courseRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return a course when found by name', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockCourse);

      const result = await courseRepository.findByName('Computer Science');

      expect(repository.findOneBy).toHaveBeenCalledWith({
        name: 'Computer Science',
      });
      expect(result).toEqual(mockCourse);
    });

    it('should return null when course not found by name', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await courseRepository.findByName('Nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const updateData = { name: 'Updated Course' };
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await courseRepository.update(1, updateData);

      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('delete', () => {
    it('should delete a course', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await courseRepository.delete(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});
