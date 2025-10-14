import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../../users/infrastructure/repositories/user.repository';
import { UserPasswordService } from '../../../users/domain/services/user-password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly userPasswordService: UserPasswordService,
    private readonly configService: ConfigService,
  ) {}

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
  ): Promise<{ access_token: string; expires_in?: number }> {
    const user = await this.validateUser(email, password);
    const payload = { email: user.email, sub: user.id };

    const token = this.jwtService.sign(payload);

    // Determine expires_in in seconds for client convenience.
    const expiresInEnv = this.configService.get<string>('JWT_EXPIRES_IN');
    const ttlSecondsEnv = this.configService.get<number>('JWT_TTL_SECONDS');

    const parseDurationToSeconds = (
      v: string | number | undefined,
    ): number | undefined => {
      if (!v && v !== 0) return undefined;
      if (typeof v === 'number') return v;
      const str = String(v).trim();
      // if it's pure number (seconds)
      if (/^\d+$/.test(str)) return Number(str);
      // support formats like '30s', '15m', '1h', '7d'
      const m = str.match(/^(\d+)(s|m|h|d)$/i);
      if (m) {
        const n = Number(m[1]);
        const unit = m[2].toLowerCase();
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
    };

    const expires_in =
      parseDurationToSeconds(expiresInEnv) ??
      (typeof ttlSecondsEnv === 'number' ? ttlSecondsEnv : undefined);

    const response: { access_token: string; expires_in?: number } = {
      access_token: token,
    };

    if (typeof expires_in === 'number') {
      response.expires_in = expires_in;
    }

    return response;
  }
}
