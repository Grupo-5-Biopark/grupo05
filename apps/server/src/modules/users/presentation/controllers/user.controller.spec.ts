import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CreateUserUseCase } from '../../application/use-cases/create-user.usecase';
import { FindAllUsersUseCase } from '../../application/use-cases/find-all-users.usecase';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.usecase';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.usecase';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.usecase';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../../domain/entities/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let createUserUseCase: CreateUserUseCase;
  let findAllUsersUseCase: FindAllUsersUseCase;
  let findUserByIdUseCase: FindUserByIdUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let deleteUserUseCase: DeleteUserUseCase;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    phone: '123456789',
    createdAt: new Date('2024-01-01'),
    setPassword: jest.fn(),
    getPassword: jest.fn(),
  } as unknown as User;

  const mockCreateUserUseCase = {
    execute: jest.fn(),
  };

  const mockFindAllUsersUseCase = {
    execute: jest.fn(),
  };

  const mockFindUserByIdUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateUserUseCase = {
    execute: jest.fn(),
  };

  const mockDeleteUserUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: mockCreateUserUseCase,
        },
        {
          provide: FindAllUsersUseCase,
          useValue: mockFindAllUsersUseCase,
        },
        {
          provide: FindUserByIdUseCase,
          useValue: mockFindUserByIdUseCase,
        },
        {
          provide: UpdateUserUseCase,
          useValue: mockUpdateUserUseCase,
        },
        {
          provide: DeleteUserUseCase,
          useValue: mockDeleteUserUseCase,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    findAllUsersUseCase = module.get<FindAllUsersUseCase>(FindAllUsersUseCase);
    findUserByIdUseCase = module.get<FindUserByIdUseCase>(FindUserByIdUseCase);
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    deleteUserUseCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'admin',
        phone: '123456789',
      };

      mockCreateUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        phone: mockUser.phone,
        createdAt: mockUser.createdAt,
      });
      expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
      expect(createUserUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when usecase fails', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'admin',
        phone: '123456789',
      };

      mockCreateUserUseCase.execute.mockRejectedValue(
        new Error('Failed to create user'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Failed to create user',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser];
      mockFindAllUsersUseCase.execute.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual([
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          phone: mockUser.phone,
          createdAt: mockUser.createdAt,
        },
      ]);
      expect(findAllUsersUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no users exist', async () => {
      mockFindAllUsersUseCase.execute.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(findAllUsersUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockFindUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        phone: mockUser.phone,
        createdAt: mockUser.createdAt,
      });
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when user is not found', async () => {
      mockFindUserByIdUseCase.execute.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe',
        phone: '987654321',
      };

      mockUpdateUserUseCase.execute.mockResolvedValue(undefined);

      await controller.update(1, updateUserDto);

      expect(updateUserUseCase.execute).toHaveBeenCalledWith(1, updateUserDto);
      expect(updateUserUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when update fails', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe',
      };

      mockUpdateUserUseCase.execute.mockRejectedValue(
        new Error('Failed to update user'),
      );

      await expect(controller.update(1, updateUserDto)).rejects.toThrow(
        'Failed to update user',
      );
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      mockDeleteUserUseCase.execute.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(deleteUserUseCase.execute).toHaveBeenCalledWith(1);
      expect(deleteUserUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when delete fails', async () => {
      mockDeleteUserUseCase.execute.mockRejectedValue(
        new Error('Failed to delete user'),
      );

      await expect(controller.remove(1)).rejects.toThrow(
        'Failed to delete user',
      );
    });
  });
});
