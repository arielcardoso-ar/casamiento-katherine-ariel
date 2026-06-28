// Gestión de Invitados

let invitados = [];
let invitadosFiltrados = [];
let idAEliminar = null;

const COLORES_GRUPO = {
    'Familia Kathy': '#e91e8c',
    'Amigos Kathy':  '#f06292',
    'Familia Ariel': '#5c6bc0',
    'Amigos Ariel':  '#7986cb',
};

function colorGrupo(grupo) {
    return COLORES_GRUPO[grupo] || '#78909c';
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    cargarInvitados();
});

// ── API ───────────────────────────────────────────────────────────────────────

async function cargarInvitados() {
    try {
        const res = await fetch('/api/invitados');
        invitados = await res.json();
        invitadosFiltrados = [...invitados];
        poblarFiltroGrupos();
        renderTabla();
        actualizarEstadisticas();
        renderGrupos();
        renderMesas();
    } catch (e) {
        console.error('Error al cargar invitados:', e);
        showNotification('Error al cargar invitados', 'error');
    }
}

async function guardarInvitado(event) {
    event.preventDefault();
    const id = document.getElementById('invitadoId').value;
    const datos = {
        nombre:    document.getElementById('inputNombre').value.trim(),
        grupo:     document.getElementById('inputGrupo').value,
        telefono:  document.getElementById('inputTelefono').value.trim(),
        email:     document.getElementById('inputEmail').value.trim(),
        menu:      document.getElementById('inputMenu').value.trim(),
        alergias:  document.getElementById('inputAlergias').value.trim(),
        invitacion_enviada: id ? (invitados.find(i => i.id == id)?.invitacion_enviada || false) : false,
        confirmacion: id ? (invitados.find(i => i.id == id)?.confirmacion || 'Pendiente') : 'Pendiente',
        asiste: null,
        mesa: null,
    };

    try {
        const url    = id ? `/api/invitados/${id}` : '/api/invitados';
        const method = id ? 'PUT' : 'POST';
        const res    = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        const result = await res.json();
        if (result.success) {
            await cargarInvitados();
            cerrarModal();
            showNotification(id ? 'Invitado actualizado' : 'Invitado agregado');
        }
    } catch (e) {
        console.error('Error al guardar:', e);
        showNotification('Error al guardar el invitado', 'error');
    }
}

