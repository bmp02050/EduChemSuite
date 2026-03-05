#!/usr/bin/env bash
set -euo pipefail

# Phase 9: Configure UFW on the EduChemSuite VM (192.168.100.2)
# Allows: SSH (22) from anywhere, HTTP (80) only from Caddy Proxy

CADDY_IP="192.168.100.3"

echo "=== Configuring UFW on EduChemSuite VM ==="

sudo ufw --force reset

sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow 22/tcp comment "SSH"
sudo ufw allow from "$CADDY_IP" to any port 80 proto tcp comment "HTTP from Caddy Proxy only"

sudo ufw --force enable

echo "[OK] UFW configured."
sudo ufw status verbose
