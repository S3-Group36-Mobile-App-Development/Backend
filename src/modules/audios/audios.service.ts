import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsentimientoService } from '../../common/services/consentimiento.service';
import { RegistrarReproduccionDto } from './dto/reproduccion.dto';

@Injectable()
export class AudiosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly consentimiento: ConsentimientoService,
  ) {}

  /** Catálogo de audios predefinidos por el equipo. */
  listar() {
    return this.prisma.audio.findMany({ orderBy: { id: 'asc' } });
  }

  /**
   * Registra una reproducción. Puede ser de un audio del catálogo (audioId)
   * o de un audio local del usuario (tituloLocal, con audioId = null).
   */
  async registrarReproduccion(
    usuarioId: bigint,
    dto: RegistrarReproduccionDto,
  ) {
    await this.consentimiento.asegurarConsentimiento(usuarioId);

    if (dto.audioId === undefined && !dto.tituloLocal) {
      throw new BadRequestException(
        'Indica audioId (audio del catálogo) o tituloLocal (audio local).',
      );
    }

    if (dto.audioId !== undefined) {
      const audio = await this.prisma.audio.findUnique({
        where: { id: BigInt(dto.audioId) },
      });
      if (!audio) {
        throw new NotFoundException('Audio no encontrado en el catálogo.');
      }
    }

    return this.prisma.audioReproduccion.create({
      data: {
        usuarioId,
        audioId: dto.audioId !== undefined ? BigInt(dto.audioId) : null,
        tituloLocal: dto.audioId === undefined ? dto.tituloLocal : null,
        duracionEscuchadaSegundos: dto.duracionEscuchadaSegundos,
      },
    });
  }

  listarReproducciones(usuarioId: bigint) {
    return this.prisma.audioReproduccion.findMany({
      where: { usuarioId },
      orderBy: { iniciadaEn: 'desc' },
      include: { audio: true },
    });
  }
}
