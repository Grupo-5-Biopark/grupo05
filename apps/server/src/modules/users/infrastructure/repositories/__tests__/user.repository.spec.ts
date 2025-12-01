import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../user.repository';
import { User } from '../../../domain/entities/user.entity';
import { HASHING_SERVICE } from '../../../domain/constants/tokens';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let repository: Repository<User>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    active: true,
    validatePassword: jest.fn(),
  };

  const mockHashingService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: HASHING_SERVICE,
          useValue: mockHashingService,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a hydrated user', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'hashedPassword',
      };

      mockRepository.save.mockResolvedValue({ ...mockUser, ...userData });

      const result = await userRepository.create(userData);

      expect(repository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.name).toBe(userData.name);
    });

    it('should throw error if hydration fails after creation', async () => {
      mockRepository.save.mockResolvedValue(null);

      await expect(userRepository.create({})).rejects.toThrow(
        'Failed to hydrate user after creation',
      );
    });

    it('should throw error when HashingService is not provided', () => {
      // Create instance without hashing service - testing defensive code
      const repositoryWithoutService = new UserRepository(
        repository,
        null as unknown as typeof mockHashingService,
      );

      expect(() => {
        // Access private method for testing defensive programming

        (
          repositoryWithoutService as unknown as {
            createUserInstance: () => void;
          }
        ).createUserInstance();
      }).toThrow(
        'HashingService is required but not provided to UserRepository',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of hydrated users', async () => {
      mockRepository.find.mockResolvedValue([mockUser, { ...mockUser, id: 2 }]);

      const result = await userRepository.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await userRepository.findAll();

      expect(result).toEqual([]);
    });

    it('should filter out null values during hydration', async () => {
      mockRepository.find.mockResolvedValue([mockUser, null]);

      const result = await userRepository.findAll();

      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return a hydrated user when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await userRepository.findById(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBeDefined();
    });

    it('should return null when user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await userRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should call repository update with correct parameters', async () => {
      const updateData = { name: 'Updated Name' };
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await userRepository.update(1, updateData);

      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('delete', () => {
    it('should call repository delete with correct id', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await userRepository.delete(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findByEmail', () => {
    it('should return a hydrated user when found by email', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(repository.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(result).toBeDefined();
    });

    it('should return null when user not found by email', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await userRepository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('hydration methods', () => {
    it('should hydrate user with all properties', async () => {
      const userWithProps = {
        id: 1,
        name: 'Test',
        email: 'test@example.com',
        customProp: 'value',
      };
      mockRepository.findOneBy.mockResolvedValue(userWithProps);

      const result = await userRepository.findById(1);

      expect(result).toBeDefined();
    });

    it('should handle hydration of empty user object', async () => {
      mockRepository.findOneBy.mockResolvedValue({});

      const result = await userRepository.findById(1);

      expect(result).toBeDefined();
    });
  });
});
