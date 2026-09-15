import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface FilaActividad {
  tipo: string;
  ocurrido_en: Date;
  detalle: string | null;
}

@Injectable()
export class ActividadService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tab Actividad: consulta la vista unificada vista_actividad_usuario, que une
   * check-ins, respiración, audios, juegos, protocolos y flashcards sin duplicar
   * datos. Ordenada por fecha descendente y paginada.
   */
  async listar(usuarioId: bigint, limit = 50, offset = 0) {
    const filas = await this.prisma.$queryRaw<FilaActividad[]>`
      SELECT tipo, ocurrido_en, detalle
      FROM vista_actividad_usuario
      WHERE usuario_id = ${usuarioId}
      ORDER BY ocurrido_en DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return filas.map((f) => ({
      tipo: f.tipo,
      ocurridoEn: f.ocurrido_en,
      detalle: f.detalle,
    }));
  }
}
