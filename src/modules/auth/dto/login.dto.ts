import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'estudiante@zenmind.app' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'unaClaveSegura123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
