import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class ActivarPanicoDto {
  @ApiPropertyOptional({
    description: 'ID del contacto al que se intenta llamar (opcional).',
  })
  @IsOptional()
  @IsInt()
  contactoId?: number;
}

export class ConectarPanicoDto {
  @ApiPropertyOptional({
    description:
      'Momento en que se conectó la llamada (ISO 8601). Si se omite, se usa el instante actual.',
  })
  @IsOptional()
  conectadoEn?: string;
}
