import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
  async findAll(@Query('year', ParseIntPipe) year: number) {
    return await this.calculateRoomRequirementsUseCase.execute(year);
  }
}