async function actualizarCampo(id, campo, valor) {
    const inv = invitados.find(i => i.id === id);
    if (!inv) return;
    inv[campo] = valor;
    try {
        await fetch(`/api/invitados/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inv),
        });
        if (campo === 'confirmacion') {
            actualizarEstadisticas();
        }
    } catch (e) {
        console.error('Error al actualizar campo:', e);
    }
}

async function confirmarEliminar() {
    if (!idAEliminar) return;
    try {
        await fetch(`/api/invitados/${idAEliminar}`, { method: 'DELETE' });
        await cargarInvitados();
        cerrarModalEliminar();
        showNotification('Invitado eliminado');
    } catch (e) {
        console.error('Error al eliminar:', e);
        showNotification('Error al eliminar', 'error');
    }
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderTabla() {
    const tbody = document.getElementById('invitadosTableBody');
    const noResults = document.getElementById('noResults');

    if (invitadosFiltrados.length === 0 && invitados.length > 0) {
        tbody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    noResults.style.display = 'none';

    if (invitados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center empty-row">
                    <p>No hay invitados aún.</p>
                    <button class="btn btn-primary" onclick="abrirModalAgregar()">Agregar primero</button>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = invitadosFiltrados.map((inv, idx) => `
        <tr>
            <td class="col-num">${idx + 1}</td>
            <td class="col-nombre">${escapeHtml(inv.nombre)}</td>
            <td class="col-grupo">
                <span class="badge-grupo" style="background:${colorGrupo(inv.grupo)}20; color:${colorGrupo(inv.grupo)}; border:1px solid ${colorGrupo(inv.grupo)}40;">
                    ${escapeHtml(inv.grupo)}
                </span>
            </td>
            <td class="col-tel">${inv.telefono ? escapeHtml(inv.telefono) : '<span class="muted">—</span>'}</td>
            <td class="col-inv">
                <label class="toggle-switch">
                    <input type="checkbox" ${inv.invitacion_enviada ? 'checked' : ''}
                           onchange="actualizarCampo(${inv.id}, 'invitacion_enviada', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td class="col-confirm">
                <select class="select-confirmacion estado-${estadoClass(inv.confirmacion)}"
                        onchange="actualizarCampo(${inv.id}, 'confirmacion', this.value)">
                    <option value="Pendiente"  ${inv.confirmacion === 'Pendiente'  ? 'selected' : ''}>⏳ Pendiente</option>
                    <option value="Confirmado" ${inv.confirmacion === 'Confirmado' ? 'selected' : ''}>✅ Confirmado</option>
                    <option value="No Asiste"  ${inv.confirmacion === 'No Asiste'  ? 'selected' : ''}>❌ No Asiste</option>
                </select>
            </td>
            <td class="col-menu">
                <input type="text" class="inline-input" value="${escapeHtml(inv.menu || '')}"
                       placeholder="Menú…"
                       onchange="actualizarCampo(${inv.id}, 'menu', this.value)">
            </td>
            <td class="col-alergias">
                <input type="text" class="inline-input" value="${escapeHtml(inv.alergias || '')}"
                       placeholder="Alergias…"
                       onchange="actualizarCampo(${inv.id}, 'alergias', this.value)">
            </td>
            <td class="col-mesa">
                <input type="number" class="inline-input inline-input--sm" value="${inv.mesa || ''}"
                       placeholder="—" min="1"
                       onchange="actualizarCampo(${inv.id}, 'mesa', this.value ? parseInt(this.value) : null)">
            </td>
            <td class="col-actions">
                <button class="btn-icon btn-edit"   title="Editar"    onclick="abrirModalEditar(${inv.id})">✏️</button>
                <button class="btn-icon btn-delete" title="Eliminar"  onclick="pedirEliminar(${inv.id}, '${escapeHtml(inv.nombre)}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function actualizarEstadisticas() {
    const total       = invitados.length;
    const confirmados = invitados.filter(i => i.confirmacion === 'Confirmado').length;
    const noAsisten   = invitados.filter(i => i.confirmacion === 'No Asiste').length;
    const pendientes  = total - confirmados - noAsisten;

    document.getElementById('stat-total').textContent       = total;
    document.getElementById('stat-confirmados').textContent = confirmados;
    document.getElementById('stat-pendientes').textContent  = pendientes;
    document.getElementById('stat-no-asisten').textContent  = noAsisten;
}

function renderGrupos() {
    const grupos = {};
    invitados.forEach(inv => {
        grupos[inv.grupo] = (grupos[inv.grupo] || 0) + 1;
    });

    const grid = document.getElementById('gruposGrid');
    grid.innerHTML = Object.entries(grupos)
        .sort((a, b) => b[1] - a[1])
        .map(([grupo, count]) => `
            <div class="grupo-card" style="border-left: 4px solid ${colorGrupo(grupo)};">
                <h4 style="color:${colorGrupo(grupo)}">${escapeHtml(grupo)}</h4>
                <p class="grupo-count">${count} persona${count !== 1 ? 's' : ''}</p>
            </div>
        `).join('');
}

function renderMesas() {
    const total = invitados.length;
    const porMesa = 8;
    const numMesas = Math.ceil(total / porMesa);

    document.getElementById('mesasSubtitle').textContent =
        `Para ${total} personas, se recomiendan ~${numMesas} mesas de ${porMesa} personas`;

    const mesaCount = {};
    invitados.forEach(inv => {
        if (inv.mesa) mesaCount[inv.mesa] = (mesaCount[inv.mesa] || 0) + 1;
    });

    const grid = document.getElementById('mesasGrid');
    const celdas = [];
    for (let m = 1; m <= numMesas; m++) {
        const asignados = mesaCount[m] || 0;
        const pct = Math.min((asignados / porMesa) * 100, 100);
        celdas.push(`
            <div class="mesa-card">
                <h4>Mesa ${m}</h4>
                <p>${asignados} / ${porMesa}</p>
                <div class="mesa-bar"><div class="mesa-bar-fill" style="width:${pct}%"></div></div>
            </div>
        `);
    }
    grid.innerHTML = celdas.join('');
}

// ── Filtros ───────────────────────────────────────────────────────────────────

function poblarFiltroGrupos() {
    const grupos = [...new Set(invitados.map(i => i.grupo))].sort();
    const sel = document.getElementById('filterGrupo');
    const current = sel.value;
    sel.innerHTML = '<option value="">Todos los grupos</option>';
    grupos.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        if (g === current) opt.selected = true;
        sel.appendChild(opt);
    });
}

