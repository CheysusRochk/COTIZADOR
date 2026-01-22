# 📦 Instalación del Cotizador Warp6

## Requisitos Previos

Antes de instalar, asegúrate de tener:

1. **Python 3.9 o superior**
   - Descarga: https://www.python.org/downloads/
   - ⚠️ **IMPORTANTE**: Durante la instalación, marca "Add Python to PATH"

2. **Node.js 18 o superior (LTS recomendado)**
   - Descarga: https://nodejs.org/

## Instalación Automática (Recomendado)

1. Descarga o clona este repositorio
2. Haz clic derecho en `install_windows.ps1`
3. Selecciona "Ejecutar con PowerShell"
4. Sigue las instrucciones en pantalla

El instalador:
- ✅ Verifica que Python y Node.js estén instalados
- ✅ Instala todas las dependencias automáticamente
- ✅ Crea un acceso directo en tu escritorio
- ✅ Deja todo listo para usar

## Instalación Manual

Si prefieres instalar manualmente:

### Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
deactivate
```

### Frontend
```powershell
cd frontend
npm install
```

## Uso

### Iniciar la Aplicación

**Opción 1:** Haz doble clic en el acceso directo "Cotizador Warp6" en tu escritorio

**Opción 2:** Ejecuta desde PowerShell:
```powershell
.\start_app.ps1
```

La aplicación se abrirá automáticamente en tu navegador en `http://localhost:3000`

### Detener la Aplicación

Simplemente cierra las ventanas de PowerShell que se abrieron.

## Solución de Problemas

### "Python no se reconoce como comando"
- Reinstala Python y asegúrate de marcar "Add Python to PATH"
- O reinicia tu computadora después de instalar Python

### "Node no se reconoce como comando"
- Reinstala Node.js
- Reinicia tu computadora después de instalar

### Error al instalar dependencias
- Ejecuta PowerShell como Administrador
- Vuelve a ejecutar `install_windows.ps1`

### El navegador no se abre automáticamente
- Abre manualmente: http://localhost:3000

## Compartir con Otros

Para que otra persona use la aplicación:

1. Comparte este repositorio completo
2. Pídeles que ejecuten `install_windows.ps1`
3. ¡Listo!

No necesitan configurar nada más, el instalador hace todo automáticamente.

## Actualizaciones

Para actualizar a una nueva versión:

```powershell
git pull
.\install_windows.ps1
```

El instalador actualizará todas las dependencias automáticamente.
