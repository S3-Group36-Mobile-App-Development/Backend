import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class UpdatePerfilDto {
  @ApiPropertyOptional({ example: 'Ana Pérez' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  nombreVisible?: string;

  @ApiPropertyOptional({ example: 'https://cdn.zenmind.app/fotos/ana.png' })
  @IsOptional()
  @IsUrl()
  fotoPerfilUrl?: string;

  @ApiPropertyOptional({ example: 'es' })
  @IsOptional()
  @IsString()
  idiomaPreferido?: string;

  @ApiPropertyOptional({ description: 'Activa el modo daltonismo.' })
  @IsOptional()
  @IsBoolean()
  modoDaltonismoActivo?: boolean;

  @ApiPropertyOptional({
    description: 'Consentimiento para sincronizar datos de actividad.',
  })
  @IsOptional()
  @IsBoolean()
  consentimientoDatos?: boolean;
}
