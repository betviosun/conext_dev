#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v php >/dev/null 2>&1; then
  echo "PHP is not installed. Install PHP 8.1+ with curl, then run this script again."
  echo "Ubuntu/Debian: sudo apt install php-cli php-curl"
  exit 1
fi

PORT="${PORT:-4000}"
HOST="${HOST:-localhost}"

echo "CoNext API server: http://${HOST}:${PORT}"
echo "Health check:      http://${HOST}:${PORT}/health"
echo "Press Ctrl+C to stop."

exec php -S "${HOST}:${PORT}" router.php
