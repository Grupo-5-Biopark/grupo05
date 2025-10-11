import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'cannot be empty' })
  @MinLength(3, { message: 'must be at least 3 characters long' })
  name: string;

  @ApiProperty({ example: 'joao@example.com' })
  @IsEmail({}, { message: 'must be a valid email' })
  @IsNotEmpty({ message: 'cannot be empty' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'cannot be empty' })
  @MinLength(6, { message: 'must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'admin' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'cannot be empty' })
  role: string;
}
