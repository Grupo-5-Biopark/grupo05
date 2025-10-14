import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@admin.com' })
  @IsEmail({}, { message: 'must be a valid email' })
  @IsNotEmpty({ message: 'cannot be empty' })
  email: string;

  @ApiProperty({ example: 'admin' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'cannot be empty' })
  password: string;
}
