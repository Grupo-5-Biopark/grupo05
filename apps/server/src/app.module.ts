import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EnvironmentConfigModule } from '@/infrastructure/config/environment-config.module';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { HealthModule } from '@/modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CalculationParametersModule } from './modules/calculation-parameters/calculation-parameters.module';
import { ClassesModule } from './modules/classes/classes.module';
import { RoomCalculationModule } from './modules/room-calculation/room-calculation.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { AppBootstrap } from './app.bootstrap';

@Module({
  imports: [
    EnvironmentConfigModule,
    DatabaseModule,
    ScheduleModule.forRoot(),
    HealthModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    ClassesModule,
    RoomCalculationModule,
    ShiftsModule,
    CalculationParametersModule,
    RoomsModule,
  ],
  controllers: [],
  providers: [AppBootstrap],
})
export class AppModule {}
