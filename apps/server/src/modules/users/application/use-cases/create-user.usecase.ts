import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { User } from '../../domain/entities/user.entity';
import { IHashingService } from '../../domain/services/hashing.service';
import { HASHING_SERVICE } from '../../domain/constants/tokens';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

  async execute(data: CreateUserDto): Promise<User> {
    const user = new User(this.hashingService);
    user.name = data.name;
    user.email = data.email;
    user.role = data.role;
    await user.setPassword(data.password);

    return this.userRepository.create(user);
  }
}

// TODO Email repetido dando 500
// TODO campo invalido dando 500
// TODO camopos podendo ir vazios
// TODO Token JWT
// TODO API de login
// TODO role deve ser hardcoded temporariamente
