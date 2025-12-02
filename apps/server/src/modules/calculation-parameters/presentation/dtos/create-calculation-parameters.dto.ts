import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  Min,
  IsInt,
  Max,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

function IsTwoDecimalPlaces(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTwoDecimalPlaces',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === null || value === undefined) return true;
          if (typeof value !== 'number') return false;
          return Math.round(value * 100) / 100 === value;
        },
      },
    });
  };
}

export class CreateCalculationParametersDto {
  @ApiProperty({ example: 0 })
  @IsNumber({}, { message: 'must be a number' })
  @Min(0, { message: 'must be at least 0' })
  @Max(100, { message: 'must be at most 100' })
  @IsTwoDecimalPlaces({ message: 'must have at most two decimal places' })
  dropoutPercentage: number = 0;

  @ApiProperty({ example: 10 })
  @IsInt({ message: 'must be an integer' })
  @Min(1, { message: 'must be at least 1' })
  studentsPerSmallRoom: number = 10;

  @ApiProperty({ example: 20 })
  @IsInt({ message: 'must be an integer' })
  @Min(1, { message: 'must be at least 1' })
  studentsPerMediumRoom: number = 20;

  @ApiProperty({ example: 30 })
  @IsInt({ message: 'must be an integer' })
  @Min(1, { message: 'must be at least 1' })
  studentsPerBigRoom: number = 30;
}
