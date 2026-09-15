import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApoyoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Catálogo fijo de líneas de emergencia. Opcionalmente filtrable por país.
   */
  listarLineasEmergencia(pais?: string) {
    return this.prisma.lineaEmergencia.findMany({
      where: pais ? { pais } : undefined,
      orderBy: { nombre: 'asc' },
    });
  }
}
