import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { FindAllShiftsUseCase } from '../../application/use-cases/find-all-shifts.usecase';
import { ShiftResponseDto } from '../dtos/shift-response.dto';

@ApiTags('Shifts')
@Controller('shifts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShiftController {
  constructor(private readonly findAllShiftsUseCase: FindAllShiftsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List all shifts' })
  @ApiResponse({
    status: 200,
    description: 'List of shifts returned successfully',
    type: [ShiftResponseDto],
  })
  async findAll(): Promise<ShiftResponseDto[]> {
    const shifts = await this.findAllShiftsUseCase.execute();
    return shifts.map((shift) => ({
      id: shift.id,
      name: shift.name,
    }));
  }
}
