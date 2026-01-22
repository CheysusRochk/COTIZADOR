# Startup Script for Warp6 Cotizador

Write-Host "Starting Warp6 Cotizador..." -ForegroundColor Cyan

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; uvicorn main:app --reload --port 8000"

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# Open Browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host "Servers started! Check the new windows." -ForegroundColor Yellow
