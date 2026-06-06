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
