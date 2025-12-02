import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredTokens() {
    this.logger.log('Starting cleanup of expired refresh tokens');

    try {
      await this.refreshTokenRepository.deleteExpiredTokens();
      this.logger.log('Successfully cleaned up expired refresh tokens');
    } catch (error) {
      this.logger.error('Failed to cleanup expired tokens', error);
    }
  }
}
