import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserRepository } from '../../../users/infrastructure/repositories/user.repository';
import { UserPasswordService } from '../../../users/domain/services/user-password.service';
import { User } from '../../../users/domain/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let userPasswordService: UserPasswordService;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    phone: '123456789',
    createdAt: new Date(),
    getPassword: jest.fn().mockReturnValue('hashedPassword'),
  } as unknown as User;

  const mockUserRepository = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUserPasswordService = {
    validatePassword: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserPasswordService, useValue: mockUserPasswordService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    userPasswordService = module.get<UserPasswordService>(UserPasswordService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserPasswordService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('john@example.com', 'password');

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(userPasswordService.validatePassword).toHaveBeenCalledWith(
        mockUser,
        'password',
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('unknown@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
      expect(userPasswordService.validatePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserPasswordService.validatePassword.mockResolvedValue(false);

      await expect(
        service.validateUser('john@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access token on successful login', async () => {
      const mockToken = 'mock.jwt.token';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserPasswordService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);
      mockConfigService.get.mockReturnValue(undefined);

      const result = await service.login('john@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
    });

    it('should return access token with expires_in when configured with seconds', async () => {
      const mockToken = 'mock.jwt.token';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserPasswordService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return '3600';
        if (key === 'JWT_TTL_SECONDS') return undefined;
        return undefined;
      });

      const result = await service.login('john@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
        expires_in: 3600,
      });
    });

    it('should return access token with expires_in when configured with time format', async () => {
      const mockToken = 'mock.jwt.token';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserPasswordService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return '1h';
        if (key === 'JWT_TTL_SECONDS') return undefined;
        return undefined;
      });

      const result = await service.login('john@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
        expires_in: 3600,
      });
    });

    it('should return access token with expires_in when JWT_EXPIRES_IN is a number', async () => {
      const mockToken = 'mock.jwt.token';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserPasswordService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return 7200; // Number instead of string
        if (key === 'JWT_TTL_SECONDS') return undefined;
        return undefined;
      });

      const result = await service.login('john@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
        expires_in: 7200,
      });
    });

    it('should parse seconds format (30s)', async () => {
      const mockToken = 'mock.jwt.token';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserPasswordService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return '30s';
        return undefined;
      });

      const result = await service.login('john@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
        expires_in: 30,
      });
    });

    it('should parse minutes format (15m)', async () => {
      const mockToken = 'mock.jwt.token';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserPasswordService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return '15m';
        return undefined;
      });

      const result = await service.login('john@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
        expires_in: 900, // 15 * 60
      });
    });

    it('should parse days format (7d)', async () => {
      const mockToken = 'mock.jwt.token';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserPasswordService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return '7d';
        return undefined;
      });

      const result = await service.login('john@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
        expires_in: 604800, // 7 * 86400
      });
    });

    it('should use JWT_TTL_SECONDS when JWT_EXPIRES_IN is not set', async () => {
      const mockToken = 'mock.jwt.token';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserPasswordService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return undefined;
        if (key === 'JWT_TTL_SECONDS') return 7200;
        return undefined;
      });

      const result = await service.login('john@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
        expires_in: 7200,
      });
    });

    it('should not include expires_in when format is invalid', async () => {
      const mockToken = 'mock.jwt.token';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserPasswordService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return 'invalid-format';
        return undefined;
      });

      const result = await service.login('john@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
      });
      expect(result.expires_in).toBeUndefined();
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('invalid@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
