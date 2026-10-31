import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
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

  @ApiPropertyOptional({
    description: 'Número de veces que se ha usado el ejercicio.',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  usageCount?: number;

  @ApiPropertyOptional({
    description: 'Calificación promedio (0 a 5, hasta 2 decimales).',
    example: 4.5,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  ratingAvg?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de calificaciones recibidas.',
    example: 20,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  ratingCount?: number;
}
