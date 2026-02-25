#!/usr/bin/env python3
"""
Aplicación web para gestionar el casamiento de Katherine y Ariel
19 de Diciembre 2026 - Basílica de Lourdes
"""

from flask import Flask, render_template, jsonify, request, send_from_directory
import json
import os
import qrcode
import io
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from PIL import Image
from database import CasamientoDatabase

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Usar /tmp en producción (Render) o static/uploads en local
if os.environ.get('RENDER'):
    app.config['UPLOAD_FOLDER'] = '/tmp/uploads'
else:
    app.config['UPLOAD_FOLDER'] = 'static/uploads'

app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'heic', 'heif'}

# Crear carpetas de uploads si no existen
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'thumbnails'), exist_ok=True)

db = CasamientoDatabase()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Datos del casamiento
WEDDING_DATA = {
    'novia': {
        'nombre': 'Katherine Molina',
        'dni': '96.225.340',
        'telefono': '11-4184-9351',
        'email': 'katitomolina0505@gmail.com'
    },
    'novio': {
        'nombre': 'Ariel Cardoso',
        'dni': '37.277.354',
        'telefono': '11-5963-2661',
        'email': 'arielcardoso93@gmail.com'
    },
    'fecha': '2026-12-19',
    'fecha_texto': '19 de Diciembre de 2026',
    'ceremonia': {
        'lugar': 'Basílica Nuestra Señora de Lourdes',
        'direccion': 'Av. La Plata 3757, Santos Lugares, Buenos Aires',
        'telefono': '011 4757-2130',
        'web': 'santuariodelourdes.org.ar'
    },
    'invitados': 50,
    'presupuesto_total': 5000000
}

# Presupuesto detallado
PRESUPUESTO = {
    'categorias': [
        {
            'nombre': 'Ceremonia',
            'items': [
                {'item': 'Iglesia/Registro Civil', 'estimado': 150000, 'real': 0, 'pagado': 0},
                {'item': 'Música ceremonia', 'estimado': 120000, 'real': 0, 'pagado': 0},
                {'item': 'Flores ceremonia', 'estimado': 80000, 'real': 0, 'pagado': 0}
            ]
        },
        {
            'nombre': 'Fiesta',
            'items': [
                {'item': 'Salón/Quinta', 'estimado': 1200000, 'real': 0, 'pagado': 0},
                {'item': 'Catering (50 pax)', 'estimado': 600000, 'real': 0, 'pagado': 0},
                {'item': 'Bebidas', 'estimado': 400000, 'real': 0, 'pagado': 0},
                {'item': 'Torta', 'estimado': 100000, 'real': 0, 'pagado': 0},
                {'item': 'Candy Bar', 'estimado': 80000, 'real': 0, 'pagado': 0},
                {'item': 'DJ/Música', 'estimado': 200000, 'real': 0, 'pagado': 0}
            ]
        },
        {
            'nombre': 'Fotografía y Video',
            'items': [
                {'item': 'Fotógrafo', 'estimado': 280000, 'real': 0, 'pagado': 0},
                {'item': 'Video', 'estimado': 250000, 'real': 0, 'pagado': 0},
                {'item': 'Drone', 'estimado': 80000, 'real': 0, 'pagado': 0}
            ]
        },
        {
            'nombre': 'Indumentaria',
            'items': [
                {'item': 'Vestido novia', 'estimado': 350000, 'real': 0, 'pagado': 0},
                {'item': 'Traje novio', 'estimado': 180000, 'real': 0, 'pagado': 0},
                {'item': 'Zapatos y accesorios', 'estimado': 110000, 'real': 0, 'pagado': 0}
            ]
        },
        {
            'nombre': 'Decoración',
            'items': [
                {'item': 'Flores centro de mesa', 'estimado': 120000, 'real': 0, 'pagado': 0},
                {'item': 'Ambientación salón', 'estimado': 150000, 'real': 0, 'pagado': 0}
            ]
        },
        {
            'nombre': 'Otros',
            'items': [
                {'item': 'Invitaciones', 'estimado': 50000, 'real': 0, 'pagado': 0},
                {'item': 'Souvenirs', 'estimado': 80000, 'real': 0, 'pagado': 0},
                {'item': 'Belleza', 'estimado': 100000, 'real': 0, 'pagado': 0},
                {'item': 'Transporte', 'estimado': 150000, 'real': 0, 'pagado': 0},
                {'item': 'Anillos', 'estimado': 200000, 'real': 0, 'pagado': 0},
                {'item': 'Luna de Miel', 'estimado': 530000, 'real': 0, 'pagado': 0},
                {'item': 'Imprevistos', 'estimado': 150000, 'real': 0, 'pagado': 0}
            ]
        }
    ]
}

