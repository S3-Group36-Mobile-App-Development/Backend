import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InstitucionesService } from './instituciones.service';
import {
  CrearDepartamentoDto,
  CrearInstitucionDto,
} from './dto/crear-institucion.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Instituciones / Analítica')
@Controller({ path: 'instituciones', version: '1' })
export class InstitucionesController {
  constructor(private readonly institucionesService: InstitucionesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar instituciones y sus departamentos.' })
  listar() {
    return this.institucionesService.listar();
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Crear una institución.' })
  crear(@Body() dto: CrearInstitucionDto) {
    return this.institucionesService.crear(dto);
  }

  @ApiBearerAuth()
  @Post(':id/departamentos')
  @ApiOperation({ summary: 'Crear un departamento en una institución.' })
  crearDepartamento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearDepartamentoDto,
  ) {
    return this.institucionesService.crearDepartamento(BigInt(id), dto);
  }

  @ApiBearerAuth()
  @Get('analitica/resumen-departamento')
  @ApiOperation({
    summary:
      'Resumen de actividad por departamento (agregado, con piso de k-anonimidad de 5 usuarios).',
  })
  resumenDepartamento() {
    return this.institucionesService.resumenActividadDepartamento();
  }

  @ApiBearerAuth()
  @Post('analitica/refrescar')
  @ApiOperation({ summary: 'Refrescar la vista materializada de analítica.' })
  refrescar() {
    return this.institucionesService.refrescarResumen();
  }
}
