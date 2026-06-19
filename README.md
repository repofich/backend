# Repositorio Institucional FICH - Backend

## Requisitos

- PHP 8.2+
- Composer
- Node.js 20+
- PostgreSQL

## Instalación

```bash
# 1. Clonar el repositorio y entrar al directorio
cd backend

# 2. Copiar archivo de entorno
cp .env.example .env

# 3. Configurar la base de datos en .env
#    Editar las variables:
#    DB_CONNECTION=pgsql
#    DB_HOST=localhost
#    DB_PORT=5432
#    DB_DATABASE=repofichdb
#    DB_USERNAME=tu_usuario
#    DB_PASSWORD=tu_contraseña

# 4. Instalar dependencias de PHP
composer install

# 5. Generar clave de aplicación
php artisan key:generate

# 6. Generar clave JWT (para API)
php artisan jwt:secret

# 7. Ejecutar migraciones
php artisan migrate

# 8. Instalar dependencias de Node.js
npm install

# 9. Compilar assets del frontend (React + Tailwind)
npm run build
```

## Ejecutar

### Opción 1: Solo Laravel (producción)

```bash
php artisan serve
# http://localhost:8000
```

### Opción 2: Laravel + Vite hot-reload (desarrollo)

```bash
composer run dev
```

Esto levanta Laravel, Vite, el worker de colas y logs simultáneamente.

## Rutas

| URL | Descripción |
|---|---|
| `/` | Home (tesis, búsqueda, filtros) |
| `/login` | Iniciar sesión |
| `/register` | Registro de usuario |
| `/api/*` | API REST (JWT) para consumidores externos |

## API

La API sigue disponible para integraciones externas. Autenticación vía JWT.

| Método | Ruta | Auth |
|---|---|---|
| POST | `/api/register` | Público |
| POST | `/api/login` | Público |
| POST | `/api/logout` | JWT |
| GET | `/api/me` | JWT |
| GET | `/api/thesis` | Público |
| GET | `/api/thesis/{id}` | Público |
| POST | `/api/thesis` | JWT |
| ... | ... | ... |
