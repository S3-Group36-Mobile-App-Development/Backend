import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsentimientoService } from '../../common/services/consentimiento.service';
import { IniciarJuegoDto } from './dto/sesion-juego.dto';

@Injectable()
export class JuegosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly consentimiento: ConsentimientoService,
  ) {}

  /** Catálogo de juegos. */
  listar() {
    return this.prisma.juego.findMany({ orderBy: { id: 'asc' } });
  }

  /**
   * Inicia una sesión de juego. No se guarda puntaje ni resultado: solo
   * importa que se jugó, para el tab Actividad.
   */
  async iniciarSesion(usuarioId: bigint, dto: IniciarJuegoDto) {
    await this.consentimiento.asegurarConsentimiento(usuarioId);

    const juego = await this.prisma.juego.findUnique({
      where: { id: BigInt(dto.juegoId) },
    });
    if (!juego) {
      throw new NotFoundException('Juego no encontrado.');
    }

    return this.prisma.juegoSesion.create({
      data: { usuarioId, juegoId: BigInt(dto.juegoId) },
    });
  }

  async finalizarSesion(usuarioId: bigint, sesionId: bigint) {
    const sesion = await this.prisma.juegoSesion.findFirst({
      where: { id: sesionId, usuarioId },
    });
    if (!sesion) {
      throw new NotFoundException('Sesión de juego no encontrada.');
    }
    return this.prisma.juegoSesion.update({
      where: { id: sesionId },
      data: { finalizadaEn: new Date() },
    });
  }

  listarSesiones(usuarioId: bigint) {
    return this.prisma.juegoSesion.findMany({
      where: { usuarioId },
      orderBy: { iniciadaEn: 'desc' },
      include: { juego: true },
    });
  }
}
