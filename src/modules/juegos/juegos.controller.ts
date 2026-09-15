import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JuegosService } from './juegos.service';
import { IniciarJuegoDto } from './dto/sesion-juego.dto';
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
  @ApiOperation({ summary: 'Iniciar una sesión de juego.' })
  iniciarSesion(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Body() dto: IniciarJuegoDto,
  ) {
    return this.juegosService.iniciarSesion(usuarioId, dto);
  }

  @ApiBearerAuth()
  @Patch('sesiones/:id/finalizar')
  @ApiOperation({ summary: 'Marcar una sesión de juego como finalizada.' })
  finalizarSesion(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.juegosService.finalizarSesion(usuarioId, BigInt(id));
  }

  @ApiBearerAuth()
  @Get('sesiones')
  @ApiOperation({ summary: 'Historial de sesiones de juego del usuario.' })
  listarSesiones(@CurrentUser('usuarioId') usuarioId: bigint) {
    return this.juegosService.listarSesiones(usuarioId);
  }
}