# Proveedores recomendados
PROVEEDORES = {
    'salones': [
        {
            'nombre': 'Tomate Palermo',
            'precio': '$500.000 - $1.200.000',
            'telefono': '11-7226-9510 (Soho) / 11-3660-7077 (Rosedal)',
            'email': 'tuevento@tomate.com.ar',
            'direccion': 'El Salvador 4676 / Av. Infanta Isabel 555',
            'destacado': 'TODO INCLUIDO - Mejor precio',
            'prioridad': 'URGENTE'
        },
        {
            'nombre': 'Tachwüll',
            'precio': '$1.500.000 - $2.000.000',
            'telefono': 'Web: tachwull.com',
            'email': '-',
            'direccion': 'Balcarce 1036, CABA',
            'destacado': 'Más cerca de la Basílica (20-25 min)',
            'prioridad': 'URGENTE'
        },
        {
            'nombre': 'Botánico',
            'precio': '$1.200.000 - $1.800.000',
            'telefono': '+54 9 3364 02-9481',
            'email': 'hola@botanicoclub.com.ar',
            'direccion': 'Afueras CABA',
            'destacado': 'Ambiente natural, permite catering externo',
            'prioridad': 'ALTA'
        },
        {
            'nombre': 'Augusto & Ros',
            'precio': '$1.500.000 - $2.500.000',
            'telefono': '011-4702-9752 / 15-5958-9262',
            'email': 'www.augustoyros.com',
            'direccion': 'Cuba 3380, Núñez',
            'destacado': 'Casona francesa, máxima elegancia',
            'prioridad': 'ALTA'
        }
    ],
    'fotografia': [
        {
            'nombre': 'Martín Díaz Bodas',
            'precio': '$18.500 - $42.000',
            'contacto': 'www.martindiazbodas.com',
            'destacado': 'Paquetes 2026 desde básico hasta luxury'
        },
        {
            'nombre': 'OPEN Fotografía',
            'precio': '$350.000 - $400.000',
            'contacto': 'www.openfotografia.com',
            'destacado': 'Iglesia + fiesta completo'
        }
    ],
    'video': [
        {
            'nombre': 'Bokeh Estudio',
            'precio': 'USD 1.500 - 3.500',
            'contacto': 'www.bokehestudiobodas.com',
            'destacado': 'Pack Cine + Pack Memorable'
        }
    ]
}

