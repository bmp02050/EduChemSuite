#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Phase 3: Create the EduChemSuite VM in Hyper-V.

.DESCRIPTION
    Creates a Gen 2 Ubuntu VM for running the EduChemSuite Docker stack.
    You must provide the path to an Ubuntu Server 24.04 LTS ISO.

.PARAMETER IsoPath
    Path to the Ubuntu Server 24.04 LTS ISO file.
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$IsoPath
)

$ErrorActionPreference = "Stop"

$VMName = "EduChemSuite"
$SwitchName = "NATswitch"
$VHDPath = "C:\Hyper-V\Virtual Hard Disks\$VMName.vhdx"
$VHDSize = 30GB
$MemoryStartup = 1GB
$MemoryMinimum = 1GB
$MemoryMaximum = 4GB
$ProcessorCount = 2

Write-Host "=== Phase 3: Create EduChemSuite VM ===" -ForegroundColor Cyan

# Validate ISO exists
if (-not (Test-Path $IsoPath)) {
    Write-Error "ISO not found at: $IsoPath"
    exit 1
}

# Create VHD directory if needed
$vhdDir = Split-Path $VHDPath -Parent
if (-not (Test-Path $vhdDir)) {
    New-Item -ItemType Directory -Path $vhdDir -Force | Out-Null
}

# Create VM
Write-Host "Creating VM '$VMName'..."
New-VM -Name $VMName `
    -MemoryStartupBytes $MemoryStartup `
    -Generation 2 `
    -NewVHDPath $VHDPath `
    -NewVHDSizeBytes $VHDSize `
    -SwitchName $SwitchName

# Configure dynamic memory
Set-VMMemory -VMName $VMName `
    -DynamicMemoryEnabled $true `
    -MinimumBytes $MemoryMinimum `
    -MaximumBytes $MemoryMaximum `
    -StartupBytes $MemoryStartup

# Set processor count
Set-VMProcessor -VMName $VMName -Count $ProcessorCount

# Disable Secure Boot (for Ubuntu)
Set-VMFirmware -VMName $VMName -EnableSecureBoot Off

# Attach ISO
Add-VMDvdDrive -VMName $VMName -Path $IsoPath

# Set boot order: DVD first, then VHD
$dvd = Get-VMDvdDrive -VMName $VMName
$hdd = Get-VMHardDiskDrive -VMName $VMName
Set-VMFirmware -VMName $VMName -BootOrder $dvd, $hdd

Write-Host "[OK] VM '$VMName' created." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start-VM -Name '$VMName'"
Write-Host "  2. Connect to VM console and install Ubuntu Server"
Write-Host "  3. During install: select OpenSSH server"
Write-Host "  4. After install, run the netplan and Docker setup scripts on the VM"
