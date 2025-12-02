import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token used to obtain a new access token',
  })
  @IsString({ message: 'refresh_token must be a string' })
  @IsNotEmpty({ message: 'refresh_token cannot be empty' })
  refresh_token: string;
}
