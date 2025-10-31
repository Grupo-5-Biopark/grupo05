import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'joao@example.com' })
  email: string;

  @ApiProperty({ example: 'admin' })
  role: string;

  @ApiProperty({ example: '(45) 99999-9999', required: false })
  phone?: string;

  @ApiProperty({ example: '2025-10-24T10:00:00.000Z' })
  createdAt: Date;
}
