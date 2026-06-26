# School Portal

Production-grade school management portal built with Laravel 12 + React + TypeScript.

## Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.4, Laravel 12 |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| WebSockets | Laravel Reverb |
| Frontend | React 18, TypeScript, TailwindCSS, Vite |
| Deployment | Docker, Nginx, Supervisor |

## User Roles

| Role | Access |
|---|---|
| Guest | Public website only |
| Student | Portal, Chat, Gallery, Library, Certificates |
| Teacher | Portal + Certificate upload |
| Librarian | Portal + Library file management |
| Admin | Full content management, User management, Gallery moderation |
| Vice Principal | Admin access + Schedule editing |
| SuperAdmin | Full system control via hidden route |

## Quick Start

```bash
# 1. Clone and enter
cd school-portal

# 2. Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env: set DB_PASSWORD, REDIS_PASSWORD, TELEGRAM_BOT_TOKEN, REVERB keys

# 3. Generate SSL cert (for development)
./generate-ssl.sh

# 4. Deploy
./deploy.sh
```

## Development

```bash
# Backend only
cd backend
composer install
php artisan serve

# Frontend only
cd frontend
npm install
npm run dev
```

## Architecture

```
school-portal/
├── backend/                    # Laravel 12 application
│   ├── app/
│   │   ├── DTOs/              # Readonly data transfer objects
│   │   ├── Enums/             # PHP 8.4 backed enums
│   │   ├── Events/            # Broadcast events (Reverb)
│   │   ├── Exceptions/        # Domain exceptions
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/   # Route controllers
│   │   │   ├── Middleware/           # Custom middleware
│   │   │   ├── Requests/             # Form request validation
│   │   │   └── Resources/            # API response transformers
│   │   ├── Jobs/              # Queue jobs (media processing, Telegram)
│   │   ├── Models/            # Eloquent models
│   │   ├── Notifications/     # Laravel notifications
│   │   ├── Policies/          # Authorization policies
│   │   ├── Providers/         # Service providers + RBAC
│   │   ├── Repositories/      # Repository pattern (contracts + Eloquent)
│   │   └── Services/          # Business logic services
│   ├── database/
│   │   ├── migrations/        # 17 migrations
│   │   ├── factories/         # Model factories
│   │   └── seeders/           # Production-ready seeders
│   ├── routes/
│   │   ├── api.php            # All API routes with middleware
│   │   └── channels.php       # WebSocket channel authorization
│   └── tests/Feature/         # Feature tests
├── frontend/                  # React + TypeScript SPA (PWA)
│   └── src/
│       ├── api/               # Typed Axios API clients
│       ├── components/        # Reusable UI + feature components
│       ├── hooks/             # Custom hooks (Echo WebSocket, auth)
│       ├── pages/             # Route pages (public / portal / admin / superadmin)
│       ├── stores/            # Zustand state (auth, chat)
│       └── types/             # Shared TypeScript types
└── docker/
    ├── nginx/                 # Nginx config (rate limiting, WebSocket proxy)
    ├── php/                   # PHP-FPM Dockerfile + config
    └── supervisor/            # Queue worker + scheduler
```

## Key Features

- **Real-time chat** via Laravel Reverb WebSockets with read receipts, edit/delete, emoji, file attachments (15MB)
- **Gallery** with masonry layout, fullscreen Instagram-style viewer, like system, admin moderation queue
- **Library** with full-text search, autocomplete, class/subject filters, external file opening (50MB)
- **Certificates** with like system, level badges (School→International), sortable by likes
- **Schedule builder** with weekly timetable, per-date overrides, admin/vice-principal editing
- **Telegram OTP** verification — users must verify Telegram account before portal access
- **Hidden SuperAdmin route** — configurable via `SUPERADMIN_PATH` env variable
- **Audit logging** — every mutating action logged with actor, IP, diff
- **RBAC** via Laravel Policies + Gate with SuperAdmin bypass
- **PWA** — installable on mobile with offline caching for public pages

## API

All endpoints under `/api/v1/`. See `routes/api.php` for the full route map.

Authentication: Laravel Sanctum SPA cookies (CSRF + session-based).

## Storage Limits

| Type | Limit |
|---|---|
| Gallery images | 5 MB |
| Chat attachments | 15 MB |
| Library files | 50 MB |
| Certificate images | 5 MB |
| Avatars | 2 MB |

## Environment Variables

See `backend/.env.example` for all required variables. Key ones:

- `SUPERADMIN_PATH` — hidden SuperAdmin login URL segment (change from default!)
- `TELEGRAM_BOT_TOKEN` — your Telegram bot token
- `REVERB_APP_KEY/SECRET` — Laravel Reverb WebSocket credentials
- `DB_PASSWORD`, `REDIS_PASSWORD` — database credentials
