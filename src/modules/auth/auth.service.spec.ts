import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthProvider } from '@prisma/client';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { GoogleVerifierService } from './services/google-verifier.service';

// Prisma mock: solo los métodos que usa AuthService.
const prismaMock = () => ({
  usuario: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
  },
  usuarioAuth: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
});

const jwtMock = () => ({
  signAsync: jest.fn().mockResolvedValue('signed-token'),
  verifyAsync: jest.fn(),
});

const configMock = () => ({
  get: jest.fn((key: string, def?: unknown) => def),
});

const googleMock = () => ({
  verificarIdToken: jest.fn(),
});

const usuarioPublico = {
  id: 1n,
  email: 'ana@zenmind.app',
  nombreVisible: 'Ana',
  fotoPerfilUrl: null,
  institucionId: null,
  departamentoId: null,
  consentimientoDatos: false,
  idiomaPreferido: 'es',
  modoDaltonismoActivo: false,
  creadoEn: new Date(),
};

describe('AuthService', () => {
  let prisma: ReturnType<typeof prismaMock>;
  let jwt: ReturnType<typeof jwtMock>;
  let config: ReturnType<typeof configMock>;
  let google: ReturnType<typeof googleMock>;
  let service: AuthService;

  beforeEach(() => {
    prisma = prismaMock();
    jwt = jwtMock();
    config = configMock();
    google = googleMock();
    service = new AuthService(
      prisma as never,
      jwt as never,
      config as never,
      google as unknown as GoogleVerifierService,
    );
  });

  // 1. Registro exitoso
  it('registra un usuario nuevo y devuelve tokens sin passwordHash', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.usuario.create.mockResolvedValue({ ...usuarioPublico });

    const res = await service.register({
      email: 'ana@zenmind.app',
      password: 'claveSegura123',
      nombreVisible: 'Ana',
    });

    expect(prisma.usuario.create).toHaveBeenCalled();
    // La creación anida un método LOCAL con hash.
    const dataArg = prisma.usuario.create.mock.calls[0][0].data;
    expect(dataArg.autenticaciones.create.provider).toBe(AuthProvider.LOCAL);
    expect(typeof dataArg.autenticaciones.create.passwordHash).toBe('string');
    expect(res.accessToken).toBeDefined();
    expect(JSON.stringify(res)).not.toContain('passwordHash');
  });

  // 2. Registro con email existente
  it('rechaza registro si el email ya existe', async () => {
    prisma.usuario.findUnique.mockResolvedValue({ id: 1n });
    await expect(
      service.register({
        email: 'ana@zenmind.app',
        password: 'claveSegura123',
        nombreVisible: 'Ana',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // 3. Login correcto
  it('inicia sesión con contraseña correcta', async () => {
    const hash = await argon2.hash('claveSegura123');
    prisma.usuario.findFirst.mockResolvedValue({
      ...usuarioPublico,
      autenticaciones: [{ passwordHash: hash }],
    });

    const res = await service.login({
      email: 'ana@zenmind.app',
      password: 'claveSegura123',
    });

    expect(res.accessToken).toBeDefined();
    expect(JSON.stringify(res)).not.toContain('passwordHash');
  });

  // 4. Login con contraseña incorrecta
  it('rechaza login con contraseña incorrecta', async () => {
    const hash = await argon2.hash('otraClave123');
    prisma.usuario.findFirst.mockResolvedValue({
      ...usuarioPublico,
      autenticaciones: [{ passwordHash: hash }],
    });

    await expect(
      service.login({ email: 'ana@zenmind.app', password: 'claveSegura123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza login si el usuario no tiene método LOCAL', async () => {
    prisma.usuario.findFirst.mockResolvedValue({
      ...usuarioPublico,
      autenticaciones: [],
    });
    await expect(
      service.login({ email: 'ana@zenmind.app', password: 'claveSegura123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  // 5 & 6. Google login válido / inválido
  it('rechaza Google login con token inválido', async () => {
    google.verificarIdToken.mockRejectedValue(
      new UnauthorizedException('Token de Google inválido o expirado.'),
    );
    await expect(
      service.loginConGoogle({ idToken: 'malo' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  // 7. Google login de usuario existente (método GOOGLE ya vinculado)
  it('autentica Google de un usuario existente por providerUserId', async () => {
    google.verificarIdToken.mockResolvedValue({
      googleUserId: 'google-sub-123',
      email: 'ana@zenmind.app',
      emailVerificado: true,
    });
    prisma.usuarioAuth.findUnique.mockResolvedValue({ usuarioId: 1n });
    prisma.usuario.findFirst.mockResolvedValue({ ...usuarioPublico });

    const res = await service.loginConGoogle({ idToken: 'ok' });

    expect(prisma.usuario.create).not.toHaveBeenCalled();
    expect(prisma.usuarioAuth.create).not.toHaveBeenCalled();
    expect(res.accessToken).toBeDefined();
    expect(JSON.stringify(res)).not.toContain('passwordHash');
  });

  // 8a. Google login de usuario nuevo (no existe email) → crea User + auth
  it('crea un usuario nuevo en el primer Google login', async () => {
    google.verificarIdToken.mockResolvedValue({
      googleUserId: 'google-sub-999',
      email: 'nuevo@zenmind.app',
      emailVerificado: true,
      nombre: 'Nuevo',
      fotoUrl: 'https://x/y.png',
    });
    prisma.usuarioAuth.findUnique.mockResolvedValue(null);
    prisma.usuario.findFirst.mockResolvedValue(null);
    prisma.usuario.create.mockResolvedValue({ id: 2n });
    prisma.usuario.findUniqueOrThrow.mockResolvedValue({
      ...usuarioPublico,
      id: 2n,
      email: 'nuevo@zenmind.app',
    });

    const res = await service.loginConGoogle({ idToken: 'ok' });

    expect(prisma.usuario.create).toHaveBeenCalled();
    const dataArg = prisma.usuario.create.mock.calls[0][0].data;
    expect(dataArg.autenticaciones.create.provider).toBe(AuthProvider.GOOGLE);
    expect(dataArg.autenticaciones.create.providerUserId).toBe(
      'google-sub-999',
    );
    expect(dataArg.autenticaciones.create.passwordHash).toBeUndefined();
    expect(res.accessToken).toBeDefined();
  });

  // 8b. Google login de usuario existente por email → vincula método GOOGLE
  it('vincula Google a un usuario existente con el mismo email verificado', async () => {
    google.verificarIdToken.mockResolvedValue({
      googleUserId: 'google-sub-777',
      email: 'ana@zenmind.app',
      emailVerificado: true,
    });
    prisma.usuarioAuth.findUnique.mockResolvedValue(null);
    prisma.usuario.findFirst.mockResolvedValue({ id: 1n });
    prisma.usuario.findUniqueOrThrow.mockResolvedValue({ ...usuarioPublico });

    const res = await service.loginConGoogle({ idToken: 'ok' });

    expect(prisma.usuarioAuth.create).toHaveBeenCalledWith({
      data: {
        usuarioId: 1n,
        provider: AuthProvider.GOOGLE,
        providerUserId: 'google-sub-777',
      },
    });
    expect(prisma.usuario.create).not.toHaveBeenCalled();
    expect(res.accessToken).toBeDefined();
  });
});
