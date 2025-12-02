import { Test, TestingModule } from '@nestjs/testing';
import { UserPasswordService } from './user-password.service';
import { HASHING_SERVICE } from '../constants/tokens';
import { IHashingService } from './hashing.service';
import { User } from '../entities/user.entity';

describe('UserPasswordService', () => {
  let service: UserPasswordService;
  let hashingService: IHashingService;

  const mockHashingService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPasswordService,
        {
          provide: HASHING_SERVICE,
          useValue: mockHashingService,
        },
      ],
    }).compile();

    service = module.get<UserPasswordService>(UserPasswordService);
    hashingService = module.get<IHashingService>(HASHING_SERVICE);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a plain password', async () => {
      const plainPassword = 'mySecretPassword123';
      const hashedPassword = 'hashedPassword123';

      mockHashingService.hash.mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(plainPassword);

      expect(result).toBe(hashedPassword);
      expect(hashingService.hash).toHaveBeenCalledWith(plainPassword);
    });
  });

  describe('validatePassword', () => {
    it('should return true when password is valid', async () => {
      const user = {
        getPassword: jest.fn().mockReturnValue('hashedPassword123'),
      } as unknown as User;
      const plainPassword = 'mySecretPassword123';

      mockHashingService.compare.mockResolvedValue(true);

      const result = await service.validatePassword(user, plainPassword);

      expect(result).toBe(true);
      expect(hashingService.compare).toHaveBeenCalledWith(
        plainPassword,
        'hashedPassword123',
      );
    });

    it('should return false when password is invalid', async () => {
      const user = {
        getPassword: jest.fn().mockReturnValue('hashedPassword123'),
      } as unknown as User;
      const plainPassword = 'wrongPassword';

      mockHashingService.compare.mockResolvedValue(false);

      const result = await service.validatePassword(user, plainPassword);

      expect(result).toBe(false);
      expect(hashingService.compare).toHaveBeenCalledWith(
        plainPassword,
        'hashedPassword123',
      );
    });
  });
});
