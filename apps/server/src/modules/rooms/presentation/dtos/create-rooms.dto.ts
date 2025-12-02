import { IsInt, Min, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomsDto {
  @ApiProperty({ example: 'Bloco A' })
  @IsString({ message: 'must be a text' })
  block: string;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'must be an integer' })
  @Min(1, { message: 'must be greater than or equal to 1' })
  number: number;

  @ApiProperty({ example: 'G' })
  @IsString({ message: 'must be a text' })
  size: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber({}, { message: 'must be a number' })
  @IsOptional()
  courseId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber({}, { message: 'must be a number' })
  @IsOptional()
  classId?: number;
}
