#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGE_TAG="${1:-latest}"
SLOT_FILE="$DEPLOY_DIR/.active-slot"
ENV_FILE="$DEPLOY_DIR/.env"

# Read current active slot
if [[ -f "$SLOT_FILE" ]]; then
    ACTIVE_SLOT=$(cat "$SLOT_FILE")
else
    ACTIVE_SLOT="none"
fi

# Determine target slot and ports
if [[ "$ACTIVE_SLOT" == "blue" ]]; then
    TARGET="green"
    TARGET_UI_PORT=8200
    TARGET_API_PORT=8201
else
    TARGET="blue"
    TARGET_UI_PORT=8100
    TARGET_API_PORT=8101
fi

echo "=== Blue-Green Deploy ==="
echo "Active slot: $ACTIVE_SLOT"
echo "Target slot: $TARGET"
echo "Image tag:   $IMAGE_TAG"
echo ""

# 1. Ensure infra is running
echo "--- Starting infrastructure ---"
docker compose \
    -f "$DEPLOY_DIR/docker-compose.infra.yml" \
    --project-name infra \
    --env-file "$ENV_FILE" \
    up -d

# Wait for postgres to be healthy
echo "--- Waiting for postgres ---"
for i in $(seq 1 30); do
    if docker exec infra-postgres-1 pg_isready -U "$(grep POSTGRES_USER "$ENV_FILE" | cut -d= -f2)" >/dev/null 2>&1; then
        echo "Postgres ready."
        break
    fi
    if [[ $i -eq 30 ]]; then
        echo "ERROR: Postgres did not become ready in time."
        exit 1
    fi
    sleep 2
done

# 2. Pull new images
echo "--- Pulling images ---"
docker pull "ghcr.io/bmp02050/educhemsuite/api:$IMAGE_TAG"
docker pull "ghcr.io/bmp02050/educhemsuite/ui:$IMAGE_TAG"

# 3. Run migrations (one-off container)
echo "--- Running migrations ---"
# Read DB vars safely from .env (handles values with spaces)
get_env() { grep "^$1=" "$ENV_FILE" | cut -d= -f2-; }
PG_USER="$(get_env POSTGRES_USER)"
PG_PASS="$(get_env POSTGRES_PASSWORD)"
PG_DB="$(get_env POSTGRES_DB)"

docker run --rm \
    --network educhemsuite \
    -e "ConnectionStrings__dev=host=postgres;Username=${PG_USER};Password=${PG_PASS};Database=${PG_DB};Port=5432;" \
    "ghcr.io/bmp02050/educhemsuite/api:$IMAGE_TAG" \
    --migrate-only

echo "Migrations applied."

# 4. Start target slot
echo "--- Starting $TARGET slot ---"
export UI_PORT=$TARGET_UI_PORT
export API_PORT=$TARGET_API_PORT
export IMAGE_TAG=$IMAGE_TAG
docker compose \
    -f "$DEPLOY_DIR/docker-compose.app.yml" \
    --project-name "$TARGET" \
    --env-file "$ENV_FILE" \
    up -d

# 5. Wait for health check
echo "--- Waiting for $TARGET health check ---"
HEALTHY=false
for i in $(seq 1 60); do
    if curl -sf "http://127.0.0.1:$TARGET_API_PORT/health/ready" >/dev/null 2>&1; then
        HEALTHY=true
        echo "Health check passed after ${i}s."
        break
    fi
    sleep 1
done

if [[ "$HEALTHY" != "true" ]]; then
    echo "ERROR: $TARGET slot failed health check. Rolling back..."
    docker compose \
        -f "$DEPLOY_DIR/docker-compose.app.yml" \
        --project-name "$TARGET" \
        down --remove-orphans
    echo "Target slot torn down. Active slot ($ACTIVE_SLOT) still running."
    exit 1
fi

# 6. Switch traffic via local Caddy
echo "--- Switching traffic to $TARGET ---"
cat > "$DEPLOY_DIR/Caddyfile.local" <<EOF
:80 {
    reverse_proxy ui:80
}
EOF

# Reload caddy config
docker exec infra-caddy-local-1 caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || \
    docker restart infra-caddy-local-1

# 7. Grace period for in-flight requests
echo "--- Waiting 5s for in-flight requests ---"
sleep 5

# 8. Stop old slot (if any)
if [[ "$ACTIVE_SLOT" != "none" ]]; then
    echo "--- Stopping old $ACTIVE_SLOT slot ---"
    # project-name is enough for docker compose down (doesn't need port vars)
    docker compose \
        -f "$DEPLOY_DIR/docker-compose.app.yml" \
        --project-name "$ACTIVE_SLOT" \
        down --remove-orphans
fi

# 9. Record active slot
echo "$TARGET" > "$SLOT_FILE"

echo ""
echo "=== Deploy complete ==="
echo "Active slot: $TARGET"
echo "UI: http://127.0.0.1:$TARGET_UI_PORT"
echo "API: http://127.0.0.1:$TARGET_API_PORT"
