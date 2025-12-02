import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../../users/infrastructure/repositories/user.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import * as crypto from 'node:crypto';
import { createHash } from 'node:crypto';
import { UserPasswordService } from '../../../users/domain/services/user-password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly userPasswordService: UserPasswordService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  parseDurationToSeconds(v: string | number | undefined): number | undefined {
    if (!v && v !== 0) return undefined;
    if (typeof v === 'number') return v;
    const str = String(v).trim();
    // if it's pure number (seconds)
    if (/^\d+$/.test(str)) return Number(str);
    // support formats like '30s', '15m', '1h', '7d'
    const regex = /^(\d+)[smhd]$/i;
    const m = regex.exec(str);
    if (m) {
      const n = Number(m[1]);
      const unit = str.slice(-1).toLowerCase();
      switch (unit) {
        case 's':
          return n;
        case 'm':
          return n * 60;
        case 'h':
          return n * 3600;
        case 'd':
          return n * 86400;
      }
    }
    return undefined;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userPasswordService.validatePassword(
      user,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    refresh_expires_in?: number;
  }> {
    const user = await this.validateUser(email, password);
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.name,
      user.role,
    );

    // Determine expires_in in seconds for client convenience.
    const expiresInEnv = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRY',
    );
    const refreshExpiresInEnv = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRY',
    );

    const expires_in = this.parseDurationToSeconds(expiresInEnv) ?? 3600; // Default 1 hour
    const refresh_expires_in =
      this.parseDurationToSeconds(refreshExpiresInEnv) ?? 7 * 24 * 3600; // Default 7 days

    return {
      ...tokens,
      expires_in,
      refresh_expires_in,
    };
  }

  /**
   * Generate access and refresh tokens for a user
   */
  private async generateTokens(
    userId: number,
    email: string,
    name: string,
    role: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      sub: userId,
      email,
      name,
      role,
    };

    // Access token - short-lived (1 hour)
    const access_token = this.jwtService.sign(payload);

    // Generate an opaque refresh token (random) and persist its hash server-side
    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    const refreshTokenExpiry = this.parseDurationToSeconds(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRY'),
    );

    const expiresInSeconds = refreshTokenExpiry ?? 7 * 24 * 3600;
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    // Persist hashed token
    await this.refreshTokenRepository.createToken({
      tokenHash,
      user: await this.userRepository.findById(userId),
      expiresAt,
    });

    return { access_token, refresh_token: rawRefreshToken };
  }

  /**
   * Refresh access token using a valid refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
  }> {
    // For opaque refresh tokens we expect the raw token string.
    // Hash it and look up in DB
    const tokenHash = createHash('sha256')
      .update(String(refreshToken))
      .digest('hex');
    const stored = await this.refreshTokenRepository.findByTokenHash(tokenHash);
    if (!stored || stored.revoked) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (Date.now() > Number(stored.expiresAt)) {
      // Token expired
      await this.refreshTokenRepository.revoke(stored.id);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = stored.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new access token
    const newPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const access_token = this.jwtService.sign(newPayload);

    const expiresInEnv = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRY',
    );
    const expires_in = this.parseDurationToSeconds(expiresInEnv) ?? 3600;

    // Rotate refresh token: replace with a new one
    const newRawRefresh = crypto.randomBytes(64).toString('hex');
    const newHash = createHash('sha256').update(newRawRefresh).digest('hex');
    const refreshTokenExpiry = this.parseDurationToSeconds(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRY'),
    );
    const newExpiresInSeconds = refreshTokenExpiry ?? 7 * 24 * 3600;
    const newExpiresAt = Date.now() + newExpiresInSeconds * 1000;

    await this.refreshTokenRepository.revoke(stored.id);
    await this.refreshTokenRepository.createToken({
      tokenHash: newHash,
      user,
      expiresAt: newExpiresAt,
    });

    // Return new access token and the new raw refresh token so controller can set cookie
    return {
      access_token,
      refresh_token: newRawRefresh,
      expires_in,
      refresh_expires_in: newExpiresInSeconds,
    };
  }

  /**
   * Logout user and revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      return; // No token to revoke
    }

    const tokenHash = createHash('sha256')
      .update(String(refreshToken))
      .digest('hex');
    const stored = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (stored) {
      await this.refreshTokenRepository.revoke(stored.id);
    }
  }
}
