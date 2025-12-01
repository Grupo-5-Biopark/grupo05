import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindUserByIdUseCase } from './find-user-by-id.usecase';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

describe('FindUserByIdUseCase', () => {
  let useCase: FindUserByIdUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserByIdUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindUserByIdUseCase>(FindUserByIdUseCase);
    userRepository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a user when found', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        phone: '123456789',
        createdAt: new Date(),
      } as User;

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute(1);

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should throw an error when repository fails', async () => {
      mockUserRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(useCase.execute(1)).rejects.toThrow('Database error');
    });
  });
});
