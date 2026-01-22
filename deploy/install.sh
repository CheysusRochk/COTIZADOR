#!/bin/bash
# Script de instalación automática para Ubuntu Server
# Autor: Warp6 Solutions
# Uso: curl -fsSL https://raw.githubusercontent.com/CheysusRochk/COTIZADOR/main/deploy/install.sh | bash

set -e

echo "=== INSTALADOR AUTOMÁTICO COTIZADOR WARP6 ==="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar si es root
if [ "$EUID" -ne 0 ]
  then echo "Por favor ejecuta con sudo o como root"
  exit
fi

echo -e "${YELLOW}Actualizando sistema...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}Instalando Python y dependencias...${NC}"
apt install -y python3 python3-pip python3-venv

echo -e "${YELLOW}Instalando Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo -e "${YELLOW}Instalando Chrome y ChromeDriver...${NC}"
wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
apt install -y ./google-chrome-stable_current_amd64.deb
rm google-chrome-stable_current_amd64.deb
apt install -y chromium-chromedriver

echo -e "${YELLOW}Instalando Nginx...${NC}"
apt install -y nginx git

echo -e "${YELLOW}Clonando proyecto...${NC}"
cd /opt
if [ -d "COTIZADOR" ]; then
    echo "El directorio ya existe, actualizando..."
    cd COTIZADOR
    git pull
else
    git clone https://github.com/CheysusRochk/COTIZADOR.git
    cd COTIZADOR
fi

echo -e "${YELLOW}Configurando Backend...${NC}"
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

echo -e "${YELLOW}Configurando Frontend...${NC}"
cd frontend
echo "NEXT_PUBLIC_API_URL=/api" > .env.production
npm install
npm run build
cd ..

echo -e "${YELLOW}Creando servicios systemd...${NC}"

# Backend Service
cat > /etc/systemd/system/cotizador-backend.service <<EOL
[Unit]
Description=Cotizador Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/COTIZADOR/backend
Environment="PATH=/opt/COTIZADOR/backend/venv/bin"
ExecStart=/opt/COTIZADOR/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# Frontend Service
cat > /etc/systemd/system/cotizador-frontend.service <<EOL
[Unit]
Description=Cotizador Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/COTIZADOR/frontend
Environment="PATH=/usr/bin:/usr/local/bin"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
EOL

echo -e "${YELLOW}Configurando Nginx...${NC}"

# Obtener IP del servidor
SERVER_IP=$(curl -s ifconfig.me)

cat > /etc/nginx/sites-available/cotizador <<EOL
server {
    listen 80;
    server_name $SERVER_IP _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOL

ln -sf /etc/nginx/sites-available/cotizador /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t

echo -e "${YELLOW}Configurando permisos...${NC}"
chown -R www-data:www-data /opt/COTIZADOR

echo -e "${YELLOW}Iniciando servicios...${NC}"
systemctl daemon-reload
systemctl enable cotizador-backend cotizador-frontend nginx
systemctl restart cotizador-backend cotizador-frontend nginx

echo ""
echo -e "${GREEN}=== INSTALACIÓN COMPLETA ===${NC}"
echo ""
echo -e "Tu aplicación está disponible en: ${GREEN}http://$SERVER_IP${NC}"
echo ""
echo "Comandos útiles:"
echo "  Ver estado: sudo systemctl status cotizador-backend cotizador-frontend"
echo "  Ver logs:   sudo journalctl -u cotizador-backend -f"
echo "  Reiniciar:  sudo systemctl restart cotizador-backend cotizador-frontend"
echo ""
echo -e "${YELLOW}IMPORTANTE: Configura el firewall si aún no lo has hecho${NC}"
echo "  sudo ufw allow 22"
echo "  sudo ufw allow 80"
echo "  sudo ufw enable"
