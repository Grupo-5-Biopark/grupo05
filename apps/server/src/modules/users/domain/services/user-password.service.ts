import { Injectable, Inject } from '@nestjs/common';
import { HASHING_SERVICE } from '../constants/tokens';
import { IHashingService } from '../services/hashing.service';
import { User } from '../entities/user.entity';

/**
 * Domain service responsible for managing user passwords.
 *
 * @description This service encapsulates password hashing and validation logic,
 * delegating the concrete implementation to the injected IHashingService.
 * This allows swapping the hashing algorithm (bcrypt, argon2, etc.) without modifying
 * the code that uses this service.
 *
 * @example
 * ```typescript
 * // Hash a new password
 * const hashedPassword = await userPasswordService.hashPassword('password123');
 *
 * // Validate password
 * const isValid = await userPasswordService.validatePassword(user, 'password123');
 * ```
 */
@Injectable()
export class UserPasswordService {
  constructor(
    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

  /**
   * Generates a hash from a plain text password.
   *
   * @param plainPassword - Plain text password to be hashed
   * @returns Promise<string> - Hashed password
   */
  async hashPassword(plainPassword: string): Promise<string> {
    return this.hashingService.hash(plainPassword);
  }

  /**
   * Validates if a plain text password matches the user's hashed password.
   *
   * @param user - User entity containing the hashed password
   * @param plainPassword - Plain text password to be validated
   * @returns Promise<boolean> - True if password is valid, false otherwise
   */
  async validatePassword(user: User, plainPassword: string): Promise<boolean> {
    return this.hashingService.compare(plainPassword, user.getPassword());
  }
}
