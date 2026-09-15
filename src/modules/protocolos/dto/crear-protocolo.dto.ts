import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class PasoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  ordenPaso!: number;

  @ApiProperty({ example: 'Respira profundo tres veces.' })
  @IsString()
  @MinLength(1)
  descripcion!: string;
}

export class CrearProtocoloDto {
  @ApiProperty({ example: 'Mi rutina para la ansiedad' })
  @IsString()
  @MinLength(1)
  titulo!: string;

  @ApiProperty({ type: [PasoDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PasoDto)
  pasos!: PasoDto[];
}
