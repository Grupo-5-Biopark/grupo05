import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Ciência da Computação' })
  @IsString({ message: 'must be a string' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Tecnologia' })
  @IsString({ message: 'must be a string' })
  @IsOptional()
  knowledgeArea?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be at least 1' })
  @IsOptional()
  announcement?: number;

  @ApiPropertyOptional({ example: 'active' })
  @IsString({ message: 'must be a string' })
  @IsOptional()
  status?: string;
}
