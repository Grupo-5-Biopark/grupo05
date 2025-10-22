import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ShiftSeeder } from './modules/shifts/infrastructure/seeders/shift.seeder';

@Injectable()
export class AppBootstrap implements OnModuleInit {
  private readonly logger = new Logger(AppBootstrap.name);

  constructor(private readonly shiftSeeder: ShiftSeeder) {}

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Running application bootstrap...');
      await this.shiftSeeder.seed();
      this.logger.log('Application bootstrap completed successfully');
    } catch (error) {
      this.logger.error('Error during application bootstrap:', error);
    }
  }
}
