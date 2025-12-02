import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomsDto {
  @ApiPropertyOptional({ example: 'Bloco A' })
  @IsString({ message: 'must be a text' })
  block: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber({}, { message: 'must be a number' })
  @IsOptional()
  number: number;

  @ApiPropertyOptional({ example: 'G' })
  @IsString({ message: 'must be a text' })
  size: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber({}, { message: 'must be a number' })
  @IsOptional()
  courseId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber({}, { message: 'must be a number' })
  @IsOptional()
  classId?: number;
}
