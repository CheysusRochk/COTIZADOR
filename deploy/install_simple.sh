#!/bin/bash
# Script SIMPLE de despliegue - No afecta Apache/WordPress
# Expone la aplicación en el puerto 3000

set -e

echo "=== INSTALACIÓN SIMPLE - COTIZADOR ==="
echo "Solo instalará dependencias y expondrá en puerto 3000"
echo ""

# Actualizar sistema
echo "[1/6] Actualizando sistema..."
sudo apt update

# Instalar Python
echo "[2/6] Instalando Python..."
sudo apt install -y python3 python3-pip python3-venv

# Instalar Node.js
echo "[3/6] Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Chrome y ChromeDriver
echo "[4/6] Instalando Chrome y ChromeDriver..."
wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
rm google-chrome-stable_current_amd64.deb
sudo apt install -y chromium-chromedriver

# Clonar proyecto
echo "[5/6] Descargando aplicación..."
cd ~
if [ -d "COTIZADOR" ]; then
    cd COTIZADOR
    git pull
    cd ~
else
    git clone https://github.com/CheysusRochk/COTIZADOR.git
fi

# Configurar Backend
echo "[6/6] Configurando backend..."
cd ~/COTIZADOR/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Configurar Frontend
echo "Configurando frontend..."
cd ~/COTIZADOR/frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm install
npm run build

# Abrir puerto en firewall
echo "Configurando firewall..."
sudo ufw allow 3000/tcp

echo ""
echo "=== INSTALACIÓN COMPLETA ==="
echo ""
echo "Para INICIAR la aplicación, usa:"
echo "  cd ~/COTIZADOR"
echo "  ./start_server.sh"
echo ""
echo "Para DETENER:"
echo "  Ctrl+C en las terminales abiertas"
