#!/bin/sh
set -eu

PORT="${PORT:-8080}"

# Render nginx config with the runtime port expected by Railway.
sed "s|__PORT__|${PORT}|g" /etc/nginx/conf.d/default.conf > /tmp/default.conf
mv /tmp/default.conf /etc/nginx/conf.d/default.conf

# We no longer replace placeholders with sed at runtime because it violates KISS 
# and causes cache hashing bugs. The VITE_API_URL is safely baked in at build time.

echo "Starting Nginx..."
exec "$@"
