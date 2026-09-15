import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearProtocoloDto } from './dto/crear-protocolo.dto';

@Injectable()
export class ProtocolosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista los protocolos visibles para el usuario: los predefinidos por el
   * equipo (usuario_id NULL) más los propios del usuario.
   */
  listarProtocolos(usuarioId: bigint) {
    return this.prisma.protocolo.findMany({
      where: {
        OR: [{ esPredefinido: true }, { usuarioId }],
      },
      include: { pasos: { orderBy: { ordenPaso: 'asc' } } },
      orderBy: [{ esPredefinido: 'desc' }, { id: 'asc' }],
    });
  }

  async obtenerProtocolo(usuarioId: bigint, protocoloId: bigint) {
    const protocolo = await this.prisma.protocolo.findUnique({
      where: { id: protocoloId },
      include: { pasos: { orderBy: { ordenPaso: 'asc' } } },
    });
    if (!protocolo) {
      throw new NotFoundException('Protocolo no encontrado.');
    }
    if (!protocolo.esPredefinido && protocolo.usuarioId !== usuarioId) {
      throw new ForbiddenException('Este protocolo no te pertenece.');
    }
    return protocolo;
  }

  /** Crea un protocolo propio del usuario con sus pasos. */
  crearProtocolo(usuarioId: bigint, dto: CrearProtocoloDto) {
    return this.prisma.protocolo.create({
      data: {
        usuarioId,
        titulo: dto.titulo,
        esPredefinido: false,
        pasos: {
          create: dto.pasos.map((p) => ({
            ordenPaso: p.ordenPaso,
            descripcion: p.descripcion,
          })),
        },
      },
      include: { pasos: { orderBy: { ordenPaso: 'asc' } } },
    });
  }

  async eliminarProtocolo(usuarioId: bigint, protocoloId: bigint) {
    const protocolo = await this.prisma.protocolo.findUnique({
      where: { id: protocoloId },
      select: { usuarioId: true, esPredefinido: true },
    });
    if (!protocolo) {
      throw new NotFoundException('Protocolo no encontrado.');
    }
    if (protocolo.esPredefinido || protocolo.usuarioId !== usuarioId) {
      throw new ForbiddenException(
        'Solo puedes eliminar tus propios protocolos.',
      );
    }
    await this.prisma.protocolo.delete({ where: { id: protocoloId } });
    return { eliminado: true };
  }

  /** Registra que el usuario vio un protocolo (para el tab Actividad). */
  async registrarVista(usuarioId: bigint, protocoloId: bigint) {
    const protocolo = await this.prisma.protocolo.findUnique({
      where: { id: protocoloId },
      select: { id: true, usuarioId: true, esPredefinido: true },
    });
    if (!protocolo) {
      throw new NotFoundException('Protocolo no encontrado.');
    }
    if (!protocolo.esPredefinido && protocolo.usuarioId !== usuarioId) {
      throw new ForbiddenException('Este protocolo no te pertenece.');
    }
    return this.prisma.protocoloVista.create({
      data: { usuarioId, protocoloId },
    });
  }
}
