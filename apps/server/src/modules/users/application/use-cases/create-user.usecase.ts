import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { User } from '../../domain/entities/user.entity';
import { DuplicateEmailException } from '../../domain/exceptions/duplicate-email.exception';
import { UserPasswordService } from '../../domain/services/user-password.service';

/**
 * Interface representing PostgreSQL errors.
 * Used to identify unique constraint violations.
 */
interface PostgresError {
  code: string;
  detail: string;
}

function isPostgresError(error: unknown): error is PostgresError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: string }).code === 'string' &&
    'detail' in error &&
    typeof (error as { detail?: string }).detail === 'string'
  );
}

/**
 * Use case responsible for creating new users in the system.
 *
 * @description This use case implements the business logic for user creation,
 * including unique email validation, password hashing, and database persistence.
 *
 * @example
 * ```typescript
 * const user = await createUserUseCase.execute({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'password123',
 *   role: 'admin'
 * });
 * ```
 */
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPasswordService: UserPasswordService,
  ) {}

  /**
   * Executes the creation of a new user.
   *
   * @param data - User data to be created (name, email, password, role, phone)
   * @returns Promise<User> - The created user with generated ID
   * @throws DuplicateEmailException - When the email is already registered in the system
   */
  async execute(data: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new DuplicateEmailException(data.email);
    }

    const user = new User();
    user.name = data.name;
    user.email = data.email;
    user.role = data.role;
    user.phone = data.phone;

    const hashedPassword = await this.userPasswordService.hashPassword(
      data.password,
    );
    user.setPassword(hashedPassword);

    try {
      return await this.userRepository.create(user);
    } catch (error: unknown) {
      // If somehow a race condition occurred and the email was created after our check
      if (
        isPostgresError(error) &&
        error.code === '23505' &&
        error.detail.includes('email')
      ) {
        throw new DuplicateEmailException(data.email);
      }
      throw error;
    }
  }
}
