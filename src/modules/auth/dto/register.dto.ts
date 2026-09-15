import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'estudiante@zenmind.app' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'unaClaveSegura123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Ana Pérez' })
  @IsString()
  @MinLength(1)
  nombreVisible!: string;

  @ApiPropertyOptional({ description: 'Consentimiento para sincronizar datos.' })
  @IsOptional()
  @IsBoolean()
  consentimientoDatos?: boolean;

  @ApiPropertyOptional({ example: 'es' })
  @IsOptional()
  @IsString()
  idiomaPreferido?: string;
}
