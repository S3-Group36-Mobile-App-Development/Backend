import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { AsignarInstitucionDto } from './dto/asignar-institucion.dto';

const PERFIL_SELECT = {
  id: true,
  email: true,
  nombreVisible: true,
  fotoPerfilUrl: true,
  institucionId: true,
  departamentoId: true,
  consentimientoDatos: true,
  idiomaPreferido: true,
  modoDaltonismoActivo: true,
  creadoEn: true,
} as const;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  /** Perfil del usuario junto con su racha (tab Perfil). */
  async obtenerPerfil(usuarioId: bigint) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: usuarioId, eliminadoEn: null },
      select: {
        ...PERFIL_SELECT,
        racha: {
          select: {
            rachaActualDias: true,
            rachaMasLargaDias: true,
            fechaUltimoCheckin: true,
          },
        },
        institucion: { select: { id: true, nombre: true, tipo: true } },
        departamento: { select: { id: true, nombre: true } },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return usuario;
  }

  async actualizarPerfil(usuarioId: bigint, dto: UpdatePerfilDto) {
    await this.asegurarActivo(usuarioId);
    return this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nombreVisible: dto.nombreVisible,
        fotoPerfilUrl: dto.fotoPerfilUrl,
        idiomaPreferido: dto.idiomaPreferido,
        modoDaltonismoActivo: dto.modoDaltonismoActivo,
        consentimientoDatos: dto.consentimientoDatos,
      },
      select: PERFIL_SELECT,
    });
  }

  async asignarInstitucion(usuarioId: bigint, dto: AsignarInstitucionDto) {
    await this.asegurarActivo(usuarioId);

    const institucion = await this.prisma.institucion.findUnique({
      where: { id: BigInt(dto.institucionId) },
    });
    if (!institucion) {
      throw new NotFoundException('La institución indicada no existe.');
    }

    if (dto.departamentoId !== undefined) {
      const departamento = await this.prisma.departamento.findUnique({
        where: { id: BigInt(dto.departamentoId) },
      });
      if (!departamento) {
        throw new NotFoundException('El departamento indicado no existe.');
      }
      if (departamento.institucionId !== institucion.id) {
        throw new BadRequestException(
          'El departamento no pertenece a la institución indicada.',
        );
      }
    }

    return this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        institucionId: BigInt(dto.institucionId),
        departamentoId:
          dto.departamentoId !== undefined ? BigInt(dto.departamentoId) : null,
      },
      select: PERFIL_SELECT,
    });
  }

  /**
   * Eliminación de cuenta. Se hace un borrado físico del usuario, lo que dispara
   * los ON DELETE CASCADE del diseño y borra toda su actividad. La vista
   * materializada resumen_actividad_departamento no se ve afectada porque
   * nunca guarda IDs de usuario, solo agregados.
   */
  async eliminarCuenta(usuarioId: bigint) {
    await this.asegurarActivo(usuarioId);
    await this.prisma.usuario.delete({ where: { id: usuarioId } });
    return { eliminado: true };
  }

  private async asegurarActivo(usuarioId: bigint) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: usuarioId, eliminadoEn: null },
      select: { id: true },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
  }
}
