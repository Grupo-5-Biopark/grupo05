import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Ciência da Computação' })
  @IsString({ message: 'must be a string' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Computação' })
  @Transform(
    ({ obj }: TransformFnParams) =>
      (obj?.knowledge_area ?? obj?.knowledgeArea) as string | undefined,
  )
  @IsString({ message: 'must be a string' })
  @IsOptional()
  knowledgeArea?: string;

  @ApiPropertyOptional({ example: 40 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be at least 1' })
  @IsOptional()
  vacancies?: number;

  @ApiPropertyOptional({ example: 4 })
  @Transform(
    ({ obj }: TransformFnParams) =>
      (obj?.period_quantities ?? obj?.periodQuantities) as number | undefined,
  )
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be at least 1' })
  @IsOptional()
  periodQuantities?: number;

  @ApiPropertyOptional({ example: 2025 })
  @Transform(
    ({ obj }: TransformFnParams) =>
      (obj?.opening_year ?? obj?.openingYear) as number | undefined,
  )
  @IsNumber({}, { message: 'must be a number' })
  @Min(1990, { message: 'must be at least 1990' })
  @IsOptional()
  openingYear?: number;
}
