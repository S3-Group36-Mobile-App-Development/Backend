import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CrearDepartamentoDto,
  CrearInstitucionDto,
} from './dto/crear-institucion.dto';

interface FilaResumen {
  departamento_id: bigint;
  nombre_departamento: string;
  semana: Date;
  tipo: string;
  total_eventos: bigint;
}

@Injectable()
export class InstitucionesService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.institucion.findMany({
      include: { departamentos: true },
      orderBy: { id: 'asc' },
    });
  }

  crear(dto: CrearInstitucionDto) {
    return this.prisma.institucion.create({
      data: { nombre: dto.nombre, tipo: dto.tipo },
    });
  }

  async crearDepartamento(institucionId: bigint, dto: CrearDepartamentoDto) {
    const institucion = await this.prisma.institucion.findUnique({
      where: { id: institucionId },
    });
    if (!institucion) {
      throw new NotFoundException('Institución no encontrada.');
    }
    return this.prisma.departamento.create({
      data: { institucionId, nombre: dto.nombre },
    });
  }

  /**
   * Analítica institucional: lee la vista materializada
   * resumen_actividad_departamento. Esa vista solo expone grupos con al menos
   * 5 usuarios distintos (piso de k-anonimidad) y nunca contiene IDs de usuario.
   */
  async resumenActividadDepartamento() {
    const filas = await this.prisma.$queryRaw<FilaResumen[]>`
      SELECT departamento_id, nombre_departamento, semana, tipo, total_eventos
      FROM resumen_actividad_departamento
      ORDER BY semana DESC, nombre_departamento ASC, tipo ASC
    `;

    return filas.map((f) => ({
      departamentoId: f.departamento_id.toString(),
      nombreDepartamento: f.nombre_departamento,
      semana: f.semana,
      tipo: f.tipo,
      totalEventos: Number(f.total_eventos),
    }));
  }

  /** Refresca la vista materializada de analítica. */
  async refrescarResumen() {
    await this.prisma.$executeRawUnsafe(
      'REFRESH MATERIALIZED VIEW resumen_actividad_departamento',
    );
    return { refrescado: true };
  }
}
