import { Module } from '@nestjs/common';
import { EnvironmentConfigModule } from './infrastructure/config/environment-config.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [EnvironmentConfigModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
