import { Injectable, Inject } from '@nestjs/common';
import { HASHING_SERVICE } from '../constants/tokens';
import { IHashingService } from '../services/hashing.service';
import { User } from '../entities/user.entity';

@Injectable()
export class UserPasswordService {
  constructor(
    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

  async hashPassword(plainPassword: string): Promise<string> {
    return this.hashingService.hash(plainPassword);
  }

  async validatePassword(user: User, plainPassword: string): Promise<boolean> {
    return this.hashingService.compare(plainPassword, user.getPassword());
  }
}
