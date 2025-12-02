import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

/**
 * Use case responsible for listing all users in the system.
 *
 * @description Retrieves all users registered in the database.
 * Primarily used for administrative user management screens.
 */
@Injectable()
export class FindAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Executes the retrieval of all users.
   *
   * @returns Promise<User[]> - List of all registered users
   */
  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
