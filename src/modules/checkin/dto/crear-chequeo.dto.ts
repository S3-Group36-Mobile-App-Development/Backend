import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearChequeoDto {
  @ApiProperty({ description: 'ID del estado de ánimo elegido.', example: 1 })
  @IsInt()
  estadoAnimoId!: number;

  @ApiPropertyOptional({ example: 'Hoy fue un día tranquilo.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comentario?: string;
}
