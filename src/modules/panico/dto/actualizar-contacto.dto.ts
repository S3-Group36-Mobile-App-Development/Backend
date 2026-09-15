import { PartialType } from '@nestjs/swagger';
import { CrearContactoDto } from './crear-contacto.dto';

export class ActualizarContactoDto extends PartialType(CrearContactoDto) {}
