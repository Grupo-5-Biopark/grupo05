import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';

interface CourseDto {
  knowledge_area?: string;
  knowledgeArea?: string;
  period_quantities?: number;
  periodQuantities?: number;
  opening_year?: number;
  openingYear?: number;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Ciência da Computação' })
  @IsString({ message: 'must be a string' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Computação' })
  @Transform(({ obj }: TransformFnParams) => {
    const data = obj as CourseDto;
    return data.knowledge_area ?? data.knowledgeArea;
  })
  @IsString({ message: 'must be a string' })
  @IsOptional()
  knowledgeArea?: string;

  @ApiPropertyOptional({ example: 40 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be at least 1' })
  @IsOptional()
  vacancies?: number;

  @ApiPropertyOptional({ example: 4 })
  @Transform(({ obj }: TransformFnParams) => {
    const data = obj as CourseDto;
    return data.period_quantities ?? data.periodQuantities;
  })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be at least 1' })
  @IsOptional()
  periodQuantities?: number;

  @ApiPropertyOptional({ example: 2025 })
  @Transform(({ obj }: TransformFnParams) => {
    const data = obj as CourseDto;
    return data.opening_year ?? data.openingYear;
  })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1990, { message: 'must be at least 1990' })
  @IsOptional()
  openingYear?: number;
}
