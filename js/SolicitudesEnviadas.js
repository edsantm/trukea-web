const API_BASE_URL = 'http://localhost:8082/api';

// Función para mostrar banner (adaptada a tu estructura)
function mostrarBanner(mensaje, tipo) {
  // Obtener o crear elemento de banner
  let banner = document.querySelector('.banner-mensaje');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'banner-mensaje';
    document.body.insertBefore(banner, document.body.firstChild);
  }

  banner.textContent = mensaje;
  if (tipo === "exito") {
    banner.style.backgroundColor = "#dbf7e3";
    banner.style.color = "#179e4a";
  } else {
    banner.style.backgroundColor = "#f8d7da";
    banner.style.color = "#842029";
  }
  banner.style.display = "block";
  
  setTimeout(() => {
    banner.style.display = "none";
  }, 4000);
}

// Función para eliminar solicitud de la API
async function eliminarSolicitud(truequeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/trueques/${truequeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    throw error;
  }
}

// Función para animar y eliminar el elemento del DOM
function eliminarElementoConAnimacion(elemento) {
  return new Promise((resolve) => {
    // Agregar clase de animación de salida
    elemento.style.transition = 'all 0.5s ease-out';
    elemento.style.transform = 'translateX(-100%)';
    elemento.style.opacity = '0';
    elemento.style.maxHeight = elemento.offsetHeight + 'px';
    
    setTimeout(() => {
      elemento.style.maxHeight = '0';
      elemento.style.padding = '0';
      elemento.style.margin = '0';
      
      setTimeout(() => {
        if (elemento.parentNode) {
          elemento.parentNode.removeChild(elemento);
        }
        resolve();
      }, 300);
    }, 200);
  });
}

// Función para manejar la cancelación de solicitud
async function cancelarSolicitud(event) {
  const boton = event.target;
  const solicitudElement = boton.closest('.solicitud');
  
  // Obtener el ID del trueque (esto debería venir de los datos cargados)
  const truequeId = solicitudElement.dataset.truequeId;
  
  if (!truequeId) {
    mostrarBanner('❌ Error: No se pudo identificar la solicitud', 'error');
    return;
  }

  // Confirmar la acción
  if (!confirm('¿Estás seguro de que deseas cancelar esta solicitud de trueque?')) {
    return;
  }

  try {
    // Deshabilitar botón y cambiar texto
    const botonesAccion = solicitudElement.querySelectorAll('.acciones button');
    botonesAccion.forEach(btn => {
      btn.disabled = true;
      if (btn === boton) {
        btn.textContent = 'Cancelando...';
        btn.style.opacity = '0.6';
      }
    });

    // Llamar a la API para eliminar
    await eliminarSolicitud(truequeId);
    
    // Mostrar mensaje de éxito
    mostrarBanner('✅ Solicitud cancelada exitosamente', 'exito');
    
    // Eliminar elemento del DOM con animación
    await eliminarElementoConAnimacion(solicitudElement);
    
    // Verificar si no quedan más solicitudes
    const solicitudesRestantes = document.querySelectorAll('.solicitud');
    if (solicitudesRestantes.length === 0) {
      mostrarMensajeSinSolicitudes();
    }

  } catch (error) {
    console.error('Error al cancelar solicitud:', error);
    
    // Manejar diferentes tipos de errores
    let mensajeError = '❌ Error al cancelar la solicitud';
    if (error.message.includes('404')) {
      mensajeError = '❌ La solicitud ya no existe';
    } else if (error.message.includes('500')) {
      mensajeError = '❌ Error del servidor. Inténtalo más tarde';
    }
    
    mostrarBanner(mensajeError, 'error');
    
    // Rehabilitar botones
    const botonesAccion = solicitudElement.querySelectorAll('.acciones button');
    botonesAccion.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
      if (btn === boton) {
        btn.textContent = 'Cancelar';
      }
    });
  }
}

// Función para mostrar mensaje cuando no hay solicitudes
function mostrarMensajeSinSolicitudes() {
  const contenedor = document.querySelector('.solicitudes-contenedor');
  contenedor.innerHTML = `
    <div class="sin-solicitudes">
      <img src="/img/sin-solicitudes.png" alt="Sin solicitudes" class="icono-vacio">
      <h3>No tienes solicitudes enviadas</h3>
      <p>Cuando envíes solicitudes de trueque, aparecerán aquí</p>
      <a href="/vistas/ExplorarTrueque.html" class="btn-explorar">Explorar Trueques</a>
    </div>
  `;
}

// Función para renderizar solicitudes (opcional - para datos reales)
function renderizarSolicitudes(solicitudes) {
  const contenedor = document.querySelector('.solicitudes-contenedor');
  
  if (solicitudes.length === 0) {
    mostrarMensajeSinSolicitudes();
    return;
  }

  contenedor.innerHTML = solicitudes.map(solicitud => `
    <div class="solicitud" data-trueque-id="${solicitud.id}">
      <div class="imagenes">
        <img src="${solicitud.productoRecibido?.imagen || 'producto-default.jpg'}" alt="Producto recibido">
        <span class="flecha">→</span>
        <img src="${solicitud.productoOfrecido?.imagen || 'producto-default.jpg'}" alt="Producto ofrecido">
      </div>
      <input type="text" value="${solicitud.nombreUsuarioReceptor || 'Usuario'}" readonly>
      <div class="acciones">
        <button class="rechazar">${solicitud.estado || 'Pendiente'}</button>
        <button class="aceptar cancelar-btn">Cancelar</button>
      </div>
    </div>
  `).join('');

  // Agregar event listeners a los nuevos botones
  agregarEventListeners();
}

// Función para agregar event listeners
function agregarEventListeners() {
  const botonesCancelar = document.querySelectorAll('.aceptar, .cancelar-btn');
  botonesCancelar.forEach(boton => {
    // Remover listeners existentes para evitar duplicados
    boton.removeEventListener('click', cancelarSolicitud);
    boton.addEventListener('click', cancelarSolicitud);
  });
}

// Función para agregar IDs temporales a solicitudes existentes (para testing)
function agregarIdsTemporal() {
  const solicitudes = document.querySelectorAll('.solicitud:not([data-trueque-id])');
  solicitudes.forEach((solicitud, index) => {
    solicitud.dataset.truequeId = `temp_${Date.now()}_${index}`;
  });
}

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
  // Agregar IDs temporales para testing con solicitudes estáticas
  agregarIdsTemporal();
  
  // Agregar event listeners a botones existentes
  agregarEventListeners();
  
  // Opcional: Cargar solicitudes reales desde la API
  // cargarSolicitudesEnviadas();
});

// Agregar estilos CSS para el banner y animaciones
const estilos = document.createElement('style');
estilos.textContent = `
  .banner-mensaje {
    position: fixed;
    top: 0;
    width:100%;
    text-align:center;
    right: 20px;
    padding: 15px 15px;
    border-radius: 0px;
    font-weight: bold;
    z-index: 1000;
    display: none;
    box-sizzing: border-box;
  }
  
  .sin-solicitudes {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }
  
  .sin-solicitudes .icono-vacio {
    width: 80px;
    height: 80px;
    opacity: 0.5;
    margin-bottom: 20px;
  }
  
  .btn-explorar {
    display: inline-block;
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 20px;
  }
  
  .btn-explorar:hover {
    background-color: #0056b3;
  }
`;
document.head.appendChild(estilos);