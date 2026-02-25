#!/usr/bin/env python3
"""
Script para inicializar la base de datos con datos iniciales
"""

from database import CasamientoDatabase

def inicializar_datos():
    """Inicializar la base de datos con datos del casamiento"""
    print("🔧 Inicializando base de datos...")
    
    db = CasamientoDatabase()
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Limpiar todas las tablas
    print("\n🗑️  Limpiando tablas existentes...")
    cursor.execute('DELETE FROM presupuesto')
    cursor.execute('DELETE FROM invitados')
    cursor.execute('DELETE FROM tareas')
    cursor.execute('DELETE FROM proveedores')
    
    # ========== PRESUPUESTO ==========
    print("\n💰 Insertando presupuesto...")
    
    presupuesto_items = [
        # Ceremonia
        ('Ceremonia', 'Iglesia/Registro Civil', 150000),
        ('Ceremonia', 'Música ceremonia', 120000),
        ('Ceremonia', 'Flores ceremonia', 80000),
        # Fiesta
        ('Fiesta', 'Salón/Quinta', 1200000),
        ('Fiesta', 'Catering (50 pax)', 600000),
        ('Fiesta', 'Bebidas', 400000),
        ('Fiesta', 'Torta', 100000),
        ('Fiesta', 'Candy Bar', 80000),
        ('Fiesta', 'DJ/Música', 200000),
        # Fotografía y Video
        ('Fotografía y Video', 'Fotógrafo', 280000),
        ('Fotografía y Video', 'Video', 250000),
        ('Fotografía y Video', 'Drone', 80000),
        # Indumentaria
        ('Indumentaria', 'Vestido novia', 350000),
        ('Indumentaria', 'Traje novio', 180000),
        ('Indumentaria', 'Zapatos y accesorios', 110000),
        # Decoración
        ('Decoración', 'Flores centro de mesa', 120000),
        ('Decoración', 'Ambientación salón', 150000),
        # Otros
        ('Otros', 'Invitaciones', 50000),
        ('Otros', 'Souvenirs', 80000),
        ('Otros', 'Belleza', 100000),
        ('Otros', 'Transporte', 150000),
        ('Otros', 'Anillos', 200000),
        ('Otros', 'Luna de Miel', 530000),
        ('Otros', 'Imprevistos', 150000),
    ]
    
    for cat, item, estimado in presupuesto_items:
        cursor.execute('''
            INSERT INTO presupuesto (categoria, item, estimado, real, pagado)
            VALUES (?, ?, ?, 0, 0)
        ''', (cat, item, estimado))
        print(f"  ✓ {cat} - {item}: ${estimado:,.0f}")
    
    print(f"  ✅ {len(presupuesto_items)} items insertados")
    
    # ========== TAREAS ==========
    print("\n📅 Insertando tareas...")
    
    tareas = [
        ('FEBRERO 2026', 'Contactar Basílica - Reservar fecha', 'Ceremonia', 'URGENTE'),
        ('FEBRERO 2026', 'Solicitar partidas de bautismo', 'Ceremonia', 'URGENTE'),
        ('FEBRERO 2026', 'Cotizar y reservar salón', 'Fiesta', 'URGENTE'),
        ('FEBRERO 2026', 'Inscribirse curso pre-matrimonial', 'Ceremonia', 'URGENTE'),
        ('MARZO 2026', 'Contratar fotógrafo y video', 'Fotografía', 'ALTA'),
        ('MARZO 2026', 'Elegir vestido de novia', 'Indumentaria', 'ALTA'),
        ('MARZO-ABRIL 2026', 'Realizar curso pre-matrimonial', 'Ceremonia', 'URGENTE'),
        ('ABRIL 2026', 'Contratar catering (si no está incluido)', 'Fiesta', 'ALTA'),
        ('MAYO 2026', 'Iniciar expediente matrimonial', 'Ceremonia', 'URGENTE'),
        ('MAYO 2026', 'Elegir traje del novio', 'Indumentaria', 'MEDIA'),
        ('JUNIO 2026', 'Contratar DJ/Música', 'Fiesta', 'MEDIA'),
        ('JULIO 2026', 'Diseñar invitaciones', 'Invitaciones', 'MEDIA'),
        ('AGOSTO 2026', 'Enviar invitaciones', 'Invitaciones', 'ALTA'),
        ('AGOSTO 2026', 'Contratar decoración y flores', 'Decoración', 'MEDIA'),
        ('SEPTIEMBRE 2026', 'Prueba de vestido', 'Indumentaria', 'ALTA'),
        ('OCTUBRE 2026', 'Casamiento civil', 'Legal', 'URGENTE'),
        ('OCTUBRE 2026', 'Confirmar lista final invitados', 'Invitados', 'ALTA'),
        ('NOVIEMBRE 2026', 'Prueba peinado y maquillaje', 'Belleza', 'MEDIA'),
        ('NOVIEMBRE 2026', 'Confirmar todos los proveedores', 'General', 'ALTA'),
        ('DICIEMBRE 2026', 'Retirar vestido y traje', 'Indumentaria', 'ALTA'),
        ('DICIEMBRE 2026', 'Ensayo en la Basílica', 'Ceremonia', 'MEDIA'),
    ]
    
    for fecha, tarea, categoria, prioridad in tareas:
        cursor.execute('''
            INSERT INTO tareas (fecha, tarea, categoria, prioridad, estado)
            VALUES (?, ?, ?, ?, 'pendiente')
        ''', (fecha, tarea, categoria, prioridad))
        print(f"  ✓ {fecha} - {tarea}")
    
    print(f"  ✅ {len(tareas)} tareas insertadas")
    
    # ========== PROVEEDORES ==========
    print("\n🏢 Insertando proveedores...")
    
    proveedores = [
        # Salones
        ('Salon', 'Tomate Palermo', '40-80 personas', '11-7226-9510 (Soho) / 11-3660-7077 (Rosedal)', 
         'tuevento@tomate.com.ar', 'El Salvador 4676 / Av. Infanta Isabel 555, Palermo', 
         '$500.000 - $1.200.000', False, 'TODO INCLUIDO - Mejor precio'),
        
        ('Salon', 'Tachwüll', '30-60 personas', 'Consultar en web', 'info@tachwull.com', 
         'Balcarce 1036, San Telmo, CABA', '$1.500.000 - $2.000.000', False, 
         'Más cerca de la Basílica (20-25 min)'),
        
        ('Salon', 'Botánico Club', '40-100 personas', '+54 9 3364 02-9481', 'hola@botanicoclub.com.ar',
         'Zona Norte CABA', '$1.200.000 - $1.800.000', False,
         'Ambiente natural con jardín'),
        
        ('Salon', 'Augusto & Ros', '30-80 personas', '011-4702-9752 / 15-5958-9262', 'info@augustoyros.com',
         'Cuba 3380, Núñez, CABA', '$1.500.000 - $2.500.000', False,
         'Casona francesa premium'),
        
        ('Salon', 'La Morada', '40-120 personas', '011-4790-3456', 'eventos@lamorada.com.ar',
         'Av. del Libertador 4101, Olivos', '$800.000 - $1.500.000', False,
         'Quinta con parque arbolado'),
        
        ('Salon', 'El Casco Art Hotel', '30-60 personas', '011-4732-3993', 'eventos@elcasco.com.ar',
         'Av. del Libertador 16170, San Isidro', '$2.000.000 - $3.000.000', False,
         'Hotel boutique de lujo'),
        
        ('Salon', 'Casa Feliz', '40-90 personas', '011-4807-2345', 'info@casafeliz.com.ar',
         'Av. Figueroa Alcorta 3415, Palermo', '$1.000.000 - $1.800.000', False,
         'Frente a los bosques de Palermo'),
        
        ('Salon', 'Salón Verde', '35-70 personas', '011-4362-8901', 'eventos@salonverde.com.ar',
         'Defensa 1344, San Telmo, CABA', '$700.000 - $1.300.000', False,
         'Patio con plantas y estilo vintage'),
        
        ('Salon', 'Jardín Urbano', '40-80 personas', '011-4831-5678', 'reservas@jardinurbano.com.ar',
         'Av. Santa Fe 4589, Palermo', '$900.000 - $1.600.000', False,
         'Terraza verde en pleno Palermo'),
        
        ('Salon', 'Espacio Luz', '35-75 personas', '011-4774-2345', 'info@espacioluz.com.ar',
         'Thames 1985, Palermo Hollywood', '$800.000 - $1.400.000', False,
         'Loft moderno con patio'),
        
        ('Salon', 'Bella Rosa Recepciones', '40-100 personas', 'Consultar', 'info@bellarosa.com.ar',
         'Zona Sur CABA', '$900.000 - $1.700.000', False,
         'Muy cerca de la Basílica (15 min) - Salón elegante'),
        
        # Fotografía
        ('Fotografia', 'Martín Díaz Bodas', '-', '-', 'www.martindiazbodas.com',
         'Buenos Aires', '$18.500 - $42.000', False,
         'Paquetes 2026 desde básico hasta luxury'),
        
        ('Fotografia', 'OPEN Fotografía', '-', '-', 'www.openfotografia.com',
         'Buenos Aires', '$350.000 - $400.000', False,
         'Iglesia + fiesta completo'),
        
        # Video
        ('Video', 'Bokeh Estudio', '-', '-', 'www.bokehestudiobodas.com',
         'Buenos Aires', 'USD 1.500 - 3.500', False,
         'Pack Cine + Pack Memorable'),
        
        ('Video', 'Estudio 26', '-', '-', 'www.estudio26.com.ar',
         'Buenos Aires', 'Consultar', False,
         'Foto y video combinado'),
        
        # DJ
        ('DJ/Musica', 'Renzo Angeli', '-', '-', '-',
         'Buenos Aires', '$480.000', False,
         '+25 años experiencia'),
        
        ('DJ/Musica', 'Audiomix', '-', '-', '-',
         'Buenos Aires', '$450.000', False,
         'Equipo profesional completo'),
    ]
    
    for prov in proveedores:
        cursor.execute('''
            INSERT INTO proveedores (categoria, nombre, contacto, telefono, email,
                                    direccion, precio, contratado, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', prov)
        print(f"  ✓ {prov[0]} - {prov[1]}")
    
    print(f"  ✅ {len(proveedores)} proveedores insertados")
    
    # ========== CONFIGURACIÓN ==========
    print("\n⚙️  Configurando datos generales...")
    
    cursor.execute('''
        INSERT OR REPLACE INTO configuracion (clave, valor)
        VALUES 
            ('novia_nombre', 'Katherine Molina'),
            ('novia_dni', '96.225.340'),
            ('novia_telefono', '11-4184-9351'),
            ('novia_email', 'katitomolina0505@gmail.com'),
            ('novio_nombre', 'Ariel Cardoso'),
            ('novio_dni', '37.277.354'),
            ('novio_telefono', '11-5963-2661'),
            ('novio_email', 'arielcardoso93@gmail.com'),
            ('fecha_casamiento', '2026-12-19'),
            ('lugar_ceremonia', 'Basílica Nuestra Señora de Lourdes'),
            ('direccion_ceremonia', 'Av. La Plata 3757, Santos Lugares, Buenos Aires'),
            ('telefono_ceremonia', '011 4757-2130'),
            ('web_ceremonia', 'santuariodelourdes.org.ar'),
            ('invitados_total', '50'),
            ('presupuesto_total', '5000000')
    ''')
    
    print("  ✅ Configuración guardada")
    
    conn.commit()
    conn.close()
    
    print("\n" + "="*60)
    print("✅ BASE DE DATOS INICIALIZADA CORRECTAMENTE")
    print("="*60)
    print("\n📊 Resumen:")
    print(f"   - Presupuesto: {len(presupuesto_items)} items")
    print(f"   - Tareas: {len(tareas)} tareas")
    print(f"   - Proveedores: {len(proveedores)} proveedores")
    print(f"   - Configuración: 15 valores")
    print("\n🚀 La aplicación web ahora guardará todos los cambios automáticamente")
    print("📤 Para exportar cambios al Excel, ejecutá: python3 sync_excel.py exportar")

if __name__ == '__main__':
    inicializar_datos()
