import { ApiProperty } from '@nestjs/swagger';

export class ClassResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  courseId: number;

  @ApiProperty({ example: 1 })
  shiftId: number;

  @ApiProperty({ example: 2024 })
  year: number;

  @ApiProperty({ example: 1 })
  semester: number;

  @ApiProperty({ example: 30 })
  expectedStudents: number;

  @ApiProperty({ example: 25 })
  currentStudents: number;

  @ApiProperty({ example: 10.5 })
  dropoutRate: number;
}
