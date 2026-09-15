import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existente) {
      throw new ConflictException('Ya existe una cuenta con ese email.');
    }

    const passwordHash = await argon2.hash(dto.password);

    const usuario = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        passwordHash,
        nombreVisible: dto.nombreVisible,
        consentimientoDatos: dto.consentimientoDatos ?? false,
        idiomaPreferido: dto.idiomaPreferido ?? 'es',
        // Cada usuario nace con su registro de racha en cero.
        racha: { create: {} },
      },
      select: this.usuarioPublicSelect(),
    });

    const tokens = await this.emitirTokens(usuario.id, usuario.email);
    return { usuario, ...tokens };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { email: dto.email, eliminadoEn: null },
    });
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const passwordOk = await argon2.verify(usuario.passwordHash, dto.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const tokens = await this.emitirTokens(usuario.id, usuario.email);
    return {
      usuario: this.aUsuarioPublico(usuario),
      ...tokens,
    };
  }

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
    });
    if (!usuario) {
      throw new UnauthorizedException('Usuario no válido.');
    }

    return this.emitirTokens(usuario.id, usuario.email);
  }

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

  private usuarioPublicSelect() {
    return {
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
    };
  }

  private aUsuarioPublico(usuario: {
    id: bigint;
    email: string;
    nombreVisible: string;
    fotoPerfilUrl: string | null;
    institucionId: bigint | null;
    departamentoId: bigint | null;
    consentimientoDatos: boolean;
    idiomaPreferido: string;
    modoDaltonismoActivo: boolean;
    creadoEn: Date;
  }) {
    return {
      id: usuario.id,
      email: usuario.email,
      nombreVisible: usuario.nombreVisible,
      fotoPerfilUrl: usuario.fotoPerfilUrl,
      institucionId: usuario.institucionId,
      departamentoId: usuario.departamentoId,
      consentimientoDatos: usuario.consentimientoDatos,
      idiomaPreferido: usuario.idiomaPreferido,
      modoDaltonismoActivo: usuario.modoDaltonismoActivo,
      creadoEn: usuario.creadoEn,
    };
  }
}
