import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async createToken(data: Partial<RefreshToken>): Promise<RefreshToken> {
    const entity = this.repository.create(data as RefreshToken);
    return this.repository.save(entity);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const token = await this.repository.findOne({
      where: { tokenHash },
      relations: ['user'],
    });
    return token ?? null;
  }

  async revoke(tokenId: number): Promise<void> {
    await this.repository.update(tokenId, { revoked: true });
  }

  async delete(tokenId: number): Promise<void> {
    await this.repository.delete(tokenId);
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.repository.update({ user: { id: userId } }, { revoked: true });
  }

  async deleteExpiredTokens(): Promise<void> {
    const now = Date.now();
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now })
      .execute();
  }
}
