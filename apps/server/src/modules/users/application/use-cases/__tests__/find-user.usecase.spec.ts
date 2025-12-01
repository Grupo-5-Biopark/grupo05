import { Test, TestingModule } from '@nestjs/testing';
import { FindUserUseCase } from '../find-user.usecase';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

describe('FindUserUseCase', () => {
  let useCase: FindUserUseCase;
  let userRepository: UserRepository;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    phone: '123456789',
    createdAt: new Date(),
    setPassword: jest.fn(),
    getPassword: jest.fn().mockReturnValue('hashedPassword'),
  } as unknown as User;

  const mockUserRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindUserUseCase>(FindUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute(1);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(999);

      expect(userRepository.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should pass correct id to repository', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await useCase.execute(42);

      expect(userRepository.findById).toHaveBeenCalledWith(42);
    });
  });
});
