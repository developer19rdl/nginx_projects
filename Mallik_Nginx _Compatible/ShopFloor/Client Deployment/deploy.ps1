# =====================================================================
# ShopFloor Automated Client Deployment Script
# Run in PowerShell as Administrator on the Client Machine (192.168.8.8)
# =====================================================================

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   ShopFloor Deployment & Nginx Configuration Setup   " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Configure Windows Firewall for Port 81
Write-Host "[1/4] Checking Windows Firewall for Port 81..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "ShopFloor Web Port 81" -ErrorAction SilentlyContinue
if (-not $firewallRule) {
    try {
        New-NetFirewallRule -DisplayName "ShopFloor Web Port 81" -Direction Inbound -LocalPort 81 -Protocol TCP -Action Allow | Out-Null
        Write-Host "  -> Firewall rule created for TCP Port 81." -ForegroundColor Green
    } catch {
        Write-Host "  -> Note: Run as Administrator to allow incoming traffic on Port 81." -ForegroundColor Yellow
    }
} else {
    Write-Host "  -> Firewall rule already exists for Port 81." -ForegroundColor Green
}

# 2. Locate Nginx Installation
Write-Host "`n[2/4] Locating Nginx installation..." -ForegroundColor Yellow
$nginxPaths = @(
    "C:\nginx",
    "C:\nginx-1.31.5",
    "D:\nginx",
    "C:\Program Files\nginx",
    "D:\ERP\nginx"
)

$nginxDir = $null
foreach ($path in $nginxPaths) {
    if (Test-Path "$path\nginx.exe") {
        $nginxDir = $path
        break
    }
}

if (-not $nginxDir) {
    $customPath = Read-Host "Enter path to Nginx directory (where nginx.exe is located, e.g. C:\nginx-1.31.5)"
    if (Test-Path "$customPath\nginx.exe") {
        $nginxDir = $customPath
    } else {
        Write-Host "Error: Nginx not found at specified path. Please configure manually." -ForegroundColor Red
        pause
        exit 1
    }
}

Write-Host "  -> Found Nginx at: $nginxDir" -ForegroundColor Green

# 3. Backup and update Nginx configuration
Write-Host "`n[3/4] Updating Nginx configuration..." -ForegroundColor Yellow
$confDir = "$nginxDir\conf"
$locationsDir = "$confDir\locations"

if (-not (Test-Path $locationsDir)) {
    New-Item -ItemType Directory -Path $locationsDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
if (Test-Path "$confDir\nginx.conf") {
    Copy-Item "$confDir\nginx.conf" "$confDir\nginx.conf.bak_$timestamp"
    Write-Host "  -> Backed up existing nginx.conf to nginx.conf.bak_$timestamp" -ForegroundColor Gray
}

Copy-Item "$ScriptDir\Nginx\nginx.conf" "$confDir\nginx.conf" -Force
Copy-Item "$ScriptDir\Nginx\locations\*" "$locationsDir\" -Force
Write-Host "  -> Applied nginx.conf and modular locations (erp + shopfloor)." -ForegroundColor Green

# 4. Test and Reload Nginx
Write-Host "`n[4/4] Testing Nginx configuration..." -ForegroundColor Yellow
Push-Location $nginxDir
$testResult = & .\nginx.exe -t 2>&1
Write-Host ($testResult | Out-String)

if ($LASTEXITCODE -eq 0) {
    Write-Host "Nginx syntax is OK. Reloading Nginx service..." -ForegroundColor Green
    & .\nginx.exe -s reload 2>&1 | Out-Null
    Write-Host "Nginx reloaded successfully!" -ForegroundColor Green
} else {
    Write-Host "Warning: Nginx configuration test returned errors. Please inspect above." -ForegroundColor Red
}
Pop-Location

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "               DEPLOYMENT READY!                      " -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "1. To start the backend: run 'start_backend.bat'"
Write-Host "2. Access Mallik ERP:   http://192.168.8.8/"
Write-Host "3. Access ShopFloor:    http://192.168.8.8:81/"
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
pause
