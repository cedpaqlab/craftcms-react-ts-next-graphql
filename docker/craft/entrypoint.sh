#!/bin/sh
set -e

cd /var/www/html

# Attendre que MySQL soit prêt
until php -r "
  \$pdo = new PDO(
    'mysql:host=${DB_SERVER};port=' . (getenv('DB_PORT') ?: 3306),
    getenv('DB_USER'),
    getenv('DB_PASSWORD')
  );
  exit(0);
" 2>/dev/null; do
  echo "En attente de MySQL..."
  sleep 2
done

# Générer clés applicatives si .env absent (Craft 5 crée .env)
if [ ! -f .env ]; then
  php craft setup/keys --interactive=0
fi

# Enregistrer les identifiants DB dans .env (Craft 5)
if ! php craft db/info 2>/dev/null; then
  php craft setup/db-creds --interactive=0 \
    --driver=mysql \
    --server="${DB_SERVER}" \
    --port="${DB_PORT:-3306}" \
    --database="${DB_DATABASE}" \
    --user="${DB_USER}" \
    --password="${DB_PASSWORD}"
fi

# Installation Craft si la base n'est pas encore migrée
if ! php craft install/check 2>/dev/null; then
  php craft install --interactive=0 \
    --email="${CRAFT_ADMIN_EMAIL:-admin@demo.local}" \
    --username="${CRAFT_ADMIN_USERNAME:-admin}" \
    --password="${CRAFT_ADMIN_PASSWORD:-Demo123!}" \
    --siteName="${CRAFT_SITE_NAME:-Headless}" \
    --siteUrl="${CRAFT_SITE_URL:-http://localhost:8080}" \
    --language="${CRAFT_LANGUAGE:-en-US}"
fi

# Droits écriture pour Apache (www-data)
chown -R www-data:www-data /var/www/html/config /var/www/html/storage /var/www/html/web/cpresources 2>/dev/null || true

exec apache2-foreground
