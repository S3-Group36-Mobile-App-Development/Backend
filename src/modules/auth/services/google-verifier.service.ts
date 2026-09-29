import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

/** Datos verificados que extraemos del ID token de Google. */
export interface GooglePerfilVerificado {
  /** Identificador estable de Google (claim "sub"). Nunca el email. */
  googleUserId: string;
  email: string;
  emailVerificado: boolean;
  nombre?: string;
  fotoUrl?: string;
}

/**
 * Valida ID tokens de Google usando la librería oficial google-auth-library.
 * No se confía en email/nombre enviados por el cliente: solo se usan los claims
 * de un token cuya firma y audiencia (client IDs) fueron verificadas contra Google.
 */
@Injectable()
export class GoogleVerifierService {
  private readonly logger = new Logger(GoogleVerifierService.name);
  private readonly client = new OAuth2Client();
  private readonly clientIds: string[];

  constructor(private readonly config: ConfigService) {
    // Acepta uno o varios client IDs (web, Android, iOS) separados por coma.
    const raw = this.config.get<string>('GOOGLE_CLIENT_IDS', '');
    this.clientIds = raw
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  }

  async verificarIdToken(idToken: string): Promise<GooglePerfilVerificado> {
    if (this.clientIds.length === 0) {
      // Configuración ausente: no podemos validar de forma segura.
      this.logger.error(
        'GOOGLE_CLIENT_IDS no está configurado; no se puede validar Google Sign-In.',
      );
      throw new ServiceUnavailableException(
        'La autenticación con Google no está configurada en el servidor.',
      );
    }

    let payload;
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientIds,
      });
      payload = ticket.getPayload();
    } catch {
      // No registramos el token en logs.
      throw new UnauthorizedException('Token de Google inválido o expirado.');
    }

    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token de Google inválido.');
    }

    if (!payload.email || payload.email_verified !== true) {
      throw new UnauthorizedException(
        'La cuenta de Google no tiene un email verificado.',
      );
    }

    return {
      googleUserId: payload.sub,
      email: payload.email,
      emailVerificado: payload.email_verified === true,
      nombre: payload.name ?? undefined,
      fotoUrl: payload.picture ?? undefined,
    };
  }
}
