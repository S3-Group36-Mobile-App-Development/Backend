import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtUser } from '../../../common/decorators/current-user.decorator';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    const usuarioId = BigInt(payload.sub);
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: usuarioId, eliminadoEn: null },
      select: { id: true, email: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no válido o cuenta eliminada.');
    }

    return { usuarioId: usuario.id, email: usuario.email };
  }
}
