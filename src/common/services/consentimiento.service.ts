import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Regla de privacidad del diseño (sección 12):
 * si usuarios.consentimiento_datos = false, el backend no debe aceptar la
 * sincronización de actividad (chequeos_animo, respiracion_sesiones,
 * audio_reproducciones, etc.). Esos datos se quedan solo en el dispositivo.
 */
@Injectable()
export class ConsentimientoService {
  constructor(private readonly prisma: PrismaService) {}

  async asegurarConsentimiento(usuarioId: bigint) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: usuarioId, eliminadoEn: null },
      select: { consentimientoDatos: true },
    });

    if (!usuario) {
      throw new ForbiddenException('Usuario no válido.');
    }

    if (!usuario.consentimientoDatos) {
      throw new ForbiddenException(
        'Sincronización no permitida: el usuario no dio consentimiento de datos. ' +
          'Esta actividad debe quedarse solo en el dispositivo.',
      );
    }
  }
}