function filtrarInvitados() {
    const texto  = document.getElementById('searchInput').value.toLowerCase();
    const grupo  = document.getElementById('filterGrupo').value;
    const estado = document.getElementById('filterConfirmacion').value;

    invitadosFiltrados = invitados.filter(inv => {
        const matchNombre = inv.nombre.toLowerCase().includes(texto);
        const matchGrupo  = !grupo  || inv.grupo === grupo;
        const matchEstado = !estado || inv.confirmacion === estado;
        return matchNombre && matchGrupo && matchEstado;
    });

    renderTabla();
}

// ── Modales ───────────────────────────────────────────────────────────────────

function abrirModalAgregar() {
    document.getElementById('modalTitulo').textContent = 'Agregar Invitado';
    document.getElementById('invitadoId').value = '';
    document.getElementById('formInvitado').reset();
    document.getElementById('modalInvitado').style.display = 'flex';
}

function abrirModalEditar(id) {
    const inv = invitados.find(i => i.id === id);
    if (!inv) return;
    document.getElementById('modalTitulo').textContent = 'Editar Invitado';
    document.getElementById('invitadoId').value      = inv.id;
    document.getElementById('inputNombre').value     = inv.nombre;
    document.getElementById('inputGrupo').value      = inv.grupo;
    document.getElementById('inputTelefono').value   = inv.telefono || '';
    document.getElementById('inputEmail').value      = inv.email    || '';
    document.getElementById('inputMenu').value       = inv.menu     || '';
    document.getElementById('inputAlergias').value   = inv.alergias || '';
    document.getElementById('modalInvitado').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalInvitado').style.display = 'none';
}

function pedirEliminar(id, nombre) {
    idAEliminar = id;
    document.getElementById('eliminarNombre').textContent = nombre;
    document.getElementById('modalEliminar').style.display = 'flex';
}

function cerrarModalEliminar() {
    idAEliminar = null;
    document.getElementById('modalEliminar').style.display = 'none';
}

// Cerrar modales clickeando el fondo
window.addEventListener('click', e => {
    if (e.target.id === 'modalInvitado')  cerrarModal();
    if (e.target.id === 'modalEliminar')  cerrarModalEliminar();
});

// ── Export ────────────────────────────────────────────────────────────────────

