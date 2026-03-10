# 🖥️ Guía de Servidor Ubuntu — Cotizador Warp6

## Deployment (Subir cambios)

```bash
# 1. Entrar al directorio del proyecto
cd /ruta/al/COTIZADOR

# 2. Traer los cambios desde GitHub
git pull origin main

# 3. Instalar dependencias si hubo nuevas
cd frontend && npm install && cd ..
cd backend && source venv/bin/activate && pip install -r requirements.txt && deactivate && cd ..

# 4. Rebuild del frontend (producción)
cd frontend && npm run build && cd ..

# 5. Reiniciar ambos servicios
pm2 restart all
```

### Atajo rápido (si solo cambió frontend)

```bash
cd /ruta/al/COTIZADOR
git pull origin main
cd frontend && npm run build && cd ..
pm2 restart all
```

---

## PM2 — Comandos Esenciales

### Estado de los procesos

```bash
pm2 status              # Ver tabla resumen de todos los procesos
pm2 list                # Igual que status
pm2 show cotizador-fe   # Info detallada del frontend
pm2 show cotizador-be   # Info detallada del backend
```

### Reiniciar

```bash
pm2 restart all             # Reiniciar TODOS
pm2 restart cotizador-fe    # Solo frontend
pm2 restart cotizador-be    # Solo backend
pm2 reload all              # Reinicio sin downtime (graceful)
```

### Detener / Iniciar

```bash
pm2 stop all                # Detener todos
pm2 start all               # Iniciar todos
pm2 delete all              # Eliminar todos los procesos de PM2
```

### Logs (MUY ÚTIL para debug)

```bash
pm2 logs                    # Ver logs de TODOS en tiempo real
pm2 logs cotizador-fe       # Solo logs del frontend
pm2 logs cotizador-be       # Solo logs del backend
pm2 logs --lines 100        # Últimas 100 líneas
pm2 flush                   # Limpiar todos los archivos de log
```

### Monitoreo

```bash
pm2 monit                   # Dashboard interactivo (CPU, RAM, logs)
```

---

## Configuración Inicial de PM2

Si es la primera vez que configuras PM2 en el servidor:

```bash
# Instalar PM2 global
sudo npm install -g pm2

# Iniciar el backend (FastAPI con uvicorn)
cd /ruta/al/COTIZADOR
pm2 start "cd backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000" --name cotizador-be

# Iniciar el frontend (Next.js)
pm2 start "cd frontend && npm start" --name cotizador-fe

# Guardar la configuración para que PM2 reinicie al reboot
pm2 save
pm2 startup    # Sigue las instrucciones que muestra
```

---

## Puertos

| Servicio  | Puerto | URL                        |
|-----------|--------|----------------------------|
| Frontend  | 3000   | http://localhost:3000      |
| Backend   | 8000   | http://localhost:8000/api  |

---

## Troubleshooting

### Ver si los puertos están en uso

```bash
sudo lsof -i :3000    # ¿Quién usa el puerto 3000?
sudo lsof -i :8000    # ¿Quién usa el puerto 8000?
```

### Matar proceso en un puerto

```bash
sudo kill -9 $(lsof -t -i :3000)
sudo kill -9 $(lsof -t -i :8000)
```

### Si PM2 no arranca después de reboot

```bash
pm2 resurrect    # Restaurar procesos guardados
```

### Ver uso de disco / memoria

```bash
df -h             # Espacio en disco
free -h           # Memoria RAM
htop              # Monitor del sistema
```

### Verificar que la app responde

```bash
curl http://localhost:3000          # Frontend
curl http://localhost:8000/api/config   # Backend
```