# Timeline de tareas
TIMELINE = [
    {'fecha': 'FEBRERO 2026', 'tarea': 'Contactar Basílica - Reservar fecha', 'prioridad': 'URGENTE', 'estado': 'pendiente'},
    {'fecha': 'FEBRERO 2026', 'tarea': 'Solicitar partidas de bautismo', 'prioridad': 'URGENTE', 'estado': 'pendiente'},
    {'fecha': 'FEBRERO 2026', 'tarea': 'Cotizar y reservar salón', 'prioridad': 'URGENTE', 'estado': 'pendiente'},
    {'fecha': 'FEBRERO 2026', 'tarea': 'Inscribirse curso pre-matrimonial', 'prioridad': 'URGENTE', 'estado': 'pendiente'},
    {'fecha': 'MARZO 2026', 'tarea': 'Contratar fotógrafo y video', 'prioridad': 'ALTA', 'estado': 'pendiente'},
    {'fecha': 'MARZO 2026', 'tarea': 'Elegir vestido de novia', 'prioridad': 'ALTA', 'estado': 'pendiente'},
    {'fecha': 'MARZO-ABRIL 2026', 'tarea': 'Realizar curso pre-matrimonial', 'prioridad': 'URGENTE', 'estado': 'pendiente'},
    {'fecha': 'ABRIL 2026', 'tarea': 'Contratar catering (si no está incluido)', 'prioridad': 'ALTA', 'estado': 'pendiente'},
    {'fecha': 'MAYO 2026', 'tarea': 'Iniciar expediente matrimonial', 'prioridad': 'URGENTE', 'estado': 'pendiente'},
    {'fecha': 'MAYO 2026', 'tarea': 'Elegir traje del novio', 'prioridad': 'MEDIA', 'estado': 'pendiente'},
    {'fecha': 'JUNIO 2026', 'tarea': 'Contratar DJ/Música', 'prioridad': 'MEDIA', 'estado': 'pendiente'},
    {'fecha': 'JULIO 2026', 'tarea': 'Diseñar invitaciones', 'prioridad': 'MEDIA', 'estado': 'pendiente'},
    {'fecha': 'AGOSTO 2026', 'tarea': 'Enviar invitaciones', 'prioridad': 'ALTA', 'estado': 'pendiente'},
    {'fecha': 'AGOSTO 2026', 'tarea': 'Contratar decoración y flores', 'prioridad': 'MEDIA', 'estado': 'pendiente'},
    {'fecha': 'SEPTIEMBRE 2026', 'tarea': 'Prueba de vestido', 'prioridad': 'ALTA', 'estado': 'pendiente'},
    {'fecha': 'OCTUBRE 2026', 'tarea': 'Casamiento civil', 'prioridad': 'URGENTE', 'estado': 'pendiente'},
    {'fecha': 'OCTUBRE 2026', 'tarea': 'Confirmar lista final invitados', 'prioridad': 'ALTA', 'estado': 'pendiente'},
    {'fecha': 'NOVIEMBRE 2026', 'tarea': 'Prueba peinado y maquillaje', 'prioridad': 'MEDIA', 'estado': 'pendiente'},
    {'fecha': 'NOVIEMBRE 2026', 'tarea': 'Confirmar todos los proveedores', 'prioridad': 'ALTA', 'estado': 'pendiente'},
    {'fecha': 'DICIEMBRE 2026', 'tarea': 'Retirar vestido y traje', 'prioridad': 'ALTA', 'estado': 'pendiente'},
    {'fecha': 'DICIEMBRE 2026', 'tarea': 'Ensayo en la Basílica', 'prioridad': 'MEDIA', 'estado': 'pendiente'}
]

@app.route('/')
def index():
    """Página principal - Dashboard"""
    # Calcular días hasta el casamiento
    fecha_casamiento = datetime.strptime(WEDDING_DATA['fecha'], '%Y-%m-%d')
    hoy = datetime.now()
    dias_restantes = (fecha_casamiento - hoy).days
    
    # Calcular totales del presupuesto
    total_estimado = sum(
        item['estimado'] 
        for cat in PRESUPUESTO['categorias'] 
        for item in cat['items']
    )
    
    return render_template('index.html', 
                         wedding=WEDDING_DATA, 
                         dias_restantes=dias_restantes,
                         total_estimado=total_estimado)

@app.route('/presupuesto')
def presupuesto():
    """Página de presupuesto detallado"""
    presupuesto_data = db.get_presupuesto()
    if not presupuesto_data:
        presupuesto_data = PRESUPUESTO
    else:
        presupuesto_data = {'categorias': presupuesto_data}
    
    return render_template('presupuesto.html', 
                         wedding=WEDDING_DATA,
                         presupuesto=presupuesto_data)

