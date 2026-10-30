import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PasoDto } from './crear-protocolo.dto';

/**
 * Reemplaza el título y la lista de pasos de un protocolo propio.
 * Los pasos se sustituyen por completo (no es edición paso a paso).
 */
export class ActualizarProtocoloDto {
  @ApiProperty({ example: 'Mi rutina para la ansiedad (actualizada)' })
  @IsString()
  @MinLength(1)
  titulo!: string;

  @ApiProperty({ type: [PasoDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PasoDto)
  pasos!: PasoDto[];
}
