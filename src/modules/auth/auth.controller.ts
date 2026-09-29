import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { GoogleLoginDto } from './dto/google.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Registrar una nueva cuenta local (email + contraseña).',
  })
  @ApiOkResponse({
    description: 'Usuario público + accessToken/refreshToken.',
  })
  @ApiConflictResponse({ description: 'Ya existe una cuenta con ese email.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con email + contraseña.' })
  @ApiOkResponse({ description: 'Usuario público + tokens JWT.' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Iniciar sesión con Google. El backend valida el ID token contra Google y crea o vincula la cuenta.',
  })
  @ApiOkResponse({ description: 'Usuario público + tokens JWT.' })
  @ApiUnauthorizedResponse({
    description: 'ID token de Google inválido o sin email verificado.',
  })
  google(@Body() dto: GoogleLoginDto) {
    return this.authService.loginConGoogle(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar el access token con un refresh token.' })
  @ApiOkResponse({ description: 'Nuevos accessToken/refreshToken.' })
  @ApiUnauthorizedResponse({
    description: 'Refresh token inválido o expirado.',
  })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }
}
