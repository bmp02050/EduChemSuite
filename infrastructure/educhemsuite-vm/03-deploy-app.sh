#!/usr/bin/env bash
set -euo pipefail

# Phase 7: Deploy EduChemSuite on the VM
# Run this script on the EduChemSuite VM (192.168.100.2)
# Prerequisites: Docker installed (02-setup-docker.sh), user in docker group

DEPLOY_DIR="/opt/educhemsuite"
COMPOSE_URL="https://raw.githubusercontent.com/bmp02050/EduChemSuite/master/docker-compose.yml"

echo "=== Phase 7: Deploy EduChemSuite ==="

# Create deployment directory
sudo mkdir -p "$DEPLOY_DIR"
sudo chown "$USER:$USER" "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# Download docker-compose.yml
echo "Downloading docker-compose.yml..."
curl -fsSL "$COMPOSE_URL" -o docker-compose.yml

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file (you must edit this with real values)..."
    cat > .env << 'ENVEOF'
# ===== Database =====
POSTGRES_DB=educhemsuite
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME_TO_A_STRONG_PASSWORD

# ===== JWT =====
JWT_ISSUER=https://educhemsuite.ddns.net/
JWT_AUDIENCE=https://educhemsuite.ddns.net/
JWT_KEY=CHANGE_ME_TO_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS

# ===== Frontend URL (for CORS - no trailing slash) =====
FRONTEND_URL=https://educhemsuite.ddns.net

# ===== Email (optional) =====
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=
EMAIL_SMTP_PASSWORD=
EMAIL_ENABLE_SSL=true
ENVEOF

    echo ""
    echo "*** IMPORTANT: Edit $DEPLOY_DIR/.env with real values before continuing! ***"
    echo "Run: nano $DEPLOY_DIR/.env"
    echo ""
    read -p "Press Enter after editing .env to continue, or Ctrl+C to abort..."
fi

# Login to GHCR if images are private
echo ""
echo "If your images are private, run: docker login ghcr.io"
echo "(Use a GitHub PAT with read:packages scope as the password)"
echo ""
read -p "Press Enter to continue with docker compose pull..."

# Pull and start
echo "Pulling images..."
docker compose pull

echo "Starting containers..."
docker compose up -d

echo ""
echo "[OK] EduChemSuite deployed!"
echo ""
echo "Verifying..."
sleep 5
docker compose ps

echo ""
echo "Quick health checks:"
curl -sI http://localhost | head -5 || echo "UI not responding yet (may need a moment)"
echo ""
curl -s http://localhost/api/ | head -5 || echo "API not responding yet (may need a moment)"
