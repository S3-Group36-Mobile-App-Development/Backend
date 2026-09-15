import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearContactoDto } from './dto/crear-contacto.dto';
import { ActualizarContactoDto } from './dto/actualizar-contacto.dto';
import {
  ActivarPanicoDto,
  ConectarPanicoDto,
} from './dto/evento-panico.dto';

@Injectable()
export class PanicoService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Contactos personales ----

  listarContactos(usuarioId: bigint) {
    return this.prisma.contactoPersonal.findMany({
      where: { usuarioId },
      orderBy: { id: 'asc' },
    });
  }

  async crearContacto(usuarioId: bigint, dto: CrearContactoDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.esContactoPanico) {
        // Solo puede haber un contacto de pánico por usuario (índice único parcial).
        await this.limpiarContactoPanico(tx, usuarioId);
      }
      return tx.contactoPersonal.create({
        data: {
          usuarioId,
          nombre: dto.nombre,
          telefono: dto.telefono,
          relacion: dto.relacion,
          esContactoPanico: dto.esContactoPanico ?? false,
        },
      });
    });
  }

  async actualizarContacto(
    usuarioId: bigint,
    contactoId: bigint,
    dto: ActualizarContactoDto,
  ) {
    await this.asegurarPropiedadContacto(usuarioId, contactoId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.esContactoPanico) {
        await this.limpiarContactoPanico(tx, usuarioId);
      }
      return tx.contactoPersonal.update({
        where: { id: contactoId },
        data: {
          nombre: dto.nombre,
          telefono: dto.telefono,
          relacion: dto.relacion,
          esContactoPanico: dto.esContactoPanico,
        },
      });
    });
  }

  async eliminarContacto(usuarioId: bigint, contactoId: bigint) {
    await this.asegurarPropiedadContacto(usuarioId, contactoId);
    await this.prisma.contactoPersonal.delete({ where: { id: contactoId } });
    return { eliminado: true };
  }

  // ---- Eventos de pánico ----

  /** Registra la activación del botón de pánico. */
  async activarPanico(usuarioId: bigint, dto: ActivarPanicoDto) {
    let contactoId: bigint | null = null;
    if (dto.contactoId !== undefined) {
      const contacto = await this.prisma.contactoPersonal.findFirst({
        where: { id: BigInt(dto.contactoId), usuarioId },
      });
      if (!contacto) {
        throw new NotFoundException('Contacto no encontrado.');
      }
      contactoId = contacto.id;
    }

    return this.prisma.eventoPanico.create({
      data: { usuarioId, contactoId },
    });
  }

  /**
   * Marca el evento como conectado. El tiempo de respuesta (tiempo_respuesta_ms)
   * lo calcula la base de datos como columna generada.
   */
  async conectarPanico(
    usuarioId: bigint,
    eventoId: bigint,
    dto: ConectarPanicoDto,
  ) {
    const evento = await this.prisma.eventoPanico.findFirst({
      where: { id: eventoId, usuarioId },
    });
    if (!evento) {
      throw new NotFoundException('Evento de pánico no encontrado.');
    }

    const conectadoEn = dto.conectadoEn ? new Date(dto.conectadoEn) : new Date();

    await this.prisma.eventoPanico.update({
      where: { id: eventoId },
      data: { conectadoEn },
    });

    // Releemos incluyendo la columna generada tiempo_respuesta_ms.
    const [row] = await this.prisma.$queryRaw<
      Array<{ tiempo_respuesta_ms: number | null }>
    >`SELECT tiempo_respuesta_ms FROM eventos_panico WHERE id = ${eventoId}`;

    return {
      id: eventoId.toString(),
      conectadoEn,
      tiempoRespuestaMs: row?.tiempo_respuesta_ms ?? null,
    };
  }

  listarEventos(usuarioId: bigint) {
    return this.prisma.eventoPanico.findMany({
      where: { usuarioId },
      orderBy: { activadoEn: 'desc' },
      include: { contacto: true },
    });
  }

  // ---- Helpers ----

  private async limpiarContactoPanico(
    tx: Prisma.TransactionClient,
    usuarioId: bigint,
  ) {
    await tx.contactoPersonal.updateMany({
      where: { usuarioId, esContactoPanico: true },
      data: { esContactoPanico: false },
    });
  }

  private async asegurarPropiedadContacto(
    usuarioId: bigint,
    contactoId: bigint,
  ) {
    const contacto = await this.prisma.contactoPersonal.findUnique({
      where: { id: contactoId },
      select: { usuarioId: true },
    });
    if (!contacto) {
      throw new NotFoundException('Contacto no encontrado.');
    }
    if (contacto.usuarioId !== usuarioId) {
      throw new ForbiddenException('Este contacto no te pertenece.');
    }
  }
}
