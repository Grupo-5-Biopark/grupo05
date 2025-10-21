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

  @ApiProperty({ example: 2024 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be at least 1' })
  announcement: number;

  @ApiProperty({ example: 'active' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'cannot be empty' })
  status: string;

  @ApiProperty({ example: 30 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(1, { message: 'must be at least 1' })
  expectedStudents: number;
}
