import { ApiProperty } from '@nestjs/swagger';

export class CalculationParametersResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  dropoutPercentage: number;

  @ApiProperty()
  studentsPerSmallRoom: number;

  @ApiProperty()
  studentsPerMediumRoom: number;

  @ApiProperty()
  studentsPerBigRoom: number;
}
