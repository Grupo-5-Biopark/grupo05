import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

/**
 * Use case responsible for removing a user from the system.
 *
 * @description Permanently removes a user from the database.
 * Verifies user existence before performing the deletion.
 */
@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Executes the removal of a user.
   *
   * @param id - Unique identifier of the user to be removed
   * @throws NotFoundException - When the user is not found
   */
  async execute(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.delete(id);
  }
}
