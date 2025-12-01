import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.usecase';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { UpdateUserDto } from '../../presentation/dtos/update-user.dto';
import { User } from '../../domain/entities/user.entity';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockUser: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      phone: '123456789',
      createdAt: new Date(),
    } as User;

    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe',
        phone: '987654321',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, updateUserDto);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(userRepository.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should update email when provided', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, updateUserDto);

      expect(userRepository.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should update multiple fields', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '987654321',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(undefined);

      await useCase.execute(1, updateUserDto);

      expect(userRepository.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });
});
