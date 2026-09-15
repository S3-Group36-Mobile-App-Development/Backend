import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CrearContactoDto {
  @ApiProperty({ example: 'Mamá' })
  @IsString()
  @MinLength(1)
  nombre!: string;

  @ApiProperty({ example: '+50588887777' })
  @IsString()
  @MinLength(3)
  telefono!: string;

  @ApiPropertyOptional({ example: 'Familiar' })
  @IsOptional()
  @IsString()
  relacion?: string;

  @ApiPropertyOptional({
    description: 'Marca este contacto como el contacto de pánico (único por usuario).',
  })
  @IsOptional()
  @IsBoolean()
  esContactoPanico?: boolean;
}
