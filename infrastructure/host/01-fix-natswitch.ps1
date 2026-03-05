#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Phase 1: Recreate NATswitch as Internal type and configure NAT gateway.

.DESCRIPTION
    The existing NATswitch is Private, which prevents VMs from reaching the internet.
    This script recreates it as Internal and sets up the host gateway at 192.168.100.254.

.NOTES
    - All VMs on NATswitch must be stopped before running this script.
    - After running, update each VM's netplan to use gateway 192.168.100.254.
#>

$ErrorActionPreference = "Stop"

$SwitchName = "NATswitch"
$NatName = "VMInternalNat"
$GatewayIP = "192.168.100.254"
$SubnetPrefix = "192.168.100.0/24"
$PrefixLength = 24

Write-Host "=== Phase 1: Fix NATswitch (Private -> Internal) ===" -ForegroundColor Cyan

# Step 1: Verify all VMs on this switch are stopped
$vmsOnSwitch = Get-VM | Where-Object {
    ($_ | Get-VMNetworkAdapter).SwitchName -contains $SwitchName
}
$runningVMs = $vmsOnSwitch | Where-Object { $_.State -eq "Running" }
if ($runningVMs) {
    Write-Host "The following VMs are still running on $SwitchName:" -ForegroundColor Red
    $runningVMs | ForEach-Object { Write-Host "  - $($_.Name)" }
    Write-Host "Please stop them first, then re-run this script." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] All VMs on $SwitchName are stopped." -ForegroundColor Green

# Step 2: Remove existing NAT
Write-Host "Removing existing NetNat..."
Get-NetNat | Remove-NetNat -Confirm:$false -ErrorAction SilentlyContinue
Write-Host "[OK] NetNat removed." -ForegroundColor Green

# Step 3: Disconnect VMs from the switch before removing it
$vmNames = @()
foreach ($vm in $vmsOnSwitch) {
    $vmNames += $vm.Name
    Write-Host "Disconnecting $($vm.Name) from $SwitchName..."
    Get-VMNetworkAdapter -VMName $vm.Name | Where-Object { $_.SwitchName -eq $SwitchName } | Disconnect-VMNetworkAdapter
}

# Step 4: Remove old switch
Write-Host "Removing old VMSwitch '$SwitchName'..."
Remove-VMSwitch -Name $SwitchName -Force
Write-Host "[OK] Old switch removed." -ForegroundColor Green

# Step 5: Create new Internal switch
Write-Host "Creating new Internal VMSwitch '$SwitchName'..."
New-VMSwitch -Name $SwitchName -SwitchType Internal
Write-Host "[OK] Internal switch created." -ForegroundColor Green

# Step 6: Assign gateway IP on host adapter
Write-Host "Configuring gateway IP $GatewayIP on host adapter..."
$adapter = Get-NetAdapter -Name "vEthernet ($SwitchName)" -ErrorAction Stop
New-NetIPAddress -IPAddress $GatewayIP -PrefixLength $PrefixLength -InterfaceIndex $adapter.ifIndex
Write-Host "[OK] Gateway IP assigned." -ForegroundColor Green

# Step 7: Create NAT
Write-Host "Creating NetNat '$NatName' for $SubnetPrefix..."
New-NetNat -Name $NatName -InternalIPInterfaceAddressPrefix $SubnetPrefix
Write-Host "[OK] NAT created." -ForegroundColor Green

# Step 8: Reconnect VMs
foreach ($vmName in $vmNames) {
    Write-Host "Reconnecting $vmName to $SwitchName..."
    Connect-VMNetworkAdapter -VMName $vmName -SwitchName $SwitchName
}
Write-Host "[OK] VMs reconnected." -ForegroundColor Green

Write-Host ""
Write-Host "=== NATswitch fix complete ===" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start your VMs"
Write-Host "  2. Update each VM's netplan to use gateway $GatewayIP"
Write-Host "  3. Verify internet access: ping 8.8.8.8"
