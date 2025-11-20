import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Ciência da Computação' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'cannot be empty' })
  name: string;

  @ApiProperty({ example: 'Tecnologia' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'cannot be empty' })
  knowledgeArea: string;

  @ApiProperty({ example: 40 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be at least 1' })
  vacancies: number;

  @ApiProperty({ example: 4 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be at least 1' })
  periodQuantities: number;

  @ApiProperty({ example: 2025 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1990, { message: 'must be at least 1990' })
  openingYear: number;
}
