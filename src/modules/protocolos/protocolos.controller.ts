import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProtocolosService } from './protocolos.service';
import { CrearProtocoloDto } from './dto/crear-protocolo.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Protocolos')
@ApiBearerAuth()
@Controller({ path: 'protocolos', version: '1' })
export class ProtocolosController {
  constructor(private readonly protocolosService: ProtocolosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar protocolos predefinidos y propios.' })
  listar(@CurrentUser('usuarioId') usuarioId: bigint) {
    return this.protocolosService.listarProtocolos(usuarioId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un protocolo con sus pasos.' })
  obtener(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.protocolosService.obtenerProtocolo(usuarioId, BigInt(id));
  }

  @Post()
  @ApiOperation({ summary: 'Crear un protocolo propio.' })
  crear(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Body() dto: CrearProtocoloDto,
  ) {
    return this.protocolosService.crearProtocolo(usuarioId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un protocolo propio.' })
  eliminar(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.protocolosService.eliminarProtocolo(usuarioId, BigInt(id));
  }

  @Post(':id/vistas')
  @ApiOperation({ summary: 'Registrar que el usuario vio un protocolo.' })
  registrarVista(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.protocolosService.registrarVista(usuarioId, BigInt(id));
  }
}
