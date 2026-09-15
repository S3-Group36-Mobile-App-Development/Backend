import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export enum PlataformaAppDto {
  android_kotlin = 'android_kotlin',
  flutter = 'flutter',
}

export enum TipoEventoTelemetriaDto {
  vista_pantalla = 'vista_pantalla',
  crash = 'crash',
  uso_funcionalidad = 'uso_funcionalidad',
}

export class RegistrarEventoDto {
  @ApiPropertyOptional({
    description:
      'ID del usuario asociado (opcional; los eventos anónimos son válidos).',
  })
  @IsOptional()
  @IsInt()
  usuarioId?: number;

  @ApiProperty({ enum: PlataformaAppDto })
  @IsEnum(PlataformaAppDto)
  plataforma!: PlataformaAppDto;

  @ApiProperty({ enum: TipoEventoTelemetriaDto })
  @IsEnum(TipoEventoTelemetriaDto)
  tipoEvento!: TipoEventoTelemetriaDto;

  @ApiPropertyOptional({ example: 'CheckInScreen' })
  @IsOptional()
  @IsString()
  nombrePantalla?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
