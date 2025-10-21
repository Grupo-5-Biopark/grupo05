import { IsNumber, IsPositive, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'must be a number' })
  @IsPositive({ message: 'must be positive' })
  courseId: number;

  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'must be a number' })
  @IsPositive({ message: 'must be positive' })
  shiftId: number;

  @ApiProperty({ example: 2024 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(2000, { message: 'must be at least 2000' })
  year: number;

  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be between 1 and 2' })
  @Max(2, { message: 'must be between 1 and 2' })
  semester: number;

  @ApiProperty({ example: 25 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(0, { message: 'must be at least 0' })
  currentStudents: number;
}
