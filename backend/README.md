# Backend Micheladas (Python + MySQL)

API de autenticación con JWT y roles: **admin**, **mesero**, **cocinero** (preparación de bebidas / barra).

## Requisitos

- Python 3.11+
- MySQL 8+

## Instalación

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
copy .env.example .env
```

Edita `.env` con tus credenciales de MySQL.

## Base de datos

```bash
python -m scripts.init_db
python -m scripts.seed_users
python -m scripts.seed_menu
python -m scripts.migrate_pasos
python -m scripts.migrate_pos
python -m scripts.migrate_inventario
python -m scripts.migrate_inventario_vinculo
python -m scripts.migrate_adiciones_porcion
python -m scripts.migrate_caja
```

(O con cliente MySQL: `mysql -u root < database/schema.sql`)

Conexión: `localhost` · base `michelada` · usuario `root` · sin contraseña (`backend/.env`).

## Ejecutar API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Documentación interactiva: http://localhost:8000/docs

## Usuarios de prueba

| Rol      | Email                      | Contraseña  |
|----------|----------------------------|-------------|
| admin    | admin@micheladas.local     | admin123    |
| mesero   | mesero@micheladas.local    | mesero123   |
| cocinero | cocinero@micheladas.local  | cocinero123 |

## Endpoints

- `POST /api/auth/login` — `{ "email", "password" }`
- `GET /api/auth/me` — header `Authorization: Bearer <token>`
- `GET /api/health` — estado del servidor
- `GET /api/inventario` — listado de stock (personal autenticado)
- `PATCH /api/inventario/{clave}` — ajustar stock (solo admin)
- `POST /api/inventario/reset` — restaurar stock inicial (solo admin)

Al crear una comanda (`POST /api/comandas`), el inventario se descuenta automáticamente según el producto, las fases y las adiciones.

## Tests

```bash
# Backend (requiere MySQL + seed_users + seed_menu)
pip install -r requirements-dev.txt
python -m pytest -v

# Frontend (unitarios, sin BD)
cd ..
npm install
npm run test
```

Desde la raíz del proyecto: `npm run test` (frontend) y `npm run test:backend` (API).

## Producción (Vercel + MySQL Hostinger)

El frontend (TanStack/Nitro) y el API Python (`api/index.py`) se despliegan juntos.
El build ejecuta `postbuild` que empaqueta la función en `.vercel/output/functions/api/index.func`.

### Variables en Vercel → Settings → Environment Variables

| Variable | Ejemplo |
|----------|---------|
| `MYSQL_HOST` | `srv123.hstgr.io` (hostname de Hostinger, no solo la IP) |
| `MYSQL_PORT` | `3306` |
| `MYSQL_USER` | usuario BD |
| `MYSQL_PASSWORD` | contraseña |
| `MYSQL_DATABASE` | `u659323332_micheladas` |
| `JWT_SECRET` | secreto largo (32+ caracteres) |
| `APP_ENV` | `production` |
| `CORS_ORIGINS` | `https://micheladas-black.vercel.app` |

`VITE_API_URL` puede quedar **vacío** en Vercel (el frontend usa el mismo dominio `/api/...`).

### MySQL desde Vercel (error 2003 / timeout)

Si en los logs aparece `Can't connect to MySQL server on '...:3306' (110)`:

1. En **Hostinger → Bases de datos → MySQL remoto**, activa acceso remoto y añade el host `%` (cualquier IP) o las IPs de salida de Vercel si tienes plan con IP fija.
2. Usa el **hostname MySQL** que muestra Hostinger (p. ej. `srvXXX.hstgr.io`), no la IP del servidor web.
3. Comprueba que el usuario tenga permisos sobre la base `u659323332_micheladas`.
4. En hosting compartido, MySQL remoto a veces **no está permitido** hacia Vercel. Alternativas: API en el mismo Hostinger, VPS, o BD en la nube (PlanetScale, Railway, etc.).

Diagnóstico: `GET https://micheladas-black.vercel.app/api/status` (muestra si la BD responde).

Tras cambios en `vercel.json`, variables de entorno o `api/`, haz **Redeploy** en Vercel.

Para servidor propio (no Vercel):

1. Copia `backend/.env.production.example` → `backend/.env`
2. Genera `JWT_SECRET` seguro:
   ```bash
   python -c "from app.config import generate_jwt_secret; print(generate_jwt_secret())"
   ```
3. Define `APP_ENV=production` — la API **no arranca** si `JWT_SECRET` es débil o `CORS_ORIGINS` está vacío.
4. Health check: `GET /api/health` devuelve `200` solo si MySQL responde; si la BD falla, `503` con `"database": "error"`.

## Respaldos MySQL

```bash
cd backend
python -m scripts.backup_db
python -m scripts.backup_db --output ./backups --keep 14
```

Requiere `mysqldump` en PATH. Los archivos se guardan en `backend/backups/` (`.sql.gz` por defecto). Programa la tarea diaria con el Programador de tareas de Windows o cron en Linux (ver docstring en `scripts/backup_db.py`).