function exportarLista() {
    const filas = [
        ['#', 'Nombre', 'Grupo', 'Teléfono', 'Email', 'Invitación Enviada', 'Confirmación', 'Menú', 'Alergias', 'Mesa'],
        ...invitados.map((inv, i) => [
            i + 1,
            inv.nombre,
            inv.grupo,
            inv.telefono  || '',
            inv.email     || '',
            inv.invitacion_enviada ? 'Sí' : 'No',
            inv.confirmacion,
            inv.menu      || '',
            inv.alergias  || '',
            inv.mesa      || '',
        ])
    ];

    const csv  = filas.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'invitados_casamiento.csv';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Lista exportada');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function estadoClass(confirmacion) {
    if (confirmacion === 'Confirmado') return 'confirmado';
    if (confirmacion === 'No Asiste')  return 'no-asiste';
    return 'pendiente';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showNotification(message, type = 'success') {
    const n = document.createElement('div');
    n.className = 'inv-notification';
    n.textContent = message;
    n.style.cssText = `
        position:fixed; top:20px; right:20px; z-index:99999;
        background:${type === 'success' ? '#4caf50' : '#f44336'};
        color:#fff; padding:.85rem 1.4rem; border-radius:8px;
        box-shadow:0 4px 12px rgba(0,0,0,.18); font-weight:600;
        animation: slideInRight .3s ease;
    `;
    document.body.appendChild(n);
    setTimeout(() => {
        n.style.opacity = '0';
        n.style.transition = 'opacity .3s';
        setTimeout(() => n.remove(), 300);
    }, 2800);
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function switchTab(tab) {
    document.getElementById('view-lista').style.display       = tab === 'lista'       ? '' : 'none';
    document.getElementById('view-prioridades').style.display = tab === 'prioridades' ? '' : 'none';
    document.getElementById('tab-lista').classList.toggle('active',       tab === 'lista');
    document.getElementById('tab-prioridades').classList.toggle('active', tab === 'prioridades');
    if (tab === 'prioridades') renderPrioridades();
}

// ── Drag & Drop ───────────────────────────────────────────────────────────────

let dragId = null;

function renderPrioridades() {
    const sinClasificar = invitados.filter(i => !i.prioridad || i.prioridad === 'Sin clasificar');
    const esenciales    = invitados.filter(i => i.prioridad === 'Esencial');
    const prescindibles = invitados.filter(i => i.prioridad === 'Prescindible');

    document.getElementById('pool-count').textContent        = sinClasificar.length;
    document.getElementById('count-esencial').textContent    = esenciales.length;
    document.getElementById('count-prescindible').textContent = prescindibles.length;

    document.getElementById('pool-sin-clasificar').innerHTML =
        sinClasificar.map(inv => cardHTML(inv)).join('') ||
        '<p class="col-empty">Todos clasificados ✓</p>';

    document.getElementById('cards-esencial').innerHTML =
        esenciales.map(inv => cardHTML(inv)).join('') ||
        '<p class="col-empty">Arrastrá invitados aquí</p>';

    document.getElementById('cards-prescindible').innerHTML =
        prescindibles.map(inv => cardHTML(inv)).join('') ||
        '<p class="col-empty">Arrastrá invitados aquí</p>';
}

function cardHTML(inv) {
    return `
        <div class="prioridad-card" draggable="true"
             id="card-${inv.id}"
             ondragstart="onDragStart(event, ${inv.id})"
             ondragend="onDragEnd(event)">
            <div class="card-nombre">${escapeHtml(inv.nombre)}</div>
            <div class="card-grupo">
                <span class="badge-grupo" style="background:${colorGrupo(inv.grupo)}20; color:${colorGrupo(inv.grupo)}; border:1px solid ${colorGrupo(inv.grupo)}40; font-size:.7rem; padding:.15rem .5rem; border-radius:20px;">
                    ${escapeHtml(inv.grupo)}
                </span>
            </div>
        </div>`;
}

function onDragStart(event, id) {
    dragId = id;
    event.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
        const el = document.getElementById(`card-${id}`);
        if (el) el.classList.add('dragging');
    }, 0);
}

function onDragEnd(event) {
    if (dragId) {
        const el = document.getElementById(`card-${dragId}`);
        if (el) el.classList.remove('dragging');
    }
}

function onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('drag-over');
}

// Limpiar highlight al salir de la zona
document.addEventListener('dragleave', e => {
    const zone = e.target.closest('[ondragover]');
    if (zone) zone.classList.remove('drag-over');
});

