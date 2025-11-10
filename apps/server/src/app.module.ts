import { Module } from '@nestjs/common';
import { EnvironmentConfigModule } from '@/infrastructure/config/environment-config.module';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { HealthModule } from '@/modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CalculationParametersModule } from './modules/calculation-parameters/calculation-parameters.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { AppBootstrap } from './app.bootstrap';

@Module({
  imports: [
    EnvironmentConfigModule,
    DatabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    CalculationParametersModule,
    ClassesModule,
    ShiftsModule,
    RoomsModule,
  ],
  controllers: [],
  providers: [AppBootstrap],
})
export class AppModule {}
