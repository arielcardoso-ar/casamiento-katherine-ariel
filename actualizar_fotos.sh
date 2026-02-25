#!/bin/bash

echo "======================================"
echo "📸 Actualizando sistema de fotos"
echo "======================================"
echo ""

echo "1️⃣  Instalando dependencias..."
pip3 install -r requirements.txt

echo ""
echo "2️⃣  Actualizando base de datos..."
python3 -c "from database import CasamientoDatabase; db = CasamientoDatabase(); print('✓ Base de datos actualizada')"

echo ""
echo "3️⃣  Verificando carpetas..."
mkdir -p static/uploads/thumbnails
echo "✓ Carpetas creadas"

echo ""
echo "======================================"
echo "✅ Actualización completada!"
echo "======================================"
echo ""
echo "📱 Podés acceder a:"
echo "   - Subir fotos: http://localhost:5000/fotos"
echo "   - Ver galería: http://localhost:5000/galeria"
echo "   - Código QR: http://localhost:5000/qr-page"
echo ""
echo "Para iniciar el servidor:"
echo "   python3 app.py"
echo ""