@app.route('/proveedores')
def proveedores():
    """Página de proveedores"""
    return render_template('proveedores.html', 
                         wedding=WEDDING_DATA,
                         proveedores=PROVEEDORES)

@app.route('/timeline')
def timeline():
    """Página de timeline de tareas"""
    return render_template('timeline.html', 
                         wedding=WEDDING_DATA,
                         timeline=TIMELINE)

@app.route('/invitados')
def invitados():
    """Página de lista de invitados"""
    return render_template('invitados.html', 
                         wedding=WEDDING_DATA)

@app.route('/api/presupuesto')
def api_presupuesto():
    """API para obtener datos del presupuesto"""
    presupuesto_data = db.get_presupuesto()
    if not presupuesto_data:
        return jsonify(PRESUPUESTO)
    return jsonify({'categorias': presupuesto_data})

@app.route('/api/presupuesto/actualizar', methods=['POST'])
def api_actualizar_presupuesto():
    """API para actualizar un item del presupuesto"""
    data = request.json
    db.actualizar_presupuesto_item(
        data['categoria'],
        data['item'],
        data['datos']
    )
    return jsonify({'success': True, 'message': 'Presupuesto actualizado'})

@app.route('/api/timeline')
def api_timeline():
    """API para obtener timeline"""
    tareas = db.get_tareas()
    if not tareas:
        return jsonify(TIMELINE)
    return jsonify(tareas)

@app.route('/api/tareas/<int:tarea_id>/estado', methods=['PUT'])
def api_actualizar_tarea(tarea_id):
    """API para actualizar estado de una tarea"""
    data = request.json
    db.actualizar_tarea_estado(tarea_id, data['estado'])
    return jsonify({'success': True, 'message': 'Tarea actualizada'})

@app.route('/api/invitados')
def api_invitados():
    """API para obtener invitados"""
    invitados = db.get_invitados()
    return jsonify(invitados)

@app.route('/api/invitados', methods=['POST'])
def api_agregar_invitado():
    """API para agregar un invitado"""
    data = request.json
    invitado_id = db.agregar_invitado(data)
    return jsonify({'success': True, 'id': invitado_id, 'message': 'Invitado agregado'})

@app.route('/api/invitados/<int:invitado_id>', methods=['PUT'])
def api_actualizar_invitado(invitado_id):
    """API para actualizar un invitado"""
    data = request.json
    db.actualizar_invitado(invitado_id, data)
    return jsonify({'success': True, 'message': 'Invitado actualizado'})

@app.route('/api/invitados/<int:invitado_id>', methods=['DELETE'])
def api_eliminar_invitado(invitado_id):
    """API para eliminar un invitado"""
    db.eliminar_invitado(invitado_id)
    return jsonify({'success': True, 'message': 'Invitado eliminado'})

@app.route('/api/proveedores')
def api_proveedores():
    """API para obtener proveedores"""
    proveedores = db.get_proveedores()
    return jsonify(proveedores)

@app.route('/api/proveedores/<int:proveedor_id>/contratar', methods=['PUT'])
def api_contratar_proveedor(proveedor_id):
    """API para marcar proveedor como contratado"""
    data = request.json
    db.actualizar_proveedor_contratado(proveedor_id, data['contratado'])
    return jsonify({'success': True, 'message': 'Proveedor actualizado'})

@app.route('/api/sync/cambios')
def api_cambios():
    """API para obtener cambios desde un timestamp"""
    timestamp = request.args.get('desde', '2000-01-01 00:00:00')
    cambios = db.get_cambios_desde(timestamp)
    return jsonify(cambios)

@app.route('/mapa')
def mapa():
    """Página de mapa interactivo de salones"""
    return render_template('mapa.html', wedding=WEDDING_DATA)

