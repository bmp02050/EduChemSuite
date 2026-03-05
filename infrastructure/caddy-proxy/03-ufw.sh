#!/usr/bin/env bash
set -euo pipefail

# Phase 9: Configure UFW on the Caddy Proxy VM (192.168.100.3)
# Allows: SSH (22), HTTP (80), HTTPS (443) from anywhere

echo "=== Configuring UFW on Caddy Proxy VM ==="

sudo ufw --force reset

sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow 22/tcp comment "SSH"
sudo ufw allow 80/tcp comment "HTTP (ACME challenges + redirect)"
sudo ufw allow 443/tcp comment "HTTPS (TLS termination)"

sudo ufw --force enable

echo "[OK] UFW configured."
sudo ufw status verbose
