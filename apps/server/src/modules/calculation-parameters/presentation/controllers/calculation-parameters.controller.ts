import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateCalculationParametersUseCase } from '../../application/use-cases/create-calculation-parameters.usecase';
import { FindAllCalculationParametersUseCase } from '../../application/use-cases/find-all-calculation-parameters.usecase';
import { FindCalculationParametersByIdUseCase } from '../../application/use-cases/find-calculation-parameters-by-id.usecase';
import { UpdateCalculationParametersUseCase } from '../../application/use-cases/update-calculation-parameters.usecase';
import { DeleteCalculationParametersUseCase } from '../../application/use-cases/delete-calculation-parameters.usecase';
import { FindCurrentCalculationParametersUseCase } from '../../application/use-cases/find-current-calculation-parameters.usecase';
import { CreateCalculationParametersDto } from '../dtos/create-calculation-parameters.dto';
import { UpdateCalculationParametersDto } from '../dtos/update-calculation-parameters.dto';
import { CalculationParametersResponseDto } from '../dtos/calculation-parameters-response.dto';

@Controller('calculationParameters')
@UseGuards(JwtAuthGuard)
@ApiTags('CalculationParameters')
@ApiBearerAuth()
export class CalculationParametersController {
  constructor(
    private readonly createUseCase: CreateCalculationParametersUseCase,
    private readonly findAllUseCase: FindAllCalculationParametersUseCase,
    private readonly findByIdUseCase: FindCalculationParametersByIdUseCase,
    private readonly findCurrentUseCase: FindCurrentCalculationParametersUseCase,
    private readonly updateUseCase: UpdateCalculationParametersUseCase,
    private readonly deleteUseCase: DeleteCalculationParametersUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create calculation parameters' })
  async create(
    @Body() dto: CreateCalculationParametersDto,
  ): Promise<CalculationParametersResponseDto> {
    const params = await this.createUseCase.execute(dto);
    return {
      id: params.id,
      dropoutPercentage: Number(params.dropoutPercentage),
      studentsPerSmallRoom: params.studentsPerSmallRoom,
      studentsPerMediumRoom: params.studentsPerMediumRoom,
      studentsPerBigRoom: params.studentsPerBigRoom,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all calculation parameters' })
  async findAll(): Promise<CalculationParametersResponseDto[]> {
    const list = await this.findAllUseCase.execute();
    return list.map((p) => ({
      id: p.id,
      dropoutPercentage: Number(p.dropoutPercentage),
      studentsPerSmallRoom: p.studentsPerSmallRoom,
      studentsPerMediumRoom: p.studentsPerMediumRoom,
      studentsPerBigRoom: p.studentsPerBigRoom,
    }));
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current calculation parameters' })
  async findCurrent(): Promise<CalculationParametersResponseDto> {
    const p = await this.findCurrentUseCase.execute();
    return {
      id: p.id,
      dropoutPercentage: Number(p.dropoutPercentage),
      studentsPerSmallRoom: p.studentsPerSmallRoom,
      studentsPerMediumRoom: p.studentsPerMediumRoom,
      studentsPerBigRoom: p.studentsPerBigRoom,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get calculation parameters by id' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CalculationParametersResponseDto> {
    const p = await this.findByIdUseCase.execute(id);
    return {
      id: p.id,
      dropoutPercentage: Number(p.dropoutPercentage),
      studentsPerSmallRoom: p.studentsPerSmallRoom,
      studentsPerMediumRoom: p.studentsPerMediumRoom,
      studentsPerBigRoom: p.studentsPerBigRoom,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update calculation parameters' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCalculationParametersDto,
  ): Promise<void> {
    await this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete calculation parameters' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
}
