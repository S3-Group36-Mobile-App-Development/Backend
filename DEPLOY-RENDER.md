# Desplegar ZenMind en Render (gratis, 24/7)

Esta guía deja el backend accesible desde internet con HTTPS y dominio propio,
usando el plan **gratuito** de Render. El repositorio ya incluye todo lo necesario:

- `render.yaml` — Blueprint que crea el servicio web + la base de datos PostgreSQL.
- `Dockerfile` + `docker-entrypoint.sh` — construyen la imagen y, al arrancar,
  aplican migraciones (`prisma migrate deploy`), siembran catálogos y lanzan la API.
- `/api/v1/health` — endpoint público usado por Render como healthcheck.

---

## Requisitos previos

1. El código debe estar en GitHub (ya lo está:
   `github.com/S3-Group36-Mobile-App-Development/Backend`).
2. Una cuenta gratuita en Render: https://render.com (regístrate con GitHub).

---

## Pasos

### 1. Sube los cambios a GitHub

```bash
git add render.yaml Dockerfile docker-entrypoint.sh src/health.controller.ts src/app.module.ts DEPLOY-RENDER.md
git commit -m "Configura despliegue en Render (Blueprint + healthcheck)"
git push origin main
```

### 2. Crea el Blueprint en Render

1. Entra a https://dashboard.render.com
2. Clic en **New +** → **Blueprint**.
3. Conecta y selecciona el repositorio `Backend`.
4. Render detectará el archivo `render.yaml` y mostrará los dos recursos que va a crear:
   - `zenmind-api` (servicio web, Docker, free)
   - `zenmind-db` (PostgreSQL, free)
5. Te pedirá el valor de `GOOGLE_CLIENT_IDS` (marcado como secreto).
   - Si usas Google Sign-In, pega tus client IDs separados por coma.
   - Si aún no lo usas, deja el campo vacío.
6. Clic en **Apply**. Render construye la imagen y despliega. La primera vez
   tarda unos minutos (build de Docker + migraciones + seed).

### 3. Verifica que está online

Cuando el servicio quede en estado **Live**, tu URL será algo como:

```
https://zenmind-api.onrender.com
```

Prueba estos endpoints (desde el navegador o `curl`):

```bash
# Healthcheck
curl https://zenmind-api.onrender.com/api/v1/health

# Documentación Swagger (en el navegador)
https://zenmind-api.onrender.com/api/docs

# Un catálogo público
curl https://zenmind-api.onrender.com/api/v1/apoyo/lineas-emergencia
```

### 4. Apunta tus apps (Flutter / Kotlin) a la nueva URL

Cambia la `baseUrl` de cada app a:

```
https://zenmind-api.onrender.com/api/v1
```

---

## Limitaciones del plan gratuito (importante)

- **Sleep tras inactividad:** el servicio web se duerme después de ~15 minutos sin
  tráfico. El primer request tras dormir tarda ~30-50 s en responder (cold start).
  Los siguientes son normales.
- **La base de datos gratis expira a los ~30 días.** Render te avisa por correo.
  Cuando expire tendrás que crear una nueva DB y actualizar `DATABASE_URL`
  (o recrear el Blueprint). Los datos de la DB anterior se pierden, pero el seed
  vuelve a poblar los catálogos base automáticamente al arrancar.
- **Recursos limitados:** 512 MB RAM en el web y una DB pequeña. Suficiente para
  desarrollo y demos, no para producción con carga real.

### Evitar el cold start (opcional)

Un truco común es hacer ping periódico al healthcheck (por ejemplo con un
cron externo gratuito como cron-job.org o UptimeRobot) cada 10 minutos a
`https://zenmind-api.onrender.com/api/v1/health`. Ojo: consume las 750 horas/mes
del plan free, que igual alcanzan para un único servicio siempre encendido.

---

## Actualizaciones futuras

Con `autoDeploy: true` (ya configurado), cada `git push` a `main` vuelve a
desplegar automáticamente. Las migraciones nuevas se aplican solas al arrancar,
porque el `docker-entrypoint.sh` corre `prisma migrate deploy` en cada inicio.

---

## Solución de problemas

- **El deploy falla en migraciones:** revisa los logs del servicio en Render.
  Verifica que `DATABASE_URL` esté enlazada a `zenmind-db` (lo hace `render.yaml`
  vía `fromDatabase`).
- **502 / la app no levanta:** confirma que el servicio escucha en `0.0.0.0` y en
  el puerto de `$PORT`. `main.ts` ya usa `app.listen(port, '0.0.0.0')` y lee `PORT`.
- **Swagger no carga:** está en `/api/docs` (sin versión), no en `/api/v1/docs`.
