#!/bin/bash

echo "🎉 Instalación del Sistema de Casamiento Katherine & Ariel"
echo "=========================================================="
echo ""

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado"
    exit 1
fi

echo "✅ Python 3 detectado: $(python3 --version)"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo ""

# Inicializar base de datos
echo "💾 Inicializando base de datos..."
python3 inicializar_db.py

if [ $? -eq 0 ]; then
    echo "✅ Base de datos inicializada"
else
    echo "❌ Error al inicializar base de datos"
    exit 1
fi

echo ""
echo "=========================================================="
echo "✅ INSTALACIÓN COMPLETADA"
echo "=========================================================="
echo ""
echo "🚀 Para iniciar la aplicación:"
echo "   python3 app.py"
echo ""
echo "🌐 Luego abrir en el navegador:"
echo "   http://localhost:5000"
echo ""
echo "📚 Documentación:"
echo "   - INICIO_RAPIDO.md - Guía de inicio"
echo "   - GUIA_SINCRONIZACION.md - Sincronización Excel ↔ Web"
echo "   - README.md - Documentación completa"
echo ""
echo "💕 ¡Feliz planificación del casamiento!"
