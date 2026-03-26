#!/bin/sh
set -eu

PORT="${PORT:-8080}"
BACKEND_URL="${BACKEND_URL:-http://host.docker.internal:8000}"
CLIENT_API_URL="${CLIENT_API_URL:-/api}"

# Render nginx config with the runtime port expected by Railway.
sed -e "s|__PORT__|${PORT}|g" -e "s|__BACKEND_URL__|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf > /tmp/default.conf
mv /tmp/default.conf /etc/nginx/conf.d/default.conf

echo "Injecting VITE_API_URL into built JS files..."
find /usr/share/nginx/html -name "*.js" | while read -r file; do
  sed -i "s|__VITE_API_URL_PLACEHOLDER__|${CLIENT_API_URL}|g" "$file"
done
echo "Injection complete."

echo "Starting Nginx..."
exec "$@"
