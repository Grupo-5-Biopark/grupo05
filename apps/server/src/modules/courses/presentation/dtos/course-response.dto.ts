import { ApiProperty } from '@nestjs/swagger';

export class CourseResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ciência da Computação' })
  name: string;

  @ApiProperty({ example: 'Computação' })
  knowledgeArea: string;

  @ApiProperty({ example: 40 })
  vacancies: number;

  @ApiProperty({ example: 4 })
  periodQuantities: number;

  @ApiProperty({ example: 2025 })
  openingYear: number;
}
