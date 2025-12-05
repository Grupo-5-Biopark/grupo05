import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './domain/entities/shift.entity';
import { ShiftRepository } from './infrastructure/repositories/shift.repository';
import { ShiftSeeder } from './infrastructure/seeders/shift.seeder';
import { ShiftController } from './presentation/controllers/shift.controller';
import { FindAllShiftsUseCase } from './application/use-cases/find-all-shifts.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Shift])],
  controllers: [ShiftController],
  providers: [ShiftRepository, ShiftSeeder, FindAllShiftsUseCase],
  exports: [ShiftRepository, ShiftSeeder],
})
export class ShiftsModule {}
