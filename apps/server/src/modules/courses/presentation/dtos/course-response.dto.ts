import { ApiProperty } from '@nestjs/swagger';

export class CourseResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ciência da Computação' })
  name: string;

  @ApiProperty({ example: 'Tecnologia' })
  knowledgeArea: string;

  @ApiProperty({ example: 2024 })
  announcement: number;

  @ApiProperty({ example: 'active' })
  status: string;
}
