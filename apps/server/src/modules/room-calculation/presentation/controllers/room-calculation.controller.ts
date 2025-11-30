import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CalculateRoomRequirementsUseCase } from '../../application/use-cases/calculate-room-requirements.usecase';

@Controller('room-calculation')
@UseGuards(JwtAuthGuard)
@ApiTags('RoomCalculation')
@ApiBearerAuth()
export class RoomCalculationController {
  constructor(
    private readonly calculateRoomRequirementsUseCase: CalculateRoomRequirementsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get room calculation per course' })
  @ApiQuery({
    name: 'year',
    required: false,
    type: 'number',
    description: 'Requested year (e.g., 2025)',
  })
  @ApiQuery({
    name: 'semester',
    required: true,
    type: 'number',
    description: 'Requested semester in the year (1 or 2) — required',
  })
  async findAll(
    @Query('year', ParseIntPipe) year: number,
    @Query('semester', ParseIntPipe) semester: number,
  ) {
    if (semester !== 1 && semester !== 2) {
      throw new BadRequestException(
        'Query parameter `semester` must be 1 or 2',
      );
    }

    return await this.calculateRoomRequirementsUseCase.execute(year, semester);
  }
}
