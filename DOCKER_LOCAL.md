# Docker local

## Levantar el frontend

1. Copia el archivo de ejemplo:

```bash
cp .env.docker.example .env
```

2. Si tu backend corre en otro puerto o URL, ajusta `VITE_API_URL` en `.env`.
   Para este backend, la URL correcta es `http://host.docker.internal:8000` y no `.../api`.

3. Levanta la app:

```bash
docker compose up --build
```

4. Abre:

```text
http://localhost:8080
```

## Variables

- `FRONTEND_PORT`: puerto local donde expones el frontend.
- `VITE_API_URL`: URL del backend.
- `VITE_ENABLE_NUTRITION`: activa el módulo de nutrición.
- `VITE_ENABLE_DEMO_AUTH`: activa acceso demo local. En Docker local queda habilitado con `admin / admin`.

## Notas

- El contenedor usa `Dockerfile` de la raíz.
- El frontend corre en Nginx dentro del contenedor, puerto interno `80`.
- En Mac y Docker Desktop, `host.docker.internal` apunta a tu máquina local.
- Si no tienes backend levantado o falla el auth, puedes entrar en Docker local con `admin / admin`.
