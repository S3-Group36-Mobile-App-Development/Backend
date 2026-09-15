import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrarEventoDto } from './dto/registrar-evento.dto';

@Injectable()
export class TelemetriaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un evento de telemetría de la app. El usuarioId puede venir del
   * JWT (si hay sesión) o del cuerpo (p. ej. crashes anónimos).
   */
  registrarEvento(dto: RegistrarEventoDto, usuarioIdAuth?: bigint) {
    const usuarioId =
      usuarioIdAuth ??
      (dto.usuarioId !== undefined ? BigInt(dto.usuarioId) : null);

    return this.prisma.eventoTelemetriaApp.create({
      data: {
        usuarioId,
        plataforma: dto.plataforma,
        tipoEvento: dto.tipoEvento,
        nombrePantalla: dto.nombrePantalla,
        metadata:
          dto.metadata !== undefined
            ? (dto.metadata as Prisma.InputJsonValue)
            : undefined,
      },
    });
  }
}
