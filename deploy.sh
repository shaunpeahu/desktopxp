#!/usr/bin/env bash
set -e

APP_NAME="xp-portfolio"
PORT=8080
PROJECT_DIR="$(pwd)"

echo "==> Deploying $APP_NAME from $PROJECT_DIR"

# Ensure we're in the right place
if [ ! -f "package.json" ]; then
  echo "ERROR: package.json not found. Run this from the project root."
  exit 1
fi

echo "==> Stopping existing container (if any)"
docker rm -f "$APP_NAME" 2>/dev/null || true

echo "==> Building site (npm install + build)"
docker run --rm -it \
  --user $(id -u):$(id -g) \
  -v "$PROJECT_DIR:/app" -w /app \
  node:20-alpine sh -lc 'npm install && npm run build'

if [ ! -d "dist" ]; then
  echo "ERROR: dist/ not found after build"
  exit 1
fi

echo "==> Starting nginx container on port $PORT"
docker run --rm -d \
  --name "$APP_NAME" \
  -p "$PORT:80" \
  -v "$PROJECT_DIR/dist:/usr/share/nginx/html:ro" \
  nginx:alpine

echo "==> Done!"
echo "   Local: http://localhost:$PORT"
echo "   LAN  : http://192.168.0.174:$PORT"
