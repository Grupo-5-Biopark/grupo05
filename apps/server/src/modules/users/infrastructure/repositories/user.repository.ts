import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { IHashingService } from '../../domain/services/hashing.service';
import { HASHING_SERVICE } from '../../domain/constants/tokens';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

  private createUserInstance(): User {
    if (!this.hashingService) {
      throw new Error(
        'HashingService is required but not provided to UserRepository',
      );
    }
    return new User();
  }

  private hydrateUser(user: User | null): User | null {
    if (!user) return null;

    const hydratedUser = this.createUserInstance();
    // Copiar todas as propriedades, incluindo as privadas
    for (const prop of Object.getOwnPropertyNames(user)) {
      const source = user as unknown as Record<string, unknown>;
      const target = hydratedUser as unknown as Record<string, unknown>;
      target[prop] = source[prop];
    }

    return hydratedUser;
  }

  private hydrateUsers(users: User[]): User[] {
    return users
      .map((user) => this.hydrateUser(user))
      .filter((user): user is User => user !== null);
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.createUserInstance();
    Object.assign(user, userData);
    const savedUser = await this.repository.save(user);
    const hydratedUser = this.hydrateUser(savedUser);
    if (!hydratedUser) {
      throw new Error('Failed to hydrate user after creation');
    }
    return hydratedUser;
  }

  async findAll(): Promise<User[]> {
    const users = await this.repository.find();
    return this.hydrateUsers(users);
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.repository.findOneBy({ id });
    return this.hydrateUser(user);
  }

  async update(id: number, userData: Partial<User>): Promise<void> {
    await this.repository.update(id, userData);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOneBy({ email });
    return this.hydrateUser(user);
  }
}
