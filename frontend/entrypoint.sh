#!/bin/sh
set -eu

PORT="${PORT:-8080}"

# Render nginx config with the runtime port expected by Railway.
sed "s|__PORT__|${PORT}|g" /etc/nginx/conf.d/default.conf > /tmp/default.conf
mv /tmp/default.conf /etc/nginx/conf.d/default.conf

# Replace the build-time placeholder with the actual VITE_API_URL provided
# as a Railway environment variable at runtime.
if [ -z "${VITE_API_URL:-}" ]; then
  echo "WARNING: VITE_API_URL is not set. API calls may fail."
else
  echo "Injecting VITE_API_URL into built JS files..."
  find /usr/share/nginx/html -name "*.js" | while read -r file; do
    sed -i "s|__VITE_API_URL_PLACEHOLDER__|${VITE_API_URL}|g" "$file"
  done
  echo "Injection complete."
fi

echo "Starting Nginx..."
exec "$@"
