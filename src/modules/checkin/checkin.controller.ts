import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckinService } from './checkin.service';
import { CrearChequeoDto } from './dto/crear-chequeo.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Check-in diario')
@Controller({ version: '1' })
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Public()
  @Get('estados-animo')
  @ApiOperation({ summary: 'Catálogo de estados de ánimo.' })
  listarEstadosAnimo() {
    return this.checkinService.listarEstadosAnimo();
  }

  @ApiBearerAuth()
  @Post('chequeos')
  @ApiOperation({ summary: 'Registrar el check-in diario (uno por día).' })
  crearChequeo(
    @CurrentUser('usuarioId') usuarioId: bigint,
    @Body() dto: CrearChequeoDto,
  ) {
    return this.checkinService.crearChequeo(usuarioId, dto);
  }

  @ApiBearerAuth()
  @Get('chequeos')
  @ApiOperation({ summary: 'Historial de check-ins del usuario.' })
  listarHistorial(@CurrentUser('usuarioId') usuarioId: bigint) {
    return this.checkinService.listarHistorial(usuarioId);
  }
}
