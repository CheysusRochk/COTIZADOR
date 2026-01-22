# Instalador Automático - COTIZADOR WARP6
# Para Windows 10/11

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALADOR COTIZADOR WARP6" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ADVERTENCIA: No se está ejecutando como administrador." -ForegroundColor Yellow
    Write-Host "Algunas instalaciones pueden requerir permisos elevados." -ForegroundColor Yellow
    Write-Host ""
}

# Función para verificar si un comando existe
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# 1. Verificar Python
Write-Host "[1/4] Verificando Python..." -ForegroundColor Green
if (Test-Command python) {
    $pythonVersion = python --version
    Write-Host "  OK: Python encontrado" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Python NO encontrado" -ForegroundColor Red
    Write-Host "  Por favor instala Python 3.9+ desde python.org" -ForegroundColor Yellow
    Write-Host "  Asegúrate de marcar 'Add Python to PATH'" -ForegroundColor Yellow
    exit
}

# 2. Verificar Node.js
Write-Host "[2/4] Verificando Node.js..." -ForegroundColor Green
if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "  OK: Node.js encontrado" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Node.js NO encontrado" -ForegroundColor Red
    Write-Host "  Por favor instala Node.js LTS desde nodejs.org" -ForegroundColor Yellow
    exit
}

# 3. Instalar dependencias del Backend
Write-Host "[3/4] Instalando dependencias del Backend..." -ForegroundColor Green
try {
    Set-Location backend

    if (-not (Test-Path "venv")) {
        Write-Host "  Creando entorno virtual..." -ForegroundColor Yellow
        python -m venv venv
    }

    Write-Host "  Instalando paquetes de Python..." -ForegroundColor Yellow
    # Usar cmd para activar venv mas confiable
    cmd /c "venv\Scripts\activate.bat && pip install -r requirements.txt"
    
    Write-Host "  OK: Backend configurado" -ForegroundColor Green
    Set-Location ..
} catch {
    Write-Host "  ERROR configurando backend: $_" -ForegroundColor Red
    Set-Location ..
}

# 4. Instalar dependencias del Frontend
Write-Host "[4/4] Instalando dependencias del Frontend..." -ForegroundColor Green
try {
    Set-Location frontend
    
    Write-Host "  Instalando paquetes de Node.js..." -ForegroundColor Yellow
    cmd /c "npm install"
    
    Write-Host "  OK: Frontend configurado" -ForegroundColor Green
    Set-Location ..
} catch {
    Write-Host "  ERROR configurando frontend: $_" -ForegroundColor Red
    Set-Location ..
}

# Crear acceso directo en el escritorio
Write-Host ""
Write-Host "Creando acceso directo..." -ForegroundColor Green
try {
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = "$desktopPath\Cotizador Warp6.lnk"
    $targetPath = "$PSScriptRoot\start_app.ps1"
    
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "powershell.exe"
    # Sintaxis simple sin complicaciones de escape
    $Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$targetPath`""
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.IconLocation = "shell32.dll,165"
    $Shortcut.Description = "Iniciar Cotizador Warp6"
    $Shortcut.Save()
    
    Write-Host "  OK: Acceso directo creado" -ForegroundColor Green
} catch {
    Write-Host "  AVISO: No se pudo crear el acceso directo" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LISTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Enter para salir..."
$null = Read-Host
