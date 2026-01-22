# Script to update dependencies for Warp6 Cotizador
Write-Host "Updating Backend Dependencies..." -ForegroundColor Green

# Use relative path to backend folder
cd backend

Write-Host "Uninstalling old Playwright..." -ForegroundColor Yellow
.\venv\Scripts\pip uninstall -y playwright

Write-Host "Installing Selenium and dependencies..." -ForegroundColor Green
.\venv\Scripts\pip install -r requirements.txt

cd ..

Write-Host "Done! You can now restart the app using .\start_app.ps1" -ForegroundColor Cyan
