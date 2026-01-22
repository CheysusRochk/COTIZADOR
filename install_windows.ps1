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
    Write-Host "  ✓ Python encontrado: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Python NO encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor instala Python 3.9 o superior desde:" -ForegroundColor Yellow
    Write-Host "  https://www.python.org/downloads/" -ForegroundColor White
    Write-Host ""
    Write-Host "IMPORTANTE: Durante la instalación, marca la opción 'Add Python to PATH'" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "¿Deseas continuar de todas formas? (s/n)"
    if ($continue -ne "s") {
        exit
    }
}

# 2. Verificar Node.js
Write-Host "[2/4] Verificando Node.js..." -ForegroundColor Green
if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js NO encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor instala Node.js LTS desde:" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "¿Deseas continuar de todas formas? (s/n)"
    if ($continue -ne "s") {
        exit
    }
}

# 3. Instalar dependencias del Backend
Write-Host "[3/4] Instalando dependencias del Backend..." -ForegroundColor Green
try {
    Set-Location backend
    
    # Crear entorno virtual si no existe
    if (-not (Test-Path "venv")) {
        Write-Host "  Creando entorno virtual..." -ForegroundColor Yellow
        python -m venv venv
    }
    
    # Activar entorno virtual e instalar
    Write-Host "  Instalando paquetes de Python..." -ForegroundColor Yellow
    .\venv\Scripts\activate
    pip install -r requirements.txt --quiet
    deactivate
    
    Write-Host "  ✓ Backend configurado" -ForegroundColor Green
    Set-Location ..
} catch {
    Write-Host "  ✗ Error configurando backend: $_" -ForegroundColor Red
    Set-Location ..
}

# 4. Instalar dependencias del Frontend
Write-Host "[4/4] Instalando dependencias del Frontend..." -ForegroundColor Green
try {
    Set-Location frontend
    
    Write-Host "  Instalando paquetes de Node.js (esto puede tardar unos minutos)..." -ForegroundColor Yellow
    npm install --silent
    
    Write-Host "  ✓ Frontend configurado" -ForegroundColor Green
    Set-Location ..
} catch {
    Write-Host "  ✗ Error configurando frontend: $_" -ForegroundColor Red
    Set-Location ..
}

# Crear acceso directo en el escritorio
Write-Host ""
Write-Host "Creando acceso directo..." -ForegroundColor Green
try {
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktopPath "Cotizador Warp6.lnk"
    $targetPath = Join-Path $PSScriptRoot "start_app.ps1"
    
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-ExecutionPolicy Bypass -File \`"$targetPath\`""
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.IconLocation = "shell32.dll,165"
    $Shortcut.Description = "Iniciar Cotizador Warp6"
    $Shortcut.Save()
    
    Write-Host "  ✓ Acceso directo creado en el escritorio" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ No se pudo crear el acceso directo (no es crítico)" -ForegroundColor Yellow
}

# Resumen final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar la aplicación:" -ForegroundColor White
Write-Host "  1. Haz doble clic en 'Cotizador Warp6' en tu escritorio" -ForegroundColor Yellow
Write-Host "  2. O ejecuta: .\start_app.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "La aplicación se abrirá en tu navegador en:" -ForegroundColor White
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Enter para salir..." -ForegroundColor Gray
Read-Host
