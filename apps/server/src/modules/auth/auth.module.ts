import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from './application/services/auth.service';
import { TokenCleanupService } from './application/services/token-cleanup.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './presentation/controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from './infrastructure/repositories/refresh-token.repository';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRY') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenRepository,
    TokenCleanupService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
