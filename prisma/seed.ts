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
      duracion: 192,
      patron: { inhalar: 4, sostener: 4, exhalar: 4, sostener2: 4, ciclos: 12 },
      vibra: true,
    },
    {
      titulo: 'Respiración 4-7-8',
      descripcion: 'Ideal para calmar la ansiedad y el estrés, poniendo especial énfasis en una exhalación lenta.',
      duracion: 76,
      patron: { inhalar: 4, sostener: 7, exhalar: 8, ciclos: 4 },
      vibra: true,
    },
    {
      titulo: 'Suspiro cíclico',
      descripcion: 'Respiración controlada para estar más consciente de nuestro cuerpo y ritmo de respiración.',
      duracion: 72,
      patron: { inhalar: 3, exhalar: 6, ciclos: 8 },
      vibra: true,
    },
    {
      titulo: 'Respiración de coherencia',
      descripcion:
        'Seis respiraciones por minuto para equilibrar el ritmo cardíaco.',
      duracion: 300,
      patron: { inhalar: 5, exhalar: 5, ciclos: 30},
      vibra: false,
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

  // --- Protocolos predefinidos (técnicas clínicas reconocidas) ---
  // Cada uno es esPredefinido: true y usuarioId: null. Idempotente por título.
  const protocolos: { titulo: string; pasos: string[] }[] = [
    {
      titulo: 'Grounding 5-4-3-2-1 (anclaje sensorial)',
      pasos: [
        'Siéntate o quédate quieto y respira lento una vez.',
        'Nombra 5 cosas que puedes VER a tu alrededor.',
        'Nombra 4 cosas que puedes TOCAR o sentir.',
        'Nombra 3 cosas que puedes OÍR.',
        'Nombra 2 cosas que puedes OLER.',
        'Nombra 1 cosa que puedes SABOREAR.',
        'Nota cómo tu atención volvió al presente.',
      ],
    },
    {
      titulo: 'Respiración diafragmática',
      pasos: [
        'Siéntate o recuéstate en una posición cómoda.',
        'Pon una mano en el pecho y otra en el abdomen.',
        'Inhala por la nariz 4 segundos llevando el aire al abdomen.',
        'Mantén el aire 2 segundos.',
        'Exhala lento por la boca durante 6 segundos.',
        'Repite durante 5 minutos, solo con el abdomen moviéndose.',
      ],
    },
    {
      titulo: 'Relajación muscular progresiva (Jacobson)',
      pasos: [
        'Busca un lugar tranquilo y cierra los ojos.',
        'Tensa los pies y pantorrillas 5 segundos, luego suelta.',
        'Tensa muslos y glúteos 5 segundos y relaja.',
        'Tensa abdomen y pecho 5 segundos y relaja.',
        'Cierra los puños y tensa los brazos, luego suelta.',
        'Tensa hombros, cuello y cara, y relaja.',
        'Nota la diferencia entre tensión y relajación en todo el cuerpo.',
      ],
    },
    {
      titulo: 'Técnica STOP para manejar impulsos',
      pasos: [
        'S — Detente (Stop): no actúes de inmediato.',
        'T — Toma un respiro profundo y lento.',
        'O — Observa qué sientes, piensas y qué pasa alrededor.',
        'P — Procede con intención, eligiendo la mejor respuesta.',
      ],
    },
    {
      titulo: 'Protocolo para crisis de ansiedad',
      pasos: [
        'Busca un lugar seguro y siéntate.',
        'Recuerda: una crisis de ansiedad no es peligrosa y pasará.',
        'Respira lento: inhala 4s, exhala 6s.',
        'Ancla tus pies al suelo y nombra 5 cosas que ves.',
        'Repite una frase de calma: “esto es pasajero, estoy a salvo”.',
        'Si lo necesitas, llama a tu contacto de apoyo.',
      ],
    },
    {
      titulo: 'TIPP para angustia intensa (DBT)',
      pasos: [
        'T — Temperatura: moja tu cara con agua fría unos segundos.',
        'I — Intenso ejercicio: muévete con fuerza 1-2 minutos.',
        'P — Respiración Pausada: exhalaciones más largas que las inhalaciones.',
        'P — Relajación muscular Progresiva: tensa y suelta grupos de músculos.',
      ],
    },
    {
      titulo: 'Reestructuración cognitiva (cuestionar pensamientos)',
      pasos: [
        'Identifica el pensamiento que te angustia y escríbelo.',
        '¿Qué evidencia tengo a favor de este pensamiento?',
        '¿Qué evidencia tengo en contra?',
        '¿Hay otra forma más realista de ver la situación?',
        '¿Qué le diría a un amigo en esta situación?',
        'Formula un pensamiento alternativo más equilibrado.',
      ],
    },
    {
      titulo: 'Activación conductual contra el desánimo',
      pasos: [
        'Elige una actividad pequeña y concreta para hoy.',
        'Divídela en el primer paso más fácil posible.',
        'Agenda una hora específica para hacerla.',
        'Hazla aunque no tengas ganas; la motivación llega después.',
        'Al terminar, reconoce tu logro por pequeño que sea.',
      ],
    },
    {
      titulo: 'Higiene del sueño',
      pasos: [
        'Acuéstate y levántate a la misma hora todos los días.',
        'Evita pantallas al menos 30 minutos antes de dormir.',
        'Evita cafeína y comidas pesadas por la tarde-noche.',
        'Mantén el cuarto oscuro, fresco y silencioso.',
        'Si no concilias el sueño en 20 min, levántate y haz algo tranquilo.',
        'Reserva la cama solo para dormir y descansar.',
      ],
    },
    {
      titulo: 'Pausa de autocompasión',
      pasos: [
        'Reconoce tu malestar: “este es un momento de sufrimiento”.',
        'Recuerda que el sufrimiento es parte de ser humano.',
        'Pon una mano en el pecho y siente su calidez.',
        'Date un mensaje amable: “que pueda ser amable conmigo mismo”.',
        'Respira con suavidad y permite que la tensión baje.',
      ],
    },
  ];

  for (const p of protocolos) {
    const existe = await prisma.protocolo.findFirst({
      where: { titulo: p.titulo, esPredefinido: true },
    });
    if (!existe) {
      await prisma.protocolo.create({
        data: {
          titulo: p.titulo,
          esPredefinido: true,
          usuarioId: null,
          pasos: {
            create: p.pasos.map((descripcion, i) => ({
              ordenPaso: i + 1,
              descripcion,
            })),
          },
        },
      });
    }
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
