import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { IHashingService } from '../../domain/services/hashing.service';

@Injectable()
export class BcryptHashingService implements IHashingService {
  private readonly SALT_ROUNDS = 10;

  async hash(value: string): Promise<string> {
    try {
      return await hash(value, this.SALT_ROUNDS);
    } catch {
      throw new Error('Error hashing password');
    }
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    try {
      return await compare(value, hashedValue);
    } catch {
      throw new Error('Error comparing passwords');
    }
  }
}
