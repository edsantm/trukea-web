const API_BASE_URL = 'http://localhost:3000/api'; 
const API_ENDPOINTS = {
    solicitudesRecibidas: '/api/',
    solicitudesEnviadas: '/api/solicitudes/enviadas'
};

// Elementos del DOM
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const solicitudesContainer = document.getElementById('solicitudes');

// Función para mostrar/ocultar elementos
function toggleElements(loading = false, error = false, content = false) {
    loadingElement.style.display = loading ? 'block' : 'none';
    errorElement.style.display = error ? 'block' : 'none';
    solicitudesContainer.style.display = content ? 'block' : 'none';
}

// Función para mostrar errores
function mostrarError(mensaje) {
    errorElement.textContent = mensaje;
    toggleElements(false, true, false);
}

// Función para crear una solicitud individual
function crearSolicitudHTML(solicitud) {
    const solicitudDiv = document.createElement('div');
    solicitudDiv.className = 'solicitud';
    solicitudDiv.dataset.solicitudId = solicitud.id;

    solicitudDiv.innerHTML = `
        <div class="imagenes">
            <img src="${solicitud.productoRecibido.imagen || 'img/placeholder.jpg'}" 
                 alt="${solicitud.productoRecibido.nombre || 'Producto recibido'}"
                 onerror="this.src='img/placeholder.jpg'">
            <span class="flecha">→</span>
            <img src="${solicitud.productoOfrecido.imagen || 'img/placeholder.jpg'}" 
                 alt="${solicitud.productoOfrecido.nombre || 'Producto ofrecido'}"
                 onerror="this.src='img/placeholder.jpg'">
        </div>
        <input type="text" 
               placeholder="Nombre de usuario" 
               value="${solicitud.nombreUsuario || ''}" 
               readonly>
        <div class="acciones">
            <button class="rechazar" onclick="rechazarSolicitud('${solicitud.id}')">
                Rechazar
            </button>
            <button class="aceptar" onclick="aceptarSolicitud('${solicitud.id}')">
                Aceptar
            </button>
        </div>
    `;

    return solicitudDiv;
}

// Función para cargar y renderizar solicitudes
async function cargarSolicitudes(tipo = 'recibidas') {
    try {
        toggleElements(true, false, false);

        const endpoint = tipo === 'recibidas' 
            ? API_ENDPOINTS.solicitudesRecibidas 
            : API_ENDPOINTS.solicitudesEnviadas;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Limpiar container anterior
        solicitudesContainer.innerHTML = '';

        if (!data.solicitudes || data.solicitudes.length === 0) {
            solicitudesContainer.innerHTML = `
                <div class="no-solicitudes">
                    <p>No tienes solicitudes ${tipo} en este momento.</p>
                </div>
            `;
            toggleElements(false, false, true);
            return;
        }

        // Crear elementos para cada solicitud
        data.solicitudes.forEach(solicitud => {
            const solicitudElement = crearSolicitudHTML(solicitud);
            solicitudesContainer.appendChild(solicitudElement);
        });

        toggleElements(false, false, true);

    } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        mostrarError(`Error al cargar las solicitudes: ${error.message}`);
    }
}

// Función para aceptar solicitud
async function aceptarSolicitud(solicitudId) {
    try {
        const response = await fetch(`${API_BASE_URL}/trades/accept/${solicitudId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al aceptar la solicitud');
        }

        // Mostrar mensaje de éxito
        mostrarAlerta('✅ Solicitud de trueque aceptada.', 'success');
        
        // Recargar solicitudes
        await cargarSolicitudes();
        
        
    } catch (error) {
        console.error('Error al aceptar solicitud:', error);
        mostrarAlerta('❌ Error al aceptar la solicitud', 'error');
    }
}

// Función para rechazar solicitud
async function rechazarSolicitud(solicitudId) {
    if (!confirm('¿Estás seguro de que quieres rechazar esta solicitud?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/trades/reject/${solicitudId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al rechazar la solicitud');
        }

        // Mostrar mensaje de éxito
        mostrarAlerta('✅ Solicitud rechazada.', 'info');
        
        // Recargar solicitudes
        await cargarSolicitudes();

    } catch (error) {
        console.error('Error al rechazar solicitud:', error);
        mostrarAlerta('❌ Error al rechazar la solicitud', 'error');
    }
}

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'info') {
    // Crear elemento de alerta si no existe
    let alerta = document.querySelector('.alerta');
    if (!alerta) {
        alerta = document.createElement('div');
        alerta.className = `alerta alerta-${tipo}`;
        document.body.insertBefore(alerta, document.body.firstChild);
    }

    alerta.textContent = mensaje;
    alerta.style.display = 'block';

    // Ocultar después de 3 segundos
    setTimeout(() => {
        alerta.style.display = 'none';
    }, 3000);
}

// Función para manejar tabs
function cambiarTab(tipoSolicitud) {
    // Actualizar clases activas
    document.querySelectorAll('.tab-btn, .tabs button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Cargar solicitudes del tipo correspondiente
    cargarSolicitudes(tipoSolicitud);
}

// Event listeners para tabs
document.addEventListener('DOMContentLoaded', function() {
    // Cargar solicitudes recibidas por defecto
    cargarSolicitudes('recibidas');

    // Event listeners para tabs si están en la misma página
    const tabRecibidas = document.querySelector('.tabs button');
    const tabEnviadas = document.querySelector('.tabs .tab-btn');

    if (tabRecibidas) {
        tabRecibidas.addEventListener('click', () => cambiarTab('recibidas'));
    }

    if (tabEnviadas) {
        tabEnviadas.addEventListener('click', (e) => {
            e.preventDefault();
            cambiarTab('enviadas');
        });
    }
});

// Función para recargar solicitudes (útil para botones de refresh)
function recargarSolicitudes() {
    const tipoActual = document.querySelector('.tabs .active').textContent.includes('recibidas') 
        ? 'recibidas' 
        : 'enviadas';
    cargarSolicitudes(tipoActual);
}

