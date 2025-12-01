import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './delete-user.usecase';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a user successfully', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        phone: '123456789',
        createdAt: new Date(),
      } as User;

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(1);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
      expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw an error when delete fails', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        phone: '123456789',
        createdAt: new Date(),
      } as User;

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(1)).rejects.toThrow('Database error');
    });
  });
});
