#!/usr/bin/env bash
set -euo pipefail

# Phase 2/5: Install and configure Caddy on the proxy VM
# Run this script on the Caddy Proxy VM (192.168.100.3)

echo "=== Setting up Caddy Reverse Proxy ==="

# Install Caddy from official apt repository
echo "Installing Caddy..."
sudo apt-get update
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update
sudo apt-get install -y caddy

echo "[OK] Caddy installed."

# Deploy Caddyfile
echo "Deploying Caddyfile..."
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo caddy fmt --overwrite /etc/caddy/Caddyfile

# Enable and start Caddy
sudo systemctl enable caddy
sudo systemctl restart caddy

echo "[OK] Caddy is running."
echo ""
echo "Verify with: sudo systemctl status caddy"
echo "View logs:   sudo journalctl -u caddy -f"
