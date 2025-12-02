import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { UpdateUserDto } from '../../presentation/dtos/update-user.dto';

/**
 * Use case responsible for updating user data.
 *
 * @description Allows partial update of an existing user's data.
 * Verifies user existence before performing the update.
 */
@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Executes the update of user data.
   *
   * @param id - Unique identifier of the user to be updated
   * @param data - Partial data for update
   * @throws NotFoundException - When the user is not found
   */
  async execute(id: number, data: UpdateUserDto): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.update(id, data);
  }
}
