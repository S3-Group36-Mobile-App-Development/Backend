import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token emitido al iniciar sesión.' })
  @IsString()
  refreshToken!: string;
}
