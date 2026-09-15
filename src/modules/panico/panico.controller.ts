import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PanicoService } from './panico.service';
import { CrearContactoDto } from './dto/crear-contacto.dto';
import { ActualizarContactoDto } from './dto/actualizar-contacto.dto';
import { ActivarPanicoDto, ConectarPanicoDto } from './dto/evento-panico.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Botón de Pánico')
@ApiBearerAuth()
@Controller({ version: '1' })
export class PanicoController {
  constructor(private readonly panicoService: PanicoService) {}

  // Contactos personales
  @Get('contactos')
  @ApiOperation({ summary: 'Listar los contactos personales del usuario.' })
  listarContactos(@CurrentUser('usuarioId') usuarioId: bigint) {
    return this.panicoService.listarContactos(usuarioId);
  }

  @Post('contactos')
  @ApiOperation({ summary: 'Crear un contacto personal.' })
  crearContacto(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Body() dto: CrearContactoDto,
  ) {
    return this.panicoService.crearContacto(usuarioId, dto);
  }

  @Patch('contactos/:id')
  @ApiOperation({ summary: 'Actualizar un contacto personal.' })
  actualizarContacto(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarContactoDto,
  ) {
    return this.panicoService.actualizarContacto(usuarioId, BigInt(id), dto);
  }

  @Delete('contactos/:id')
  @ApiOperation({ summary: 'Eliminar un contacto personal.' })
  eliminarContacto(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.panicoService.eliminarContacto(usuarioId, BigInt(id));
  }

  // Eventos de pánico
  @Post('panico/eventos')
  @ApiOperation({ summary: 'Activar el botón de pánico (registra el evento).' })
  activarPanico(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Body() dto: ActivarPanicoDto,
  ) {
    return this.panicoService.activarPanico(usuarioId, dto);
  }

  @Patch('panico/eventos/:id/conectar')
  @ApiOperation({
    summary: 'Marcar un evento de pánico como conectado (calcula tiempo de respuesta).',
  })
  conectarPanico(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConectarPanicoDto,
  ) {
    return this.panicoService.conectarPanico(usuarioId, BigInt(id), dto);
  }

  @Get('panico/eventos')
  @ApiOperation({ summary: 'Historial de eventos de pánico del usuario.' })
  listarEventos(@CurrentUser('usuarioId') usuarioId: bigint) {
    return this.panicoService.listarEventos(usuarioId);
  }
}
