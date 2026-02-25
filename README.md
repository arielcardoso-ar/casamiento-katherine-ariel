# 💕 Casamiento Katherine & Ariel

**19 de Diciembre 2026 - Basílica de Lourdes**

Sistema web para gestionar el casamiento con sincronización Excel.

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar
./instalar.sh

# 2. Iniciar
python3 app.py

# 3. Abrir navegador
http://localhost:5000
```

---

## 🔄 Sincronización

### Web → Excel
```bash
python3 sync_excel.py exportar
```

### Excel → Web
```bash
python3 sync_excel.py importar
```

### Auto-sync (cada 5 min)
```bash
python3 auto_sync.py
```

---

## 📋 Funciones

- **Dashboard** - Cuenta regresiva y resumen
- **Presupuesto** - Control de gastos ($5M)
- **Proveedores** - Salones, fotógrafos, etc.
- **Timeline** - Tareas por mes
- **Invitados** - Gestión de 40-50 personas
- **📸 Fotos** - Subir fotos desde el celular con QR
- **🖼️ Galería** - Ver todas las fotos compartidas

**Todo se guarda automáticamente** en la base de datos.

---

## 📊 Datos

- **Presupuesto:** $5.000.000
- **Invitados:** 40-50 personas
- **Lugar:** Basílica Nuestra Señora de Lourdes
- **Fecha:** 19/12/2026

---

## 🔧 Archivos

```
app.py              # Aplicación web
database.py         # Base de datos
sync_excel.py       # Sincronización
casamiento.db       # Base de datos (auto-generada)
templates/          # Páginas HTML
static/             # CSS y JS
```

---

## 📸 Sistema de Fotos

### Subir fotos desde el celular

1. **Con QR:**
   - Abrí http://localhost:5000/qr-page
   - Escaneá el código QR con tu celular
   - ¡Listo! Ya podés subir fotos

2. **Link directo:**
   - Compartí: http://localhost:5000/fotos
   - Los invitados pueden subir fotos directamente

### Ver galería

```bash
http://localhost:5000/galeria
```

### Actualizar sistema de fotos

```bash
./actualizar_fotos.sh
```

---

## 💾 Backup

```bash
cp casamiento.db backup_$(date +%Y%m%d).db
```
