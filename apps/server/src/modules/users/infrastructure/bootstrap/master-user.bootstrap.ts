import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MasterUserBootstrap implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    console.log('Bootstrap: Checking environment...', {
      env: process.env.NODE_ENV,
    });
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Bootstrap: Development environment detected, checking for master user...',
      );
      await this.createMasterUserIfNotExists();
    } else {
      console.log(
        'Bootstrap: Not in development environment, skipping master user creation',
      );
    }
  }

  private async createMasterUserIfNotExists() {
    try {
      console.log('Bootstrap: Counting existing users...');
      const existingUsers = await this.userRepository.count();
      console.log('Bootstrap: Found', existingUsers, 'existing users');

      if (existingUsers === 0) {
        console.log('Bootstrap: No users found, creating master admin user...');
        const hashedPassword = await bcrypt.hash('admin', 10);

        const masterUser = this.userRepository.create({
          name: 'admin',
          email: 'admin@admin.com',
          password: hashedPassword,
          role: 'ADMIN',
        });

        await this.userRepository.save(masterUser);
        console.log('Bootstrap: Master admin user created successfully!');
      } else {
        console.log(
          'Bootstrap: Users already exist, skipping master user creation',
        );
      }
    } catch (error) {
      console.error('Bootstrap: Error while creating master user:', error);
      throw error;
    }
  }
}
