// Gestión de Invitados con sincronización a base de datos

let invitados = [];

// Cargar invitados al iniciar
document.addEventListener('DOMContentLoaded', function() {
    cargarInvitadosDesdeAPI();
});

function agregarInvitado() {
    document.getElementById('modalInvitado').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalInvitado').style.display = 'none';
    document.getElementById('formInvitado').reset();
}

async function cargarInvitadosDesdeAPI() {
    try {
        const response = await fetch('/api/invitados');
        invitados = await response.json();
        cargarInvitados();
        actualizarEstadisticas();
    } catch (error) {
        console.error('Error al cargar invitados:', error);
        showNotification('Error al cargar invitados', 'error');
    }
}

async function guardarInvitado(event) {
    event.preventDefault();
    
    const form = event.target;
    const invitado = {
        nombre: form.nombre.value,
        telefono: form.telefono.value,
        email: form.email.value,
        grupo: form.grupo.value,
        invitacion_enviada: false,
        confirmacion: 'Pendiente',
        asiste: null,
        menu: '',
        alergias: '',
        mesa: null
    };
    
    try {
        const response = await fetch('/api/invitados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invitado)
        });
        
        const result = await response.json();
        
        if (result.success) {
            await cargarInvitadosDesdeAPI();
            cerrarModal();
            showNotification('Invitado agregado y guardado correctamente');
        }
    } catch (error) {
        console.error('Error al guardar invitado:', error);
        showNotification('Error al guardar invitado', 'error');
    }
}

function cargarInvitados() {
    const tbody = document.getElementById('invitadosTableBody');
    
    if (invitados.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="10" class="text-center">
                    <p>No hay invitados agregados aún</p>
                    <button class="btn btn-primary" onclick="agregarInvitado()">
                        Agregar Primer Invitado
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = invitados.map((inv, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${inv.nombre}</td>
            <td>${inv.telefono || '-'}</td>
            <td>${inv.email || '-'}</td>
            <td>${inv.grupo}</td>
            <td>
                <input type="checkbox" 
                       ${inv.invitacion_enviada ? 'checked' : ''}
                       onchange="toggleInvitacion(${inv.id})">
            </td>
            <td>
                <select onchange="cambiarConfirmacion(${inv.id}, this.value)">
                    <option value="Pendiente" ${inv.confirmacion === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="Confirmado" ${inv.confirmacion === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                    <option value="No Asiste" ${inv.confirmacion === 'No Asiste' ? 'selected' : ''}>No Asiste</option>
                </select>
            </td>
            <td>
                <input type="text" 
                       value="${inv.menu || ''}"
                       placeholder="Menú"
                       onchange="actualizarCampo(${inv.id}, 'menu', this.value)">
            </td>
            <td>
                <input type="text" 
                       value="${inv.alergias || ''}"
                       placeholder="Alergias"
                       onchange="actualizarCampo(${inv.id}, 'alergias', this.value)">
            </td>
            <td>
                <input type="text" 
                       value="${inv.mesa || ''}"
                       placeholder="Mesa"
                       onchange="actualizarCampo(${inv.id}, 'mesa', this.value)">
            </td>
        </tr>
    `).join('');
}

async function toggleInvitacion(id) {
    const invitado = invitados.find(i => i.id === id);
    if (invitado) {
        invitado.invitacion_enviada = !invitado.invitacion_enviada;
        await actualizarInvitadoAPI(id, invitado);
        actualizarEstadisticas();
    }
}

async function cambiarConfirmacion(id, valor) {
    const invitado = invitados.find(i => i.id === id);
    if (invitado) {
        invitado.confirmacion = valor;
        await actualizarInvitadoAPI(id, invitado);
        actualizarEstadisticas();
    }
}

async function actualizarCampo(id, campo, valor) {
    const invitado = invitados.find(i => i.id === id);
    if (invitado) {
        invitado[campo] = valor;
        await actualizarInvitadoAPI(id, invitado);
    }
}

async function actualizarInvitadoAPI(id, invitado) {
    try {
        const response = await fetch(`/api/invitados/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invitado)
        });
        
        const result = await response.json();
        if (!result.success) {
            console.error('Error al actualizar invitado');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function actualizarEstadisticas() {
    const total = invitados.length;
    const confirmados = invitados.filter(i => i.confirmacion === 'Confirmado').length;
    const noAsisten = invitados.filter(i => i.confirmacion === 'No Asiste').length;
    const pendientes = invitados.filter(i => i.confirmacion === 'Pendiente').length;
    
    // Actualizar números en la página
    const stats = document.querySelectorAll('.invitados-summary .summary-stat h3');
    if (stats.length >= 4) {
        stats[0].textContent = total;
        stats[1].textContent = confirmados;
        stats[2].textContent = pendientes;
        stats[3].textContent = noAsisten;
    }
    
    // Actualizar distribución por grupos
    const grupos = {};
    invitados.forEach(inv => {
        grupos[inv.grupo] = (grupos[inv.grupo] || 0) + 1;
    });
    
    document.querySelectorAll('.grupo-card').forEach(card => {
        const grupo = card.querySelector('h4').textContent;
        const count = grupos[grupo] || 0;
        card.querySelector('.grupo-count').textContent = `${count} personas`;
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function exportarLista() {
    const csv = [
        ['Nº', 'Nombre', 'Teléfono', 'Email', 'Grupo', 'Invitación', 'Confirmación', 'Menú', 'Alergias', 'Mesa'],
        ...invitados.map((inv, i) => [
            i + 1,
            inv.nombre,
            inv.telefono || '',
            inv.email || '',
            inv.grupo,
            inv.invitacionEnviada ? 'Sí' : 'No',
            inv.confirmacion,
            inv.menu || '',
            inv.alergias || '',
            inv.mesa || ''
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invitados_casamiento.csv';
    a.click();
    
    showNotification('Lista exportada correctamente');
}

// Estilos para el modal
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .modal-content {
        background: white;
        border-radius: 10px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }
    
    .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-size: 2rem;
        cursor: pointer;
        color: #999;
    }
    
    .modal-close:hover {
        color: #333;
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }
    
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
    }
    
    .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    
    .form-actions button {
        flex: 1;
    }
`;
document.head.appendChild(modalStyle);
