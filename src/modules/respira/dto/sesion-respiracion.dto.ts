import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class IniciarSesionDto {
  @ApiProperty({ description: 'ID del ejercicio de respiración.', example: 1 })
  @IsInt()
  ejercicioId!: number;

  @ApiPropertyOptional({
    description:
      'Emoción inicial del usuario en una escala propia de la pantalla (0 = no eligió, 1..5 de más triste a más feliz). No es FK a estados_animo.',
    example: 2,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  initialEmotion?: number;
}

export class CompletarSesionDto {
  @ApiPropertyOptional({
    description:
      'Emoción final del usuario en una escala propia de la pantalla (0 = no eligió, 1..5 de más triste a más feliz). No es FK a estados_animo.',
    example: 4,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  finalEmotion?: number;

  @ApiPropertyOptional({
    description: 'Número de pausas por movimiento detectadas con el sensor.',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  numberMovementPauses?: number;
}
