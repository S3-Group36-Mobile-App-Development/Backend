import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TelemetriaService } from './telemetria.service';
import { RegistrarEventoDto } from './dto/registrar-evento.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Telemetría')
@Controller({ path: 'telemetria', version: '1' })
export class TelemetriaController {
  constructor(private readonly telemetriaService: TelemetriaService) {}

  @Public()
  @Post('eventos')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary:
      'Registrar un evento de telemetría (vista de pantalla, crash o uso de funcionalidad).',
  })
  registrarEvento(@Body() dto: RegistrarEventoDto) {
    return this.telemetriaService.registrarEvento(dto);
  }
}
