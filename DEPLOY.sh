#!/bin/bash

echo "======================================"
echo "🚀 DEPLOY AUTOMÁTICO"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Primero, creá el repositorio en GitHub:${NC}"
echo "   👉 https://github.com/new"
echo ""
echo "   - Repository name: casamiento-katherine-ariel"
echo "   - Public o Private (como quieras)"
echo "   - NO marques nada más"
echo "   - Click 'Create repository'"
echo ""

read -p "¿Ya creaste el repositorio? (s/n): " created

if [ "$created" != "s" ]; then
    echo "Creá el repositorio primero y volvé a ejecutar este script"
    exit 1
fi

echo ""
echo -e "${BLUE}2. Ingresá tu usuario de GitHub:${NC}"
read -p "Usuario: " github_user

echo ""
echo -e "${GREEN}Subiendo código a GitHub...${NC}"
git remote add origin https://github.com/$github_user/casamiento-katherine-ariel.git 2>/dev/null || git remote set-url origin https://github.com/$github_user/casamiento-katherine-ariel.git
git branch -M main
git push -u origin main

echo ""
echo "======================================"
echo -e "${GREEN}✅ Código subido a GitHub!${NC}"
echo "======================================"
echo ""
echo -e "${BLUE}3. Ahora deployá en Render:${NC}"
echo ""
echo "   👉 https://render.com/register"
echo ""
echo "   1. Registrate con GitHub (gratis)"
echo "   2. Click 'New +' → 'Web Service'"
echo "   3. Conectá GitHub y seleccioná: casamiento-katherine-ariel"
echo "   4. Configuración:"
echo "      - Build Command: pip install -r requirements.txt && python database.py"
echo "      - Start Command: gunicorn app:app"
echo "      - Instance Type: Free"
echo "   5. Click 'Create Web Service'"
echo ""
echo "En 2-3 minutos tendrás tu URL pública! 🎉"
echo ""
