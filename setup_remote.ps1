# Script para compartir COTIZADOR por internet
# Este script te ayuda a exponer tu aplicación para que otros puedan acceder

Write-Host "=== WARP6 COTIZADOR - Configurador de Acceso Remoto ===" -ForegroundColor Cyan
Write-Host ""

# Verificar si ngrok está instalado
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "ERROR: ngrok no está instalado." -ForegroundColor Red
    Write-Host "Descárgalo desde: https://ngrok.com/download" -ForegroundColor Yellow
    exit
}

Write-Host "Opciones de configuración:" -ForegroundColor Green
Write-Host "1. Solo compartir VISUALIZACIÓN (gratis - 1 túnel ngrok)" -ForegroundColor White
Write-Host "   - Otros pueden VER cotizaciones que tú generes" -ForegroundColor Gray
Write-Host "   - NO pueden buscar productos (backend es local)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Compartir TODO (requiere 2 túneles simultáneos)" -ForegroundColor White
Write-Host "   - Otros pueden buscar productos y generar cotizaciones" -ForegroundColor Gray
Write-Host "   - Necesitas: ngrok PRO o cloudflared (gratis)" -ForegroundColor Gray
Write-Host ""

$opcion = Read-Host "Selecciona opción (1 o 2)"

if ($opcion -eq "1") {
    Write-Host ""
    Write-Host "=== MODO VISUALIZACIÓN ===" -ForegroundColor Cyan
    Write-Host "Configurando para compartir solo la interfaz..." -ForegroundColor Yellow
    Write-Host ""
    
    # Restaurar .env.local a localhost
    $envContent = "# For local development (default)`nNEXT_PUBLIC_API_URL=http://localhost:8000"
    Set-Content -Path "frontend\.env.local" -Value $envContent
    
    Write-Host "1. Inicia tu aplicación normalmente: .\start_app.ps1" -ForegroundColor Green
    Write-Host "2. En OTRA terminal, corre: ngrok http 3000" -ForegroundColor Green
    Write-Host "3. Comparte la URL que te dé ngrok" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: El backend estará en TU computadora." -ForegroundColor Yellow
    Write-Host "Tú serás quien busque productos y genere PDFs." -ForegroundColor Yellow
    Write-Host "Los demás solo verán tu pantalla en tiempo real." -ForegroundColor Yellow
    
} elseif ($opcion -eq "2") {
    Write-Host ""
    Write-Host "=== MODO COMPLETO (Requiere cloudflared) ===" -ForegroundColor Cyan
    Write-Host ""
    
    # Verificar cloudflared
    $cfInstalled = Get-Command cloudflared -ErrorAction SilentlyContinue
    if (-not $cfInstalled) {
        Write-Host "Necesitas instalar Cloudflare Tunnel (gratis, sin límites):" -ForegroundColor Yellow
        Write-Host "winget install --id Cloudflare.cloudflared" -ForegroundColor White
        Write-Host ""
        Write-Host "Después de instalar, vuelve a correr este script." -ForegroundColor Green
        exit
    }
    
    Write-Host "Instrucciones:" -ForegroundColor Green
    Write-Host "1. Inicia tu aplicación: .\start_app.ps1" -ForegroundColor White
    Write-Host "2. En otra terminal: ngrok http 8000" -ForegroundColor White
    Write-Host "3. Copia la URL de ngrok y pégala aquí:" -ForegroundColor White
    $backendUrl = Read-Host "URL del backend"
    
    # Actualizar .env.local
    $envContent = "# Backend URL for remote access`nNEXT_PUBLIC_API_URL=$backendUrl"
    Set-Content -Path "frontend\.env.local" -Value $envContent
    
    Write-Host ""
    Write-Host "Configuración actualizada!" -ForegroundColor Green
    Write-Host "4. REINICIA el frontend (Ctrl+C y vuelve a .\start_app.ps1)" -ForegroundColor Yellow
    Write-Host "5. En otra terminal: cloudflared tunnel --url http://localhost:3000" -ForegroundColor White
    Write-Host "6. Comparte la URL de cloudflared a tus usuarios" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ahora TODO funcionará remotamente!" -ForegroundColor Cyan
    
} else {
    Write-Host "Opción inválida." -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona Enter para salir..." -ForegroundColor Gray
Read-Host
