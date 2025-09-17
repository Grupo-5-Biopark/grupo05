import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: CreateUserDto): Promise<User> {
    return this.userRepository.create(data);
  }
}
// TODO Senha encriptada
// TODO Email repetido dando 500
// TODO campo invalido dando 500
// TODO camopos podendo ir vazios
// TODO Token JWT
// TODO API de login
// TODO role deve ser hardcoded temporariamente
