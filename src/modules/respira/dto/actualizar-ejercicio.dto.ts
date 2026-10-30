import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

/**
 * Campos editables de un ejercicio de respiración. Todos opcionales:
 * solo se actualiza lo que venga en el body (edición parcial).
 */
export class ActualizarEjercicioDto {
  @ApiPropertyOptional({ example: 'Respiración de caja' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  titulo?: string;

  @ApiPropertyOptional({ example: 'Inhala, sostén, exhala y sostén.' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Duración en segundos.', example: 120 })
  @IsOptional()
  @IsInt()
  @Min(1)
  duracion?: number;

  @ApiPropertyOptional({
    description: 'Patrón de respiración (JSON libre).',
    example: { inhalar: 4, sostener: 4, exhalar: 4, ciclos: 6 },
  })
  @IsOptional()
  @IsObject()
  patron?: Record<string, unknown>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  vibra?: boolean;
}