async function onDrop(event, nuevaPrioridad) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    if (!dragId) return;

    const inv = invitados.find(i => i.id === dragId);
    if (!inv || inv.prioridad === nuevaPrioridad) { dragId = null; return; }

    inv.prioridad = nuevaPrioridad;

    try {
        await fetch(`/api/invitados/${dragId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inv),
        });
    } catch (e) {
        console.error('Error al guardar prioridad:', e);
        showNotification('Error al guardar', 'error');
    }

    dragId = null;
    renderPrioridades();
}

// ── Estilos inline ────────────────────────────────────────────────────────────

const invitadosStyle = document.createElement('style');
style.textContent = `
@keyframes slideInRight {
    from { transform: translateX(60px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
}

/* Toolbar */
.invitados-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: .75rem;
    margin-bottom: 1.25rem;
}
.toolbar-left  { display:flex; gap:.6rem; flex-wrap:wrap; }
.toolbar-right { display:flex; gap:.6rem; flex-wrap:wrap; align-items:center; }
.toolbar-right input,
.toolbar-right select {
    padding: .55rem .9rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: .9rem;
    background: #fff;
    min-width: 160px;
}
.toolbar-right input:focus,
.toolbar-right select:focus { outline:none; border-color:#b08c5a; }

/* Stats */
.invitados-summary { display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1.5rem; }
.summary-stat {
    flex:1; min-width:100px; text-align:center;
    background:#fff; border-radius:12px;
    padding:1rem .5rem;
    box-shadow:0 2px 8px rgba(0,0,0,.07);
    border-top: 4px solid #ddd;
}
.summary-stat h3 { font-size:2rem; margin:0; font-weight:700; }
.summary-stat p  { margin:.2rem 0 0; font-size:.8rem; color:#888; text-transform:uppercase; letter-spacing:.04em; }
.stat-total      { border-top-color: #b08c5a; }
.stat-total h3   { color: #b08c5a; }
.stat-confirmado { border-top-color: #4caf50; }
.stat-confirmado h3 { color: #4caf50; }
.stat-pendiente  { border-top-color: #ff9800; }
.stat-pendiente h3  { color: #ff9800; }
.stat-no         { border-top-color: #f44336; }
.stat-no h3      { color: #f44336; }

/* Tabla */
.invitados-table-container { overflow-x:auto; border-radius:12px; box-shadow:0 2px 12px rgba(0,0,0,.08); }
.invitados-table { width:100%; border-collapse:collapse; background:#fff; font-size:.88rem; }
.invitados-table thead th {
    background:#f8f5f0; padding:.75rem .9rem;
    text-align:left; font-size:.78rem; text-transform:uppercase;
    letter-spacing:.05em; color:#888; border-bottom:2px solid #ede8df;
    white-space:nowrap;
}
.invitados-table tbody tr { border-bottom:1px solid #f0ece4; transition:background .15s; }
.invitados-table tbody tr:hover { background:#fdfaf6; }
.invitados-table td { padding:.6rem .9rem; vertical-align:middle; }
.col-num   { width:36px; color:#bbb; font-size:.8rem; text-align:center; }
.col-nombre { font-weight:600; }
.col-tel   { color:#666; font-size:.83rem; }
.muted     { color:#ccc; }

/* Badge grupo */
.badge-grupo {
    display:inline-block; padding:.25rem .65rem;
    border-radius:20px; font-size:.75rem; font-weight:600;
    white-space:nowrap;
}

/* Toggle switch */
.toggle-switch { position:relative; display:inline-block; width:38px; height:22px; }
.toggle-switch input { opacity:0; width:0; height:0; }
.toggle-slider {
    position:absolute; cursor:pointer; inset:0;
    background:#ddd; border-radius:22px; transition:.25s;
}
.toggle-slider:before {
    content:''; position:absolute;
    width:16px; height:16px; left:3px; bottom:3px;
    background:#fff; border-radius:50%; transition:.25s;
}
.toggle-switch input:checked + .toggle-slider { background:#4caf50; }
.toggle-switch input:checked + .toggle-slider:before { transform:translateX(16px); }

/* Select confirmación */
.select-confirmacion {
    border:none; border-radius:20px; padding:.25rem .7rem;
    font-size:.8rem; font-weight:600; cursor:pointer;
    outline:none; appearance:none; text-align:center;
}
.estado-confirmado { background:#e8f5e9; color:#2e7d32; }
.estado-pendiente  { background:#fff8e1; color:#e65100; }
.estado-no-asiste  { background:#ffebee; color:#c62828; }

/* Inline inputs */
.inline-input {
    border:1px solid transparent; border-radius:6px;
    padding:.3rem .5rem; font-size:.83rem; width:100%; min-width:80px;
    background:transparent; transition:border .15s, background .15s;
}
.inline-input:hover  { border-color:#ddd; background:#fafafa; }
.inline-input:focus  { border-color:#b08c5a; background:#fff; outline:none; }
.inline-input--sm    { max-width:56px; text-align:center; }

/* Botones acción */
.col-actions { white-space:nowrap; }
.btn-icon {
    background:none; border:none; cursor:pointer; padding:.25rem .35rem;
    border-radius:6px; font-size:1rem; transition:background .15s;
    opacity:.55;
}
.btn-icon:hover { opacity:1; background:#f5f0e8; }

/* Empty / loading */
.empty-row, .loading-row { padding:3rem; color:#aaa; font-size:.95rem; }
.no-results-msg { text-align:center; padding:2rem; color:#aaa; }

/* Grupos */
.grupos-grid {
    display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr));
    gap:1rem; margin-top:.75rem;
}
.grupo-card {
    background:#fff; border-radius:10px; padding:1rem 1.2rem;
    box-shadow:0 2px 8px rgba(0,0,0,.06);
}
.grupo-card h4 { margin:0 0 .3rem; font-size:.9rem; }
.grupo-count   { margin:0; font-size:1.3rem; font-weight:700; color:#333; }

/* Mesas */
.mesas-grid {
    display:grid; grid-template-columns:repeat(auto-fill, minmax(130px,1fr));
    gap:1rem; margin-top:.75rem;
}
.mesa-card {
    background:#fff; border-radius:10px; padding:1rem;
    box-shadow:0 2px 8px rgba(0,0,0,.06); text-align:center;
}
.mesa-card h4 { margin:0 0 .3rem; font-size:.9rem; color:#666; }
.mesa-card p  { margin:0 0 .6rem; font-size:1.1rem; font-weight:700; }
.mesa-bar { background:#f0ece4; border-radius:4px; height:6px; overflow:hidden; }
.mesa-bar-fill { height:100%; background:#b08c5a; border-radius:4px; transition:width .4s; }

/* ── Tabs ── */
.inv-tabs {
    display:flex; gap:.5rem; margin-bottom:1.5rem;
    border-bottom:2px solid #ede8df; padding-bottom:0;
}
.inv-tab {
    background:none; border:none; cursor:pointer;
    padding:.65rem 1.4rem; font-size:.95rem; font-weight:600; color:#999;
    border-bottom:3px solid transparent; margin-bottom:-2px;
    border-radius:6px 6px 0 0; transition:color .15s, border-color .15s;
}
.inv-tab:hover  { color:#b08c5a; }
.inv-tab.active { color:#b08c5a; border-bottom-color:#b08c5a; background:#fdfaf6; }

/* ── Prioridades ── */
.prioridades-hint {
    color:#888; font-size:.88rem; margin-bottom:1.25rem;
    padding:.6rem 1rem; background:#fdfaf6; border-radius:8px;
    border-left:3px solid #b08c5a;
}
.prioridades-pool-wrap { margin-bottom:1.5rem; }
.pool-titulo {
    font-size:1rem; color:#555; margin:0 0 .75rem; display:flex; align-items:center; gap:.5rem;
}
.pool-badge {
    background:#888; color:#fff; border-radius:20px;
    padding:.15rem .65rem; font-size:.8rem; font-weight:700;
}
.prioridades-pool {
    display:flex; flex-wrap:wrap; gap:.6rem;
    min-height:64px; padding:.75rem;
    background:#f8f5f0; border:2px dashed #ddd; border-radius:12px;
    transition:background .15s, border-color .15s;
}
.prioridades-pool.drag-over { background:#fef9f0; border-color:#b08c5a; }

.prioridades-cols {
    display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;
    margin-bottom:1.5rem;
}
@media(max-width:640px){ .prioridades-cols { grid-template-columns:1fr; } }

.prioridad-col {
    border-radius:14px; overflow:hidden;
    box-shadow:0 2px 12px rgba(0,0,0,.08);
    display:flex; flex-direction:column;
    min-height:260px; transition:box-shadow .15s;
}
.prioridad-col.drag-over { box-shadow:0 4px 20px rgba(0,0,0,.15); }

.col-header {
    display:flex; align-items:center; gap:.9rem;
    padding:1rem 1.2rem; color:#fff;
}
.col-header--esencial    { background: linear-gradient(135deg,#f59e0b,#d97706); }
.col-header--prescindible { background: linear-gradient(135deg,#6b7280,#4b5563); }
.col-icon { font-size:1.6rem; }
.col-header h3 { margin:0; font-size:1rem; }
.col-header p  { margin:.1rem 0 0; font-size:.78rem; opacity:.85; }
.col-count {
    margin-left:auto; background:rgba(255,255,255,.25);
    border-radius:20px; padding:.2rem .75rem;
    font-size:1.1rem; font-weight:700;
}

.col-cards {
    flex:1; padding:.75rem; display:flex; flex-direction:column; gap:.5rem;
    background:#fff; min-height:160px;
    transition:background .15s;
}
.col-esencial.drag-over    .col-cards { background:#fffbeb; }
.col-prescindible.drag-over .col-cards { background:#f9fafb; }

.col-empty { color:#bbb; font-size:.85rem; margin:auto; text-align:center; padding:1rem 0; }

/* Tarjeta arrastrable */
.prioridad-card {
    background:#fff; border:1px solid #ede8df; border-radius:10px;
    padding:.6rem .9rem; cursor:grab;
    display:flex; align-items:center; justify-content:space-between; gap:.6rem;
    box-shadow:0 1px 4px rgba(0,0,0,.06);
    transition:box-shadow .15s, transform .15s, opacity .15s;
    user-select:none;
}
.prioridad-card:hover   { box-shadow:0 4px 12px rgba(0,0,0,.12); transform:translateY(-1px); }
.prioridad-card.dragging { opacity:.4; transform:scale(.97); }
.card-nombre { font-weight:600; font-size:.88rem; }
.card-grupo  { flex-shrink:0; }

/* Pool cards son un poco más chicas */
.prioridades-pool .prioridad-card {
    padding:.45rem .75rem; background:#fff;
}

/* Modal */
.modal {
    position:fixed; inset:0; background:rgba(0,0,0,.5);
    display:flex; align-items:center; justify-content:center; z-index:10000;
}
.modal-content {
    background:#fff; border-radius:14px; padding:2rem;
    max-width:520px; width:90%; max-height:90vh; overflow-y:auto;
    position:relative; box-shadow:0 8px 32px rgba(0,0,0,.18);
}
.modal-confirm { max-width:380px; text-align:center; }
.modal-close {
    position:absolute; top:1rem; right:1.2rem;
    font-size:1.6rem; cursor:pointer; color:#bbb; line-height:1;
}
.modal-close:hover { color:#333; }
.modal-content h2 { margin:0 0 1.25rem; }
.form-row { display:flex; gap:1rem; flex-wrap:wrap; }
.form-row .form-group { flex:1; min-width:140px; }
.form-group { margin-bottom:1rem; }
.form-group label { display:block; margin-bottom:.4rem; font-weight:600; font-size:.88rem; }
.form-group input,
.form-group select {
    width:100%; padding:.7rem .9rem;
    border:1px solid #ddd; border-radius:8px; font-size:.95rem; box-sizing:border-box;
}
.form-group input:focus,
.form-group select:focus { outline:none; border-color:#b08c5a; }
.form-actions { display:flex; gap:.75rem; margin-top:1.25rem; }
.form-actions button { flex:1; }
.btn-danger { background:#f44336; color:#fff; border:none; border-radius:8px; padding:.75rem; cursor:pointer; font-weight:600; }
.btn-danger:hover { background:#d32f2f; }
`;
document.head.appendChild(invitadosStyle);
