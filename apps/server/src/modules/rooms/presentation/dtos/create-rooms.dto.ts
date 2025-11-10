import { IsNumber, Min, Max, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomsDto {
  @ApiProperty({ example: 'Bloco A' })
  @IsString({ message: 'must be a text' })
  block: string;

  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be between 1 and 2' })
  @Max(2, { message: 'must be between 1 and 2' })
  number: number;

  @ApiProperty({ example: 'G' })
  @IsString({ message: 'must be a text' })
  size: string;
}
