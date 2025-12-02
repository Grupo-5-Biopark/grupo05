import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../../users/domain/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'token_hash', length: 512 })
  tokenHash: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ name: 'expires_at', type: 'bigint' })
  expiresAt: number; // store as epoch ms

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'revoked', default: false })
  revoked: boolean;
}
