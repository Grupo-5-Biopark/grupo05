import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CourseInfo {
  @ApiProperty({ example: 'Engenharia de Software' })
  name: string;
}

class ShiftInfo {
  @ApiProperty({ example: 'Matutino' })
  name: string;
}

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

  @ApiProperty({ example: 25 })
  currentStudents: number;

  @ApiPropertyOptional({ example: false })
  isAssumed?: boolean;

  @ApiPropertyOptional({ type: CourseInfo })
  course?: CourseInfo;

  @ApiPropertyOptional({ type: ShiftInfo })
  shift?: ShiftInfo;
}
