import { Module } from '@nestjs/common';
import { EnvironmentConfigModule } from '@/infrastructure/config/environment-config.module';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { HealthModule } from '@/modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    EnvironmentConfigModule,
    DatabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
