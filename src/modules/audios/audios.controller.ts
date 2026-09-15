import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AudiosService } from './audios.service';
import { RegistrarReproduccionDto } from './dto/reproduccion.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Audios')
@Controller({ path: 'audios', version: '1' })
export class AudiosController {
  constructor(private readonly audiosService: AudiosService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Catálogo de audios predefinidos.' })
  listar() {
    return this.audiosService.listar();
  }

  @ApiBearerAuth()
  @Post('reproducciones')
  @ApiOperation({ summary: 'Registrar una reproducción de audio.' })
  registrarReproduccion(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Body() dto: RegistrarReproduccionDto,
  ) {
    return this.audiosService.registrarReproduccion(usuarioId, dto);
  }

  @ApiBearerAuth()
  @Get('reproducciones')
  @ApiOperation({ summary: 'Historial de reproducciones del usuario.' })
  listarReproducciones(@CurrentUser('usuarioId') usuarioId: bigint) {
    return this.audiosService.listarReproducciones(usuarioId);
  }
}
