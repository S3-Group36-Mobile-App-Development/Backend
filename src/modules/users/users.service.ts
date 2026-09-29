import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Selección pública: nunca incluye credenciales ni datos internos de auth.
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
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Devuelve el usuario autenticado (información pública). */
  async obtenerActual(usuarioId: bigint) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: usuarioId, eliminadoEn: null },
      select: USUARIO_PUBLIC_SELECT,
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return usuario;
  }
}
