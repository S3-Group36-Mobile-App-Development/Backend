import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // --- Estados de ánimo (check-in diario) ---
  const estados = [
    { nombre: 'Feliz', orden: 1 },
    { nombre: 'Tranquilo', orden: 2 },
    { nombre: 'Ansioso', orden: 3 },
    { nombre: 'Triste', orden: 4 },
    { nombre: 'Estresado', orden: 5 },
  ];
  for (const e of estados) {
    const existe = await prisma.estadoAnimo.findFirst({
      where: { nombre: e.nombre },
    });
    if (!existe) {
      await prisma.estadoAnimo.create({ data: e });
    }
  }

  // --- Líneas de emergencia (catálogo fijo) ---
  const lineas = [
    {
      nombre: 'Línea de Prevención del Suicidio (EE. UU.)',
      telefono: '988',
      pais: 'US',
      descripcion: '988 Suicide and Crisis Lifeline.',
    },
    {
      nombre: 'Emergencias generales',
      telefono: '911',
      pais: 'US',
      descripcion: 'Emergencias médicas y de seguridad.',
    },
  ];
  for (const l of lineas) {
    const existe = await prisma.lineaEmergencia.findFirst({
      where: { nombre: l.nombre },
    });
    if (!existe) {
      await prisma.lineaEmergencia.create({ data: l });
    }
  }

  // --- Ejercicios de respiración ---
  const ejercicios = [
    {
      titulo: 'Respiración de caja',
      descripcion: 'Inhala, sostén, exhala y sostén en partes iguales.',
      duracionSegundos: 120,
      patron: { inhalar: 4, sostener: 4, exhalar: 4, sostener2: 4, ciclos: 6 },
      vibra: true,
    },
    {
      titulo: 'Respiración 4-7-8',
      descripcion: 'Ideal para calmar la ansiedad antes de dormir.',
      duracionSegundos: 114,
      patron: { inhalar: 4, sostener: 7, exhalar: 8, ciclos: 6 },
      vibra: true,
    },
  ];
  for (const ej of ejercicios) {
    const existe = await prisma.ejercicioRespiracion.findFirst({
      where: { titulo: ej.titulo },
    });
    if (!existe) {
      await prisma.ejercicioRespiracion.create({ data: ej });
    }
  }

  // --- Flashcards ---
  const flashcards = [
    {
      categoria: 'Ansiedad',
      titulo: 'Técnica 5-4-3-2-1',
      contenido:
        'Nombra 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles y 1 que saboreas.',
    },
    {
      categoria: 'Estrés',
      titulo: 'Pausa consciente',
      contenido: 'Detente 60 segundos y enfócate solo en tu respiración.',
    },
  ];
  for (const f of flashcards) {
    const existe = await prisma.flashcard.findFirst({
      where: { titulo: f.titulo },
    });
    if (!existe) {
      await prisma.flashcard.create({ data: f });
    }
  }

  // --- Juegos ---
  const juegos = [
    { nombre: 'Burbujas de calma', tipo: 'relajación', descripcion: 'Revienta burbujas a tu ritmo.' },
    { nombre: 'Jardín zen', tipo: 'relajación', descripcion: 'Dibuja patrones en la arena.' },
  ];
  for (const j of juegos) {
    const existe = await prisma.juego.findFirst({ where: { nombre: j.nombre } });
    if (!existe) {
      await prisma.juego.create({ data: j });
    }
  }

  // --- Audios predefinidos ---
  const audios = [
    {
      titulo: 'Lluvia suave',
      url: 'https://cdn.zenmind.app/audios/lluvia.mp3',
      duracionSegundos: 600,
    },
    {
      titulo: 'Meditación guiada 10 min',
      url: 'https://cdn.zenmind.app/audios/meditacion10.mp3',
      duracionSegundos: 600,
    },
  ];
  for (const a of audios) {
    const existe = await prisma.audio.findFirst({ where: { titulo: a.titulo } });
    if (!existe) {
      await prisma.audio.create({ data: a });
    }
  }

  // --- Protocolo predefinido con pasos ---
  const protocoloExiste = await prisma.protocolo.findFirst({
    where: { titulo: 'Protocolo para crisis de ansiedad', esPredefinido: true },
  });
  if (!protocoloExiste) {
    await prisma.protocolo.create({
      data: {
        titulo: 'Protocolo para crisis de ansiedad',
        esPredefinido: true,
        usuarioId: null,
        pasos: {
          create: [
            { ordenPaso: 1, descripcion: 'Busca un lugar seguro y siéntate.' },
            { ordenPaso: 2, descripcion: 'Respira lento: inhala 4s, exhala 6s.' },
            { ordenPaso: 3, descripcion: 'Nombra 5 cosas que puedes ver a tu alrededor.' },
            { ordenPaso: 4, descripcion: 'Si lo necesitas, llama a tu contacto de apoyo.' },
          ],
        },
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed completado.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
