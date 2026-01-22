#!/bin/bash
# Script para INICIAR el cotizador (temporal, solo mientras lo necesites)

echo "=== INICIANDO COTIZADOR EN PUERTO 3000 ==="
echo "WordPress NO se verá afectado"
echo ""

# Ir al directorio del proyecto
cd ~/COTIZADOR

# Iniciar backend en background
echo "Iniciando backend (puerto 8000)..."
cd backend
source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > ~/cotizador-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend iniciado (PID: $BACKEND_PID)"
deactivate
cd ..

# Iniciar frontend en background
echo "Iniciando frontend (puerto 3000)..."
cd frontend
nohup npm start > ~/cotizador-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend iniciado (PID: $FRONTEND_PID)"
cd ..

# Obtener IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "=== APLICACIÓN INICIADA ==="
echo "Accede desde cualquier navegador:"
echo "  http://$SERVER_IP:3000"
echo ""
echo "PIDs guardados en ~/cotizador-pids.txt"
echo "$BACKEND_PID" > ~/cotizador-pids.txt
echo "$FRONTEND_PID" >> ~/cotizador-pids.txt

echo ""
echo "Para DETENER la aplicación:"
echo "  ./stop_server.sh"
echo ""
echo "Logs en tiempo real:"
echo "  tail -f ~/cotizador-backend.log"
echo "  tail -f ~/cotizador-frontend.log"
