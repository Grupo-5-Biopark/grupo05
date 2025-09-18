import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IHashingService } from '../services/hashing.service';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  private password: string;

  @Column()
  role: string;

  constructor(private readonly hashingService?: IHashingService) {}

  async setPassword(plainPassword: string): Promise<void> {
    if (!this.hashingService) {
      throw new Error('HashingService not provided');
    }
    this.password = await this.hashingService.hash(plainPassword);
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    if (!this.hashingService) {
      throw new Error('HashingService not provided');
    }
    return this.hashingService.compare(plainPassword, this.password);
  }

  getPassword(): string {
    return this.password;
  }
}
