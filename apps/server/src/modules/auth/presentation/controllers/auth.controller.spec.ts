import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
    logout: jest.fn(),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockLoginResponse = {
        access_token: 'mock.jwt.token',
        refresh_token: 'mock.refresh.token',
        expires_in: 3600,
        refresh_expires_in: 604800,
      };

      mockAuthService.login.mockResolvedValue(mockLoginResponse);
      const res = mockResponse();

      await controller.login(loginDto, res);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        mockLoginResponse.refresh_token,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
      expect(res.json).toHaveBeenCalledWith({
        access_token: mockLoginResponse.access_token,
        expires_in: mockLoginResponse.expires_in,
      });
    });

    it('should throw error when login fails', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));
      const res = mockResponse();

      await expect(controller.login(loginDto, res)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
