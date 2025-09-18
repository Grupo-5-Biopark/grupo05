import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { UserController } from './presentation/controllers/user.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { FindAllUsersUseCase } from './application/use-cases/find-all-users.usecase';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.usecase';
import { UpdateUserUseCase } from './application/use-cases/update-user.usecase';
import { DeleteUserUseCase } from './application/use-cases/delete-user.usecase';
import { BcryptHashingService } from './infrastructure/services/bcrypt-hashing.service';
import { HASHING_SERVICE } from './domain/constants/tokens';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserRepository,
    CreateUserUseCase,
    FindAllUsersUseCase,
    FindUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    {
      provide: HASHING_SERVICE,
      useClass: BcryptHashingService,
    },
  ],
})
export class UsersModule {}
