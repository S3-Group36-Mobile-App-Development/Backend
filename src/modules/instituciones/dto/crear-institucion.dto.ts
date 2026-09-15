import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';

export enum TipoInstitucionDto {
  universidad = 'universidad',
  empresa = 'empresa',
  gobierno = 'gobierno',
}

export class CrearInstitucionDto {
  @ApiProperty({ example: 'Universidad Nacional' })
  @IsString()
  @MinLength(1)
  nombre!: string;

  @ApiProperty({ enum: TipoInstitucionDto })
  @IsEnum(TipoInstitucionDto)
  tipo!: TipoInstitucionDto;
}

export class CrearDepartamentoDto {
  @ApiProperty({ example: 'Facultad de Ingeniería' })
  @IsString()
  @MinLength(1)
  nombre!: string;
}
