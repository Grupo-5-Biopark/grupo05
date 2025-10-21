import { IsNumber, IsPositive, Min, Max, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClassDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber({}, { message: 'must be a number' })
  @IsPositive({ message: 'must be positive' })
  @IsOptional()
  courseId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber({}, { message: 'must be a number' })
  @IsPositive({ message: 'must be positive' })
  @IsOptional()
  shiftId?: number;

  @ApiPropertyOptional({ example: 2024 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(2000, { message: 'must be at least 2000' })
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be between 1 and 2' })
  @Max(2, { message: 'must be between 1 and 2' })
  @IsOptional()
  semester?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(0, { message: 'must be at least 0' })
  @IsOptional()
  currentStudents?: number;
}
