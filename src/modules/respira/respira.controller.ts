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
import { RespiraService } from './respira.service';
import { IniciarSesionDto } from './dto/sesion-respiracion.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Respira')
@Controller({ path: 'respira', version: '1' })
export class RespiraController {
  constructor(private readonly respiraService: RespiraService) {}

  @Public()
  @Get('ejercicios')
  @ApiOperation({ summary: 'Catálogo de ejercicios de respiración.' })
  listarEjercicios() {
    return this.respiraService.listarEjercicios();
  }

  @Public()
  @Get('ejercicios/:id')
  @ApiOperation({ summary: 'Detalle de un ejercicio de respiración.' })
  obtenerEjercicio(@Param('id', ParseIntPipe) id: number) {
    return this.respiraService.obtenerEjercicio(BigInt(id));
  }

  @ApiBearerAuth()
  @Post('sesiones')
  @ApiOperation({ summary: 'Iniciar una sesión de respiración.' })
  iniciarSesion(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Body() dto: IniciarSesionDto,
  ) {
    return this.respiraService.iniciarSesion(usuarioId, dto);
  }

  @ApiBearerAuth()
  @Patch('sesiones/:id/completar')
  @ApiOperation({ summary: 'Marcar una sesión de respiración como completada.' })
  completarSesion(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.respiraService.completarSesion(usuarioId, BigInt(id));
  }

  @ApiBearerAuth()
  @Get('sesiones')
  @ApiOperation({ summary: 'Historial de sesiones de respiración del usuario.' })
  listarSesiones(@CurrentUser('usuarioId') usuarioId: bigint) {
    return this.respiraService.listarSesiones(usuarioId);
  }
}
