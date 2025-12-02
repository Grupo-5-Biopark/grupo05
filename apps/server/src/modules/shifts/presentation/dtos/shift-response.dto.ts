import { ApiProperty } from '@nestjs/swagger';

export class ShiftResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Matutino' })
  name: string;
}
