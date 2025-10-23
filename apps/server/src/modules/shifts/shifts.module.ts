import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './domain/entities/shift.entity';
import { ShiftRepository } from './infrastructure/repositories/shift.repository';
import { ShiftSeeder } from './infrastructure/seeders/shift.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Shift])],
  providers: [ShiftRepository, ShiftSeeder],
  exports: [ShiftRepository, ShiftSeeder],
})
export class ShiftsModule {}
