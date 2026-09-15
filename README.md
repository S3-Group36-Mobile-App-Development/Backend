# ZenMind — Backend

API REST compartida de **ZenMind**. Es el backend único que alimenta las dos apps cliente:
la app nativa en **Kotlin** y la app en **Flutter**. Ningún cliente habla directamente con la
base de datos: ambos consumen esta misma API.

- **Framework:** NestJS 10 + TypeScript
- **Base de datos:** PostgreSQL 16
- **ORM / migraciones:** Prisma 5
- **Auth:** JWT (access + refresh), contraseñas con Argon2
- **Docs:** OpenAPI / Swagger
- **API versionada:** prefijo `/api` + versión en la URI (`/api/v1/...`)

---

## Requisitos

- Node.js 20+ y npm
- Docker + Docker Compose (opción recomendada), **o** un PostgreSQL 16 local

---

## Puesta en marcha rápida (con Docker)

Levanta PostgreSQL + la API, corre migraciones y siembra los catálogos automáticamente:

```bash
cp .env.example .env
docker compose up --build
```

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

---

## Puesta en marcha en local (sin Docker)

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia las variables de entorno y ajusta `DATABASE_URL` si hace falta:

   ```bash
   cp .env.example .env
   ```

3. Asegúrate de tener un PostgreSQL corriendo con la base y el usuario del `.env`
   (por defecto `zenmind` / `zenmind`).

4. Genera el cliente Prisma, aplica migraciones y siembra catálogos:

   ```bash
   npm run prisma:generate
   npm run prisma:deploy   # aplica prisma/migrations
   npm run db:seed         # catálogos: estados de ánimo, líneas, ejercicios, etc.
   ```

5. Arranca la API:

   ```bash
   npm run start:dev
   ```

---

## Scripts útiles

| Script | Descripción |
|---|---|
| `npm run start:dev` | API en modo watch |
| `npm run build` | Compila a `dist/` |
| `npm run prisma:generate` | Genera el cliente Prisma |
| `npm run prisma:migrate` | Crea/aplica migraciones en desarrollo |
| `npm run prisma:deploy` | Aplica migraciones (producción/CI) |
| `npm run db:seed` | Siembra los catálogos base |
| `npm run prisma:studio` | Explora la BD con Prisma Studio |

---

## Estructura

```
prisma/
  schema.prisma          # Modelo de datos (refleja el diseño del equipo)
  migrations/            # Migración inicial + objetos SQL especiales
  seed.ts                # Catálogos base
src/
  main.ts                # Bootstrap, Swagger, versionado, validación global
  app.module.ts          # Módulo raíz
  prisma/                # PrismaService/Module
  common/                # Decoradores (@Public, @CurrentUser) y consentimiento
  modules/
    auth/                # Registro, login, refresh (JWT + Argon2)
    usuarios/            # Perfil, racha, institución, borrado de cuenta
    checkin/             # Estados de ánimo + check-in diario
    panico/              # Contactos personales + eventos de pánico
    respira/             # Ejercicios y sesiones de respiración
    apoyo/               # Líneas de emergencia
    protocolos/          # Protocolos, pasos y vistas
    flashcards/          # Flashcards y vistas
    juegos/              # Juegos y sesiones
    audios/              # Audios y reproducciones
    actividad/           # Tab Actividad (vista unificada)
    telemetria/          # Eventos de telemetría de la app
    instituciones/       # Instituciones, departamentos y analítica agregada
```

---

## Autenticación

1. `POST /api/v1/auth/register` o `POST /api/v1/auth/login` devuelven `accessToken` y `refreshToken`.
2. Envía el access token en cada request protegida:
   `Authorization: Bearer <accessToken>`.
3. Cuando expire, renuévalo con `POST /api/v1/auth/refresh`.

Los endpoints de catálogo (estados de ánimo, ejercicios, flashcards, juegos, audios,
líneas de emergencia, listado de instituciones) son públicos. El resto requiere token.

---

## Mapa de pantallas → endpoints

| Pantalla / función | Endpoints principales |
|---|---|
| Check-in diario | `GET /estados-animo`, `POST /chequeos`, `GET /chequeos` |
| Botón de Pánico | `.../contactos`, `POST /panico/eventos`, `PATCH /panico/eventos/:id/conectar` |
| Respira | `GET /respira/ejercicios`, `POST /respira/sesiones` |
| Apoyo | `GET /apoyo/lineas-emergencia`, `.../contactos` |
| Protocolos | `GET /protocolos`, `POST /protocolos`, `POST /protocolos/:id/vistas` |
| Flashcards | `GET /flashcards`, `POST /flashcards/:id/vistas` |
| Juegos | `GET /juegos`, `POST /juegos/sesiones` |
| Audios | `GET /audios`, `POST /audios/reproducciones` |
| Tab Actividad | `GET /actividad` |
| Tab Perfil | `GET /usuarios/me` |
| Analítica institucional | `GET /instituciones/analitica/resumen-departamento` |

(Todos con prefijo `/api/v1`.)

---

## Reglas de privacidad implementadas

- **Consentimiento:** si `usuarios.consentimiento_datos = false`, el backend **rechaza**
  sincronizar actividad (check-ins, sesiones de respiración, juegos, reproducciones de audio)
  con `403 Forbidden`. Esos datos deben quedarse solo en el dispositivo.
- **Borrado de cuenta:** `DELETE /usuarios/me` elimina el usuario y, en cascada, toda su
  actividad. La analítica agregada por departamento no se ve afectada porque nunca guarda
  IDs de usuario.
- **k-anonimidad:** `resumen_actividad_departamento` solo expone grupos con al menos 5
  usuarios distintos, para que ningún individuo sea identificable.
- **Audios locales:** las reproducciones de audios propios se registran con `audio_id = NULL`
  y solo el `titulo_local`; el archivo nunca se sincroniza.

---

## Objetos especiales de base de datos

Además de las tablas, la migración inicial crea (vía SQL, en `prisma/migrations`):

- `idx_un_chequeo_por_dia` — un único check-in por usuario y día (día calendario UTC).
- `idx_un_contacto_panico` — un único contacto de pánico por usuario.
- `eventos_panico.tiempo_respuesta_ms` — columna generada (tiempo entre activación y conexión).
- `vista_actividad_usuario` — vista que unifica toda la actividad para el tab Actividad.
- `resumen_actividad_departamento` — vista materializada con la analítica institucional.
  Se refresca con `POST /api/v1/instituciones/analitica/refrescar`.
