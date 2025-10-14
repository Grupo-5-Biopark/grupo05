import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'João Silva' })
  @IsOptional()
  @IsString({ message: 'must be a string' })
  @MinLength(3, { message: 'must be at least 3 characters long' })
  name?: string;

  @ApiPropertyOptional({ example: 'joao@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'must be a valid email' })
  email?: string;

  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsOptional()
  @IsString({ message: 'must be a string' })
  @MinLength(6, { message: 'must be at least 6 characters long' })
  password?: string;

  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  @IsString({ message: 'must be a string' })
  role?: string;
}
