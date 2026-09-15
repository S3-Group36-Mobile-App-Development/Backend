import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { AsignarInstitucionDto } from './dto/asignar-institucion.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Usuarios / Perfil')
@ApiBearerAuth()
@Controller({ path: 'usuarios', version: '1' })
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado y su racha.' })
  obtenerPerfil(@CurrentUser('usuarioId') usuarioId: bigint) {
    return this.usuariosService.obtenerPerfil(usuarioId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar el perfil del usuario autenticado.' })
  actualizarPerfil(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Body() dto: UpdatePerfilDto,
  ) {
    return this.usuariosService.actualizarPerfil(usuarioId, dto);
  }

  @Put('me/institucion')
  @ApiOperation({ summary: 'Asignar institución y departamento al usuario.' })
  asignarInstitucion(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Body() dto: AsignarInstitucionDto,
  ) {
    return this.usuariosService.asignarInstitucion(usuarioId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar la cuenta y toda la actividad asociada (en cascada).',
  })
  eliminarCuenta(@CurrentUser('usuarioId') usuarioId: bigint) {
    return this.usuariosService.eliminarCuenta(usuarioId);
  }
}
