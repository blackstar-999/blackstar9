#!/usr/bin/env bash
set -euo pipefail

echo "🚀 School Portal — Deploy"

# ── Environment check ─────────────────────────────────────────────────────────
if [ ! -f "backend/.env" ]; then
  echo "❌ backend/.env not found. Copy backend/.env.example and fill in values."
  exit 1
fi

# ── Frontend build ────────────────────────────────────────────────────────────
echo "📦 Building frontend..."
cd frontend
npm install --prefer-offline
npm run build
cd ..

echo "✅ Frontend built to frontend/dist/"

# ── Docker services up ────────────────────────────────────────────────────────
echo "🐳 Starting Docker services..."
docker compose up -d --build --remove-orphans

# ── Wait for services ─────────────────────────────────────────────────────────
echo "⏳ Waiting for PostgreSQL..."
until docker compose exec postgres pg_isready -U "${DB_USERNAME:-school_user}" -d "${DB_DATABASE:-school_portal}" > /dev/null 2>&1; do
  sleep 1
done

echo "⏳ Waiting for Redis..."
until docker compose exec redis redis-cli -a "${REDIS_PASSWORD}" ping | grep -q PONG; do
  sleep 1
done

# ── Laravel setup ─────────────────────────────────────────────────────────────
echo "🔧 Running Laravel setup..."
docker compose exec app sh -c "
  cd /var/www/html
  composer install --no-dev --optimize-autoloader --no-interaction
  php artisan key:generate --no-interaction
  php artisan migrate --force --no-interaction
  php artisan db:seed --force --no-interaction
  php artisan storage:link
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  php artisan event:cache
  php artisan reverb:install --no-interaction 2>/dev/null || true
  chmod -R 775 storage bootstrap/cache
  chown -R www-data:www-data storage bootstrap/cache
"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Application: https://yourdomain.com"
echo "📡 WebSocket:   wss://yourdomain.com/app"
echo ""
