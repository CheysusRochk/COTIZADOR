# Script to update dependencies
Write-Host "Uninstalling old Playwright..." -ForegroundColor Yellow
.\venv\Scripts\pip uninstall -y playwright

Write-Host "Installing Selenium and dependencies..." -ForegroundColor Green
.\venv\Scripts\pip install -r requirements.txt

Write-Host "Done! You can now restart the backend." -ForegroundColor Cyan
