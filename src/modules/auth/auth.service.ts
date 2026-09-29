import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google.dto';
import { GoogleVerifierService } from './services/google-verifier.service';

// Campos públicos del usuario que sí pueden salir en respuestas REST.
// Nunca incluye credenciales (passwordHash) ni datos internos de autenticación.
const USUARIO_PUBLIC_SELECT = {
  id: true,
  email: true,
  nombreVisible: true,
  fotoPerfilUrl: true,
  institucionId: true,
  departamentoId: true,
  consentimientoDatos: true,
  idiomaPreferido: true,
  modoDaltonismoActivo: true,
  creadoEn: true,
} satisfies Prisma.UsuarioSelect;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly google: GoogleVerifierService,
  ) {}

  // -------------------------------------------------------------------------
  // Registro local (email + contraseña)
  // -------------------------------------------------------------------------
  async register(dto: RegisterDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException('Ya existe una cuenta con ese email.');
    }

    const passwordHash = await argon2.hash(dto.password);

    // Crea el usuario, su método de autenticación LOCAL y su racha en una
    // sola transacción implícita (nested writes de Prisma).
    const usuario = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        nombreVisible: dto.nombreVisible,
        consentimientoDatos: dto.consentimientoDatos ?? false,
        idiomaPreferido: dto.idiomaPreferido ?? 'es',
        racha: { create: {} },
        autenticaciones: {
          create: {
            provider: AuthProvider.LOCAL,
            passwordHash,
          },
        },
      },
      select: USUARIO_PUBLIC_SELECT,
    });

    const tokens = await this.emitirTokens(usuario.id, usuario.email);
    return { usuario, ...tokens };
  }

  // -------------------------------------------------------------------------
  // Login local (email + contraseña)
  // -------------------------------------------------------------------------
  async login(dto: LoginDto) {
    const credencialesInvalidas = () =>
      new UnauthorizedException('Credenciales inválidas.');

    const usuario = await this.prisma.usuario.findFirst({
      where: { email: dto.email, eliminadoEn: null },
      select: {
        ...USUARIO_PUBLIC_SELECT,
        autenticaciones: {
          where: { provider: AuthProvider.LOCAL },
          select: { passwordHash: true },
        },
      },
    });

    const authLocal = usuario?.autenticaciones[0];
    if (!usuario || !authLocal?.passwordHash) {
      // Sin usuario o sin método LOCAL: no revelamos cuál de los dos.
      throw credencialesInvalidas();
    }

    const passwordOk = await argon2.verify(
      authLocal.passwordHash,
      dto.password,
    );
    if (!passwordOk) {
      throw credencialesInvalidas();
    }

    const tokens = await this.emitirTokens(usuario.id, usuario.email);
    return { usuario: this.soloPublico(usuario), ...tokens };
  }

  // -------------------------------------------------------------------------
  // Login / registro con Google
  // -------------------------------------------------------------------------
  async loginConGoogle(dto: GoogleLoginDto) {
    // 1. Validar el ID token contra Google (firma + audiencia).
    const perfil = await this.google.verificarIdToken(dto.idToken);

    // 2. ¿Ya existe un método GOOGLE con ese identificador estable?
    const authExistente = await this.prisma.usuarioAuth.findUnique({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.GOOGLE,
          providerUserId: perfil.googleUserId,
        },
      },
      select: { usuarioId: true },
    });

    if (authExistente) {
      const usuario = await this.prisma.usuario.findFirst({
        where: { id: authExistente.usuarioId, eliminadoEn: null },
        select: USUARIO_PUBLIC_SELECT,
      });
      if (!usuario) {
        throw new UnauthorizedException('La cuenta ya no está disponible.');
      }
      const tokens = await this.emitirTokens(usuario.id, usuario.email);
      return { usuario, ...tokens };
    }

    // 3. No hay método GOOGLE. ¿Existe un usuario con ese email verificado?
    const usuarioPorEmail = await this.prisma.usuario.findFirst({
      where: { email: perfil.email, eliminadoEn: null },
      select: { id: true },
    });

    let usuarioId: bigint;

    if (usuarioPorEmail) {
      // Vinculación segura: el email de Google está verificado, así que
      // añadimos GOOGLE como método al usuario existente en vez de duplicarlo.
      usuarioId = usuarioPorEmail.id;
      await this.prisma.usuarioAuth.create({
        data: {
          usuarioId,
          provider: AuthProvider.GOOGLE,
          providerUserId: perfil.googleUserId,
        },
      });
    } else {
      // Usuario totalmente nuevo: creamos User + método GOOGLE + racha.
      const creado = await this.prisma.usuario.create({
        data: {
          email: perfil.email,
          nombreVisible: perfil.nombre ?? perfil.email.split('@')[0],
          fotoPerfilUrl: perfil.fotoUrl,
          racha: { create: {} },
          autenticaciones: {
            create: {
              provider: AuthProvider.GOOGLE,
              providerUserId: perfil.googleUserId,
            },
          },
        },
        select: { id: true },
      });
      usuarioId = creado.id;
    }

    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
      select: USUARIO_PUBLIC_SELECT,
    });
    const tokens = await this.emitirTokens(usuario.id, usuario.email);
    return { usuario, ...tokens };
  }

  // -------------------------------------------------------------------------
  // Refresh (se mantiene el contrato existente)
  // -------------------------------------------------------------------------
  async refresh(refreshToken: string) {
    let payload: { sub: string; email: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado.');
    }

    const usuario = await this.prisma.usuario.findFirst({
      where: { id: BigInt(payload.sub), eliminadoEn: null },
      select: { id: true, email: true },
    });
    if (!usuario) {
      throw new UnauthorizedException('Usuario no válido.');
    }

    return this.emitirTokens(usuario.id, usuario.email);
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  private async emitirTokens(usuarioId: bigint, email: string) {
    const payload = { sub: usuarioId.toString(), email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /** Descarta cualquier relación de autenticación antes de devolver el usuario. */
  private soloPublico<T extends { autenticaciones?: unknown }>(usuario: T) {
    const { autenticaciones: _omit, ...publico } = usuario;
    void _omit;
    return publico;
  }
}
