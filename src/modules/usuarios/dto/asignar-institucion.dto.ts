import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class AsignarInstitucionDto {
  @ApiProperty({ description: 'ID de la institución.', example: 1 })
  @IsInt()
  institucionId!: number;

  @ApiPropertyOptional({ description: 'ID del departamento.', example: 3 })
  @IsOptional()
  @IsInt()
  departamentoId?: number;
}
