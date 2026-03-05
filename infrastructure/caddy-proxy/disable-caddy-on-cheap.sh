#!/usr/bin/env bash
set -euo pipefail

# Phase 6: Remove Caddy from the Cheap VM
# Run this on the Cheap VM (192.168.100.1) AFTER verifying
# thecheapapp.ddns.net works through the new Caddy Proxy VM

echo "=== Phase 6: Disable Caddy on Cheap VM ==="

sudo systemctl stop caddy
sudo systemctl disable caddy

echo "[OK] Caddy stopped and disabled on Cheap VM."
echo ""
echo "Ensure your app listens on port 80 directly."
echo "If your app was behind Caddy on another port (e.g., 3000),"
echo "update the Caddyfile on the proxy VM to match:"
echo "  reverse_proxy 192.168.100.1:3000"
