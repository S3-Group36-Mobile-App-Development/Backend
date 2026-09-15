import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ActividadService } from './actividad.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Actividad')
@ApiBearerAuth()
@Controller({ path: 'actividad', version: '1' })
export class ActividadController {
  constructor(private readonly actividadService: ActividadService) {}

  @Get()
  @ApiOperation({
    summary: 'Actividad unificada del usuario (tab Actividad), más reciente primero.',
  })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  listar(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.actividadService.listar(usuarioId, limit, offset);
  }
}
