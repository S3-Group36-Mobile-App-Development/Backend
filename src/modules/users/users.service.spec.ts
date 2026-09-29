import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

const prismaMock = () => ({
  usuario: {
    findFirst: jest.fn(),
  },
});

describe('UsersService', () => {
  let prisma: ReturnType<typeof prismaMock>;
  let service: UsersService;

  beforeEach(() => {
    prisma = prismaMock();
    service = new UsersService(prisma as never);
  });

  // 9. GET /users/me con usuario válido
  it('devuelve el usuario actual sin credenciales', async () => {
    prisma.usuario.findFirst.mockResolvedValue({
      id: 1n,
      email: 'ana@zenmind.app',
      nombreVisible: 'Ana',
      fotoPerfilUrl: null,
      institucionId: null,
      departamentoId: null,
      consentimientoDatos: true,
      idiomaPreferido: 'es',
      modoDaltonismoActivo: false,
      creadoEn: new Date(),
    });

    const res = await service.obtenerActual(1n);

    // 11. Nunca expone passwordHash.
    expect(JSON.stringify(res)).not.toContain('passwordHash');
    expect(res.email).toBe('ana@zenmind.app');
    // Verifica que el select no pide credenciales.
    const selectArg = prisma.usuario.findFirst.mock.calls[0][0].select;
    expect(selectArg).not.toHaveProperty('passwordHash');
    expect(selectArg).not.toHaveProperty('autenticaciones');
  });

  it('lanza NotFound si el usuario no existe o fue eliminado', async () => {
    prisma.usuario.findFirst.mockResolvedValue(null);
    await expect(service.obtenerActual(99n)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
