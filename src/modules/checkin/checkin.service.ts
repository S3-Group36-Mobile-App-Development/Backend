import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsentimientoService } from '../../common/services/consentimiento.service';
import { CrearChequeoDto } from './dto/crear-chequeo.dto';

@Injectable()
export class CheckinService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly consentimiento: ConsentimientoService,
  ) {}

  /** Catálogo de estados de ánimo, ordenado. */
  listarEstadosAnimo() {
    return this.prisma.estadoAnimo.findMany({ orderBy: { orden: 'asc' } });
  }

  /**
   * Registra el check-in diario. Respeta la regla de un check-in por día
   * (índice único sobre usuario_id + fecha) y actualiza la racha.
   */
  async crearChequeo(usuarioId: bigint, dto: CrearChequeoDto) {
    await this.consentimiento.asegurarConsentimiento(usuarioId);

    const estado = await this.prisma.estadoAnimo.findUnique({
      where: { id: BigInt(dto.estadoAnimoId) },
    });
    if (!estado) {
      throw new NotFoundException('El estado de ánimo indicado no existe.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const chequeo = await tx.chequeoAnimo.create({
          data: {
            usuarioId,
            estadoAnimoId: BigInt(dto.estadoAnimoId),
            comentario: dto.comentario,
          },
          include: { estadoAnimo: true },
        });

        await this.actualizarRacha(tx, usuarioId);
        return chequeo;
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Ya registraste tu check-in de hoy.');
      }
      throw e;
    }
  }

  /** Historial de check-ins del usuario, más recientes primero. */
  listarHistorial(usuarioId: bigint) {
    return this.prisma.chequeoAnimo.findMany({
      where: { usuarioId },
      orderBy: { registradoEn: 'desc' },
      include: { estadoAnimo: true },
    });
  }

  /**
   * Lógica de racha: si el último check-in fue ayer, la racha sube en 1;
   * si fue hoy, no cambia; en cualquier otro caso, se reinicia a 1.
   */
  private async actualizarRacha(
    tx: Prisma.TransactionClient,
    usuarioId: bigint,
  ) {
    const hoy = this.soloFecha(new Date());

    const racha = await tx.racha.findUnique({ where: { usuarioId } });

    let rachaActual = 1;
    if (racha?.fechaUltimoCheckin) {
      const ultimo = this.soloFecha(racha.fechaUltimoCheckin);
      const diffDias = Math.round(
        (hoy.getTime() - ultimo.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDias === 0) {
        rachaActual = racha.rachaActualDias; // mismo día, no cambia
      } else if (diffDias === 1) {
        rachaActual = racha.rachaActualDias + 1; // día consecutivo
      } else {
        rachaActual = 1; // se rompió la racha
      }
    }

    const masLarga = Math.max(rachaActual, racha?.rachaMasLargaDias ?? 0);

    await tx.racha.upsert({
      where: { usuarioId },
      create: {
        usuarioId,
        rachaActualDias: rachaActual,
        rachaMasLargaDias: masLarga,
        fechaUltimoCheckin: hoy,
      },
      update: {
        rachaActualDias: rachaActual,
        rachaMasLargaDias: masLarga,
        fechaUltimoCheckin: hoy,
      },
    });
  }

  private soloFecha(fecha: Date): Date {
    return new Date(
      Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()),
    );
  }
}
