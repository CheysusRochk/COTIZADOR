#!/bin/bash
# Script para DETENER el cotizador

echo "=== DETENIENDO COTIZADOR ==="

if [ ! -f ~/cotizador-pids.txt ]; then
    echo "No hay procesos corriendo (archivo de PIDs no encontrado)"
    exit 0
fi

while read pid; do
    if ps -p $pid > /dev/null 2>&1; then
        echo "Deteniendo proceso $pid..."
        kill $pid
    fi
done < ~/cotizador-pids.txt

rm ~/cotizador-pids.txt

echo ""
echo "Aplicación detenida. WordPress sigue funcionando normalmente."
