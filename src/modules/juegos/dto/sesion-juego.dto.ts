import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class IniciarJuegoDto {
  @ApiProperty({ description: 'ID del juego.', example: 1 })
  @IsInt()
  juegoId!: number;
}
