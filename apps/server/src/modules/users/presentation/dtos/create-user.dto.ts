import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'cannot be empty' })
  @MinLength(3, { message: 'must be at least 3 characters long' })
  name: string;

  @IsEmail({}, { message: 'must be a valid email' })
  @IsNotEmpty({ message: 'cannot be empty' })
  email: string;

  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'cannot be empty' })
  @MinLength(6, { message: 'must be at least 6 characters long' })
  password: string;

  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'cannot be empty' })
  role: string;
}
