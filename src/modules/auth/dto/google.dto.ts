import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description:
      'ID token (JWT) emitido por Google Sign-In en el cliente. El backend lo valida contra Google; nunca se confía en email/nombre enviados por el cliente.',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ii4uLiJ9...',
  })
  @IsString()
  @MinLength(10)
  idToken!: string;
}
