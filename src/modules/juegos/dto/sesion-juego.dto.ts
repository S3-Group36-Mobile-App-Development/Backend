import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsUUID, Min } from 'class-validator';

export class RegistrarSesionJuegoDto {
  @ApiProperty({
    description: 'UUID de la partida, generado por el cliente móvil.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'Duración de la partida en milisegundos.', example: 45000 })
  @IsInt()
  @Min(0)
  durationMs!: number;

  @ApiProperty({ description: 'Número de errores cometidos en la partida.', example: 3 })
  @IsInt()
  @Min(0)
  errors!: number;

  @ApiProperty({ description: 'Número de aciertos en la partida.', example: 20 })
  @IsInt()
  @Min(0)
  correctTaps!: number;

  @ApiProperty({
    description: 'Fecha y hora en que el usuario terminó la partida (ISO 8601).',
    example: '2026-09-29T21:30:00.000Z',
  })
  @IsISO8601()
  completedAt!: string;
}
