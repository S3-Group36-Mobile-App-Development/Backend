import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsentimientoService } from '../../common/services/consentimiento.service';
import { RegistrarSesionJuegoDto } from './dto/sesion-juego.dto';

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
   * Registra una partida ya completada. El cliente genera el UUID y envía las
   * métricas (duración, errores, aciertos) junto con el momento en que terminó.
   * Es idempotente: si la partida ya se registró (mismo id), no se duplica.
   */
  async registrarSesion(usuarioId: bigint, dto: RegistrarSesionJuegoDto) {
    await this.consentimiento.asegurarConsentimiento(usuarioId);

    const existente = await this.prisma.juegoSesion.findUnique({
      where: { id: dto.id },
    });
    if (existente) {
      // Si ya existe pero pertenece a otro usuario, es un conflicto de ID.
      if (existente.usuarioId !== usuarioId) {
        throw new ConflictException('Ya existe una partida con ese id.');
      }
      return existente;
    }

    return this.prisma.juegoSesion.create({
      data: {
        id: dto.id,
        usuarioId,
        durationMs: dto.durationMs,
        errors: dto.errors,
        correctTaps: dto.correctTaps,
        completedAt: new Date(dto.completedAt),
      },
    });
  }

  /** Historial de partidas del usuario, más recientes primero. */
  listarSesiones(usuarioId: bigint) {
    return this.prisma.juegoSesion.findMany({
      where: { usuarioId },
      orderBy: { completedAt: 'desc' },
    });
  }
}
