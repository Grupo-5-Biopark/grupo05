import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { User } from '../../domain/entities/user.entity';
import { IHashingService } from '../../domain/services/hashing.service';
import { HASHING_SERVICE } from '../../domain/constants/tokens';
import { DuplicateEmailException } from '../../domain/exceptions/duplicate-email.exception';

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
    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

  async execute(data: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new DuplicateEmailException(data.email);
    }

    const user = new User(this.hashingService);
    user.name = data.name;
    user.email = data.email;
    user.role = data.role;
    await user.setPassword(data.password);

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

// TODO Token JWT
// TODO API de login
// TODO role deve ser hardcoded temporariamente
