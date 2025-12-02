import { Test, TestingModule } from '@nestjs/testing';
import { BcryptHashingService } from '../bcrypt-hashing.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('BcryptHashingService', () => {
  let service: BcryptHashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptHashingService],
    }).compile();

    service = module.get<BcryptHashingService>(BcryptHashingService);

    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('should hash a password successfully', async () => {
      const password = 'mySecurePassword123';
      const hashedPassword = '$2b$10$abcdefghijklmnopqrstuv';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hash(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should throw error when hashing fails', async () => {
      const password = 'myPassword';
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

      await expect(service.hash(password)).rejects.toThrow(
        'Error hashing password',
      );
    });

    it('should use SALT_ROUNDS of 10', async () => {
      const password = 'testPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      await service.hash(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('compare', () => {
    it('should return true when passwords match', async () => {
      const password = 'myPassword';
      const hashedPassword = '$2b$10$hashedValue';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.compare(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      const password = 'wrongPassword';
      const hashedPassword = '$2b$10$hashedValue';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.compare(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('should throw error when comparison fails', async () => {
      const password = 'myPassword';
      const hashedPassword = 'invalid';

      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Comparison error'),
      );

      await expect(service.compare(password, hashedPassword)).rejects.toThrow(
        'Error comparing passwords',
      );
    });

    it('should handle empty string comparison', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.compare('', 'hashedValue');

      expect(result).toBe(false);
    });
  });
});