@app.route('/instagram')
def instagram():
    """Página de Instagram y redes sociales"""
    return render_template('instagram.html', wedding=WEDDING_DATA)

@app.route('/fotos')
def fotos():
    """Página para subir fotos"""
    return render_template('fotos.html', wedding=WEDDING_DATA)

@app.route('/galeria')
def galeria():
    """Página de galería de fotos"""
    fotos = db.get_fotos()
    return render_template('galeria.html', wedding=WEDDING_DATA, fotos=fotos)

@app.route('/qr')
def qr_code():
    """Generar código QR para acceder a la página de fotos"""
    url = request.host_url + 'fotos'
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    from flask import send_file
    return send_file(img_io, mimetype='image/png')

@app.route('/qr-page')
def qr_page():
    """Página para mostrar el código QR"""
    return render_template('qr.html', wedding=WEDDING_DATA)

@app.route('/api/fotos', methods=['GET'])
def api_get_fotos():
    """API para obtener todas las fotos"""
    fotos = db.get_fotos()
    return jsonify(fotos)

@app.route('/api/fotos/upload', methods=['POST'])
def api_upload_foto():
    """API para subir una foto"""
    try:
        if 'foto' not in request.files:
            return jsonify({'success': False, 'message': 'No se envió ninguna foto'}), 400
        
        file = request.files['foto']
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No se seleccionó ningún archivo'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            nombre_archivo = f"{timestamp}_{filename}"
            
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], nombre_archivo)
            file.save(filepath)
            
            try:
                # Comprimir y redimensionar imagen original
                img = Image.open(filepath)
                
                # Redimensionar imagen principal (max 1200px)
                img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
                img.save(filepath, optimize=True, quality=85)
                
                # Crear thumbnail pequeño
                img.thumbnail((300, 300), Image.Resampling.LANCZOS)
                thumbnail_path = os.path.join(app.config['UPLOAD_FOLDER'], 'thumbnails', nombre_archivo)
                img.save(thumbnail_path, optimize=True, quality=80)
                thumbnail_rel = f"uploads/thumbnails/{nombre_archivo}"
            except Exception as e:
                print(f"Error creando thumbnail: {e}")
                thumbnail_rel = f"uploads/{nombre_archivo}"
            
            subido_por = request.form.get('nombre', 'Invitado')
            descripcion = request.form.get('descripcion', '')
            
            foto_id = db.agregar_foto({
                'nombre_archivo': nombre_archivo,
                'nombre_original': file.filename,
                'ruta': f"uploads/{nombre_archivo}",
                'thumbnail': thumbnail_rel,
                'subido_por': subido_por,
                'descripcion': descripcion
            })
            
            return jsonify({
                'success': True,
                'message': 'Foto subida correctamente',
                'id': foto_id,
                'filename': nombre_archivo
            })
        
        return jsonify({'success': False, 'message': 'Tipo de archivo no permitido'}), 400
    
    except Exception as e:
        print(f"Error en upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Error al subir foto: {str(e)}'}), 500

@app.route('/api/fotos/<int:foto_id>', methods=['DELETE'])
def api_eliminar_foto(foto_id):
    """API para eliminar una foto"""
    db.eliminar_foto(foto_id)
    return jsonify({'success': True, 'message': 'Foto eliminada'})

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    """Servir archivos subidos desde /tmp en producción"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    print("=" * 60)
    print("🎉 CASAMIENTO KATHERINE & ARIEL - 19 DICIEMBRE 2026 🎉")
    print("=" * 60)
    print("\n📱 Abrí tu navegador en: http://localhost:5000")
    print("\n✨ Funcionalidades:")
    print("   - Dashboard con cuenta regresiva")
    print("   - Presupuesto detallado")
    print("   - Proveedores recomendados")
    print("   - Timeline de tareas")
    print("   - Lista de invitados")
    print("\n⚠️  Presioná Ctrl+C para detener el servidor\n")
    print("=" * 60)
    
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
