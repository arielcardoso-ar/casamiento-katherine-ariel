# 📸 Instrucciones para Subir Fotos

## Para los Novios

### 1. Iniciar el servidor

```bash
cd /Users/acardoso/Projects/casamiento-katherine-ariel
python3 app.py
```

El servidor estará disponible en: `http://localhost:5000`

### 2. Generar el código QR

1. Abrí tu navegador en: `http://localhost:5000/qr-page`
2. Verás un código QR grande en pantalla
3. Podés:
   - **Imprimir** el código QR y ponerlo en las mesas
   - **Proyectarlo** en una pantalla durante el evento
   - **Compartir** el link directo por WhatsApp

### 3. Compartir el link

Podés compartir este link directamente:
```
http://TU-IP-LOCAL:5000/fotos
```

**Para encontrar tu IP local:**
- Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`
- Linux: `ip addr show`

Ejemplo: `http://192.168.1.100:5000/fotos`

### 4. Ver las fotos subidas

Abrí: `http://localhost:5000/galeria`

---

## Para los Invitados

### Opción 1: Escanear el QR

1. Abrí la cámara de tu celular
2. Apuntá al código QR
3. Tocá la notificación que aparece
4. ¡Listo! Ya podés subir fotos

### Opción 2: Usar el link directo

1. Ingresá al link que te compartieron
2. Tocá "Seleccionar Foto"
3. Elegí la foto de tu galería
4. (Opcional) Agregá tu nombre y una descripción
5. Tocá "Subir Foto"

---

## Tips para el Día del Casamiento

### Antes del evento:

1. **Probá la conexión**
   - Asegurate que tu celular y la computadora estén en la misma red WiFi
   - Probá subir una foto de prueba

2. **Prepará carteles**
   - Imprimí el QR en tamaño grande
   - Agregá instrucciones simples: "Escaneá para compartir tus fotos"

3. **Configurá el servidor**
   - Dejá la computadora conectada y enchufada
   - Abrí la galería en una pestaña para ver las fotos en tiempo real

### Durante el evento:

1. **Ubicá los QR estratégicamente**
   - En las mesas
   - En la entrada
   - Cerca del photocall

2. **Anuncialo**
   - Mencioná durante el brindis que pueden subir fotos
   - Pedile al DJ que lo anuncie

3. **Monitoreá**
   - Revisá la galería de vez en cuando
   - Las fotos se van subiendo en tiempo real

---

## Solución de Problemas

### "No puedo acceder al link"

- Verificá que estés en la misma red WiFi
- Usá la IP local correcta (no `localhost` desde otro dispositivo)
- Asegurate que el servidor esté corriendo

### "Error al subir la foto"

- Verificá que la foto no sea muy grande (máx 16MB)
- Intentá con otra foto
- Revisá la conexión WiFi

### "El QR no funciona"

- Asegurate que la cámara tenga permisos
- Intentá con otra app de QR
- Usá el link directo como alternativa

---

## Después del Evento

### Descargar todas las fotos

Las fotos están guardadas en:
```
/Users/acardoso/Projects/casamiento-katherine-ariel/static/uploads/
```

Podés copiar toda la carpeta a un pendrive o subirlas a Google Drive.

### Backup de la base de datos

```bash
cp casamiento.db backup_fotos_$(date +%Y%m%d).db
```

---

## Características

✅ Subida desde cualquier celular
✅ No requiere registro ni login
✅ Funciona con iPhone y Android
✅ Soporta JPG, PNG, HEIC
✅ Genera thumbnails automáticamente
✅ Galería en tiempo real
✅ Información de quién subió cada foto

---

## Contacto

Si tenés problemas técnicos durante el evento:
- Ariel: 11-5963-2661
- Katherine: 11-4184-9351

¡Que disfruten el día! 💕
