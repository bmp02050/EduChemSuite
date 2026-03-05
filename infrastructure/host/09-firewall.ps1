#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Phase 9: Configure Windows Firewall rules for inbound traffic.

.DESCRIPTION
    Opens TCP ports 80, 443, 10022, 20022, 30022 on the Windows host firewall.
#>

$ErrorActionPreference = "Stop"

Write-Host "=== Phase 9: Windows Host Firewall Rules ===" -ForegroundColor Cyan

$rules = @(
    @{ Name = "HyperV-HTTP";          Port = 80;    Desc = "HTTP to Caddy Proxy" },
    @{ Name = "HyperV-HTTPS";         Port = 443;   Desc = "HTTPS to Caddy Proxy" },
    @{ Name = "HyperV-SSH-Cheap";     Port = 10022; Desc = "SSH to Cheap VM" },
    @{ Name = "HyperV-SSH-EduChem";   Port = 20022; Desc = "SSH to EduChemSuite VM" },
    @{ Name = "HyperV-SSH-Caddy";     Port = 30022; Desc = "SSH to Caddy Proxy VM" }
)

foreach ($rule in $rules) {
    # Remove existing rule if present
    $existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Updating existing rule: $($rule.Name)"
        Remove-NetFirewallRule -DisplayName $rule.Name
    }

    Write-Host "Creating rule: $($rule.Name) (TCP $($rule.Port)) - $($rule.Desc)"
    New-NetFirewallRule `
        -DisplayName $rule.Name `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort $rule.Port `
        -Action Allow `
        -Profile Any `
        -Description $rule.Desc
}

Write-Host ""
Write-Host "[OK] Firewall rules configured." -ForegroundColor Green
Write-Host ""
Write-Host "Current rules:"
Get-NetFirewallRule -DisplayName "HyperV-*" | Format-Table DisplayName, Enabled, Direction, Action -AutoSize
