// /src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/infrastructure/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Check the health status of the application' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current status and timestamp.',
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
