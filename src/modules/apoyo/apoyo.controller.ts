import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApoyoService } from './apoyo.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Apoyo')
@Controller({ path: 'apoyo', version: '1' })
export class ApoyoController {
  constructor(private readonly apoyoService: ApoyoService) {}

  @Public()
  @Get('lineas-emergencia')
  @ApiOperation({ summary: 'Catálogo de líneas de emergencia.' })
  @ApiQuery({ name: 'pais', required: false })
  listarLineasEmergencia(@Query('pais') pais?: string) {
    return this.apoyoService.listarLineasEmergencia(pais);
  }
}
