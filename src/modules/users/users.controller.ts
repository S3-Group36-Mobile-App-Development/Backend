import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obtener el usuario autenticado a partir del JWT.',
  })
  @ApiOkResponse({ description: 'Información pública del usuario.' })
  @ApiUnauthorizedResponse({ description: 'Falta o es inválido el JWT.' })
  obtenerActual(@CurrentUser('usuarioId') usuarioId: bigint) {
    return this.usersService.obtenerActual(usuarioId);
  }
}
