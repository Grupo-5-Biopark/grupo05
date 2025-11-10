import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Ciência da Computação' })
  @IsString({ message: 'must be a string' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Computação' })
  @IsString({ message: 'must be a string' })
  @IsOptional()
  knowledge_area?: string;

  @ApiPropertyOptional({ example: 40 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be at least 1' })
  @IsOptional()
  vacancies?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be at least 1' })
  @IsOptional()
  period_quantities?: number;

  @ApiPropertyOptional({ example: 2025 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1990, { message: 'must be at least 1990' })
  @IsOptional()
  opening_year?: number;
}
