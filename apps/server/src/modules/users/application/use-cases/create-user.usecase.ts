import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { User } from '../../domain/entities/user.entity';
import { DuplicateEmailException } from '../../domain/exceptions/duplicate-email.exception';
import { UserPasswordService } from '../../domain/services/user-password.service';

interface PostgresError {
  code: string;
  detail: string;
}

function isPostgresError(error: unknown): error is PostgresError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string' &&
    'detail' in error &&
    typeof (error as any).detail === 'string'
  );
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPasswordService: UserPasswordService,
  ) {}

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
