import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsentimientoService } from '../../common/services/consentimiento.service';
import { IniciarSesionDto } from './dto/sesion-respiracion.dto';

@Injectable()
export class RespiraService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly consentimiento: ConsentimientoService,
  ) {}

  /** Catálogo de ejercicios de respiración. */
  listarEjercicios() {
    return this.prisma.ejercicioRespiracion.findMany({ orderBy: { id: 'asc' } });
  }

  obtenerEjercicio(id: bigint) {
    return this.prisma.ejercicioRespiracion.findUnique({ where: { id } });
  }

  /** Inicia una sesión de respiración (registra actividad). */
  async iniciarSesion(usuarioId: bigint, dto: IniciarSesionDto) {
    await this.consentimiento.asegurarConsentimiento(usuarioId);

    const ejercicio = await this.prisma.ejercicioRespiracion.findUnique({
      where: { id: BigInt(dto.ejercicioId) },
    });
    if (!ejercicio) {
      throw new NotFoundException('Ejercicio de respiración no encontrado.');
    }

    return this.prisma.respiracionSesion.create({
      data: { usuarioId, ejercicioId: BigInt(dto.ejercicioId) },
    });
  }

  /** Marca una sesión como completada. */
  async completarSesion(usuarioId: bigint, sesionId: bigint) {
    const sesion = await this.prisma.respiracionSesion.findFirst({
      where: { id: sesionId, usuarioId },
    });
    if (!sesion) {
      throw new NotFoundException('Sesión de respiración no encontrada.');
    }

    return this.prisma.respiracionSesion.update({
      where: { id: sesionId },
      data: { completadaEn: new Date() },
    });
  }

  listarSesiones(usuarioId: bigint) {
    return this.prisma.respiracionSesion.findMany({
      where: { usuarioId },
      orderBy: { iniciadaEn: 'desc' },
      include: { ejercicio: true },
    });
  }
}
