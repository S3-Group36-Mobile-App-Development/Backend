import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsentimientoService } from '../../common/services/consentimiento.service';
import {
  IniciarSesionDto,
  CompletarSesionDto,
} from './dto/sesion-respiracion.dto';

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
      data: {
        usuarioId,
        ejercicioId: BigInt(dto.ejercicioId),
        initialEmotion: dto.initialEmotion,
      },
    });
  }

  /**
   * Marca una sesión como completada y guarda mood final + pausas.
   * Además actualiza las métricas agregadas del ejercicio: incrementa el
   * contador de uso y, si el usuario envió una calificación, recalcula el
   * promedio. Todo en una transacción para mantener la consistencia.
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

    return this.prisma.$transaction(async (tx) => {
      const sesionActualizada = await tx.respiracionSesion.update({
        where: { id: sesionId },
        data: {
          completadaEn: new Date(),
          finalEmotion: dto.finalEmotion,
          numberMovementPauses: dto.numberMovementPauses,
        },
      });

      if (dto.rating !== undefined) {
        // Recalcula el promedio incremental:
        //   nuevoAvg = (avg * count + rating) / (count + 1)
        const ejercicio = await tx.ejercicioRespiracion.findUnique({
          where: { id: sesion.ejercicioId },
          select: { ratingAvg: true, ratingCount: true },
        });
        const count = ejercicio?.ratingCount ?? 0;
        const avg = ejercicio ? Number(ejercicio.ratingAvg) : 0;
        const nuevoCount = count + 1;
        const nuevoAvg = (avg * count + dto.rating) / nuevoCount;

        await tx.ejercicioRespiracion.update({
          where: { id: sesion.ejercicioId },
          data: {
            usageCount: { increment: 1 },
            ratingCount: nuevoCount,
            // Decimal(3,2): redondeo a 2 decimales.
            ratingAvg: Math.round(nuevoAvg * 100) / 100,
          },
        });
      } else {
        // Sin calificación: solo cuenta el uso.
        await tx.ejercicioRespiracion.update({
          where: { id: sesion.ejercicioId },
          data: { usageCount: { increment: 1 } },
        });
      }

      return sesionActualizada;
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
