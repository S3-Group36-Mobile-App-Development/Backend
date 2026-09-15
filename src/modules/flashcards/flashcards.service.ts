import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FlashcardsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Catálogo de flashcards, opcionalmente filtrado por categoría. */
  listar(categoria?: string) {
    return this.prisma.flashcard.findMany({
      where: categoria ? { categoria } : undefined,
      orderBy: [{ categoria: 'asc' }, { id: 'asc' }],
    });
  }

  /** Lista las categorías disponibles. */
  async listarCategorias() {
    const rows = await this.prisma.flashcard.findMany({
      distinct: ['categoria'],
      select: { categoria: true },
      orderBy: { categoria: 'asc' },
    });
    return rows.map((r) => r.categoria);
  }

  /** Registra que el usuario vio una flashcard (para el tab Actividad). */
  async registrarVista(usuarioId: bigint, flashcardId: bigint) {
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id: flashcardId },
      select: { id: true },
    });
    if (!flashcard) {
      throw new NotFoundException('Flashcard no encontrada.');
    }
    return this.prisma.flashcardVista.create({
      data: { usuarioId, flashcardId },
    });
  }
}
