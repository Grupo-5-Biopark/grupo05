import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

/**
 * Use case responsible for finding a specific user by ID.
 *
 * @description Retrieves user data based on their unique identifier.
 * Throws an exception if the user is not found.
 */
@Injectable()
export class FindUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Executes the user search by ID.
   *
   * @param id - Unique identifier of the user
   * @returns Promise<User> - The found user
   * @throws NotFoundException - When the user is not found
   */
  async execute(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
