import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JuegosService } from './juegos.service';
import { RegistrarSesionJuegoDto } from './dto/sesion-juego.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Juegos')
@Controller({ path: 'juegos', version: '1' })
export class JuegosController {
  constructor(private readonly juegosService: JuegosService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Catálogo de juegos.' })
  listar() {
    return this.juegosService.listar();
  }

  @ApiBearerAuth()
  @Post('sesiones')
  @ApiOperation({
    summary: 'Registrar una partida ya completada (duración, errores, aciertos).',
  })
  registrarSesion(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Body() dto: RegistrarSesionJuegoDto,
  ) {
    return this.juegosService.registrarSesion(usuarioId, dto);
  }

  @ApiBearerAuth()
  @Get('sesiones')
  @ApiOperation({ summary: 'Historial de partidas del usuario.' })
  listarSesiones(@CurrentUser('usuarioId') usuarioId: bigint) {
    return this.juegosService.listarSesiones(usuarioId);
  }
}
