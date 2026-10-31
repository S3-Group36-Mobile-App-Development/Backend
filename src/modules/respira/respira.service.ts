import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsentimientoService } from '../../common/services/consentimiento.service';
import {
  IniciarSesionDto,
  CompletarSesionDto,
} from './dto/sesion-respiracion.dto';
import { ActualizarEjercicioDto } from './dto/actualizar-ejercicio.dto';

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

  /**
   * Actualiza los datos de un ejercicio del catálogo (edición parcial).
   * Nota: hoy solo exige JWT. Para producción debería restringirse a un rol
   * de administrador (el sistema aún no tiene roles de usuario).
   */
  async actualizarEjercicio(id: bigint, dto: ActualizarEjercicioDto) {
    const existe = await this.prisma.ejercicioRespiracion.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existe) {
      throw new NotFoundException('Ejercicio de respiración no encontrado.');
    }

    return this.prisma.ejercicioRespiracion.update({
      where: { id },
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        duracion: dto.duracion,
        patron: dto.patron as Prisma.InputJsonValue | undefined,
        vibra: dto.vibra,
        // Métricas enviadas manualmente (no se calculan solas).
        usageCount: dto.usageCount,
        ratingAvg: dto.ratingAvg,
        ratingCount: dto.ratingCount,
      },
    });
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
      data: {
        usuarioId,
        ejercicioId: BigInt(dto.ejercicioId),
        initialEmotion: dto.initialEmotion,
      },
    });
  }

  /**
   * Marca una sesión como completada y guarda mood final + pausas.
   * Las métricas del ejercicio (usageCount, ratingAvg, ratingCount) NO se
   * calculan aquí: se gestionan manualmente vía PUT /respira/ejercicios/:id.
   */
  async completarSesion(
    usuarioId: bigint,
    sesionId: bigint,
    dto: CompletarSesionDto,
  ) {
    const sesion = await this.prisma.respiracionSesion.findFirst({
      where: { id: sesionId, usuarioId },
    });
    if (!sesion) {
      throw new NotFoundException('Sesión de respiración no encontrada.');
    }

    return this.prisma.respiracionSesion.update({
      where: { id: sesionId },
      data: {
        completadaEn: new Date(),
        finalEmotion: dto.finalEmotion,
        numberMovementPauses: dto.numberMovementPauses,
      },
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
