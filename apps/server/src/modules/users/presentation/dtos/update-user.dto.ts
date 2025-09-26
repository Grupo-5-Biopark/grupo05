import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'must be a string' })
  @MinLength(3, { message: 'must be at least 3 characters long' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'must be a valid email' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'must be a string' })
  @MinLength(6, { message: 'must be at least 6 characters long' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'must be a string' })
  role?: string;
}
