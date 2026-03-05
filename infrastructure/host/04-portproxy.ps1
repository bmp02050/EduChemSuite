#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Phase 4: Configure port forwarding rules on the Windows host.

.DESCRIPTION
    Resets all portproxy rules and sets up:
    - HTTP/HTTPS (80/443) -> Caddy Proxy VM (192.168.100.3)
    - SSH per VM: 10022->Cheap, 20022->EduChemSuite, 30022->CaddyProxy
#>

$ErrorActionPreference = "Stop"

$CaddyIP = "192.168.100.3"
$CheapIP = "192.168.100.1"
$EduChemIP = "192.168.100.2"

Write-Host "=== Phase 4: Update Port Forwarding ===" -ForegroundColor Cyan

# Ensure IP Helper service is running (required for portproxy)
$svc = Get-Service -Name iphlpsvc
if ($svc.Status -ne "Running") {
    Write-Host "Starting IP Helper service..."
    Start-Service iphlpsvc
}

# Reset all existing rules
Write-Host "Resetting all portproxy rules..."
netsh interface portproxy reset

# Web traffic -> Caddy Proxy VM
Write-Host "Adding HTTP/HTTPS rules -> $CaddyIP..."
netsh interface portproxy add v4tov4 listenport=80  listenaddress=0.0.0.0 connectport=80  connectaddress=$CaddyIP
netsh interface portproxy add v4tov4 listenport=443 listenaddress=0.0.0.0 connectport=443 connectaddress=$CaddyIP

# Per-VM SSH
Write-Host "Adding SSH rules..."
netsh interface portproxy add v4tov4 listenport=10022 listenaddress=0.0.0.0 connectport=22 connectaddress=$CheapIP
netsh interface portproxy add v4tov4 listenport=20022 listenaddress=0.0.0.0 connectport=22 connectaddress=$EduChemIP
netsh interface portproxy add v4tov4 listenport=30022 listenaddress=0.0.0.0 connectport=22 connectaddress=$CaddyIP

Write-Host ""
Write-Host "[OK] Port forwarding configured. Current rules:" -ForegroundColor Green
netsh interface portproxy show all
