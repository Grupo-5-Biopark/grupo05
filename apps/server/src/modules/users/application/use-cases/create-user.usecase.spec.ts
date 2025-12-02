import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.usecase';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { UserPasswordService } from '../../domain/services/user-password.service';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { User } from '../../domain/entities/user.entity';
import { DuplicateEmailException } from '../../domain/exceptions/duplicate-email.exception';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: UserRepository;
  let userPasswordService: UserPasswordService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockUserPasswordService = {
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: UserPasswordService,
          useValue: mockUserPasswordService,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    userPasswordService = module.get<UserPasswordService>(UserPasswordService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'admin',
      phone: '123456789',
    };

    it('should create a user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const mockUser = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        role: createUserDto.role,
        phone: createUserDto.phone,
        createdAt: new Date(),
        setPassword: jest.fn(),
        getPassword: jest.fn(),
      } as unknown as User;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserPasswordService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await useCase.execute(createUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(userPasswordService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw DuplicateEmailException when email already exists', async () => {
      const existingUser = {
        id: 1,
        email: createUserDto.email,
      } as User;

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        DuplicateEmailException,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(userPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw DuplicateEmailException on database constraint violation', async () => {
      const hashedPassword = 'hashedPassword123';
      const dbError = {
        code: '23505',
        detail: 'Key (email)=(john@example.com) already exists.',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserPasswordService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockRejectedValue(dbError);

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        DuplicateEmailException,
      );
    });

    it('should rethrow other database errors', async () => {
      const hashedPassword = 'hashedPassword123';
      const dbError = new Error('Database connection error');

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserPasswordService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockRejectedValue(dbError);

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        'Database connection error',
      );
    });

    it('should handle user without phone', async () => {
      const createUserDtoNoPhone: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        phone: undefined,
      };

      const hashedPassword = 'hashedPassword123';
      const mockUser = {
        id: 2,
        name: createUserDtoNoPhone.name,
        email: createUserDtoNoPhone.email,
        role: createUserDtoNoPhone.role,
        phone: null,
        createdAt: new Date(),
      } as User;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserPasswordService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await useCase.execute(createUserDtoNoPhone);

      expect(result).toEqual(mockUser);
    });
  });
});
