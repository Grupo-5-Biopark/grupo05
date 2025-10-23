import { PartialType } from '@nestjs/swagger';
import { CreateCalculationParametersDto } from './create-calculation-parameters.dto';

export class UpdateCalculationParametersDto extends PartialType(
  CreateCalculationParametersDto,
) {}
