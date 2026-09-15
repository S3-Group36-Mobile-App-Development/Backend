import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class IniciarSesionDto {
  @ApiProperty({ description: 'ID del ejercicio de respiración.', example: 1 })
  @IsInt()
  ejercicioId!: number;
}
