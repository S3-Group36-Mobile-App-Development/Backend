import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Healthcheck público (usado por Render).' })
  check() {
    return {
      status: 'ok',
      service: 'zenmind-api',
      timestamp: new Date().toISOString(),
    };
  }
}
