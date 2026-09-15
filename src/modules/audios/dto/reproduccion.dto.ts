import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * Registra una reproducción. Si audioId viene, es un audio del catálogo del
 * equipo. Si no, es un audio local del usuario y se indica tituloLocal.
 */
export class RegistrarReproduccionDto {
  @ApiPropertyOptional({
    description: 'ID de un audio del catálogo. Omitir si es un audio local.',
  })
  @IsOptional()
  @IsInt()
  audioId?: number;

  @ApiPropertyOptional({
    description: 'Nombre del audio local (solo si no hay audioId).',
  })
  @IsOptional()
  @IsString()
  tituloLocal?: string;

  @ApiPropertyOptional({ description: 'Segundos escuchados.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  duracionEscuchadaSegundos?: number;
}
