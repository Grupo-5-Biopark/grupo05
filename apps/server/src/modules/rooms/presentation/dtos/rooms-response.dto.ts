import { ApiProperty } from '@nestjs/swagger';

export class RoomsResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Bloco A' })
  block: string;

  @ApiProperty({ example: 1 })
  number: number;

  @ApiProperty({ example: 'G' })
  size: string;

  @ApiProperty({ example: 1, required: false })
  classId?: number;
}
