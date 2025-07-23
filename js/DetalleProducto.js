// Configuración de la API
const API_BASE_URL = 'https://tu-api.com'; // Cambia por tu URL real
const API_ENDPOINTS = {
    producto: '/api/productos',
    usuario: '/api/usuarios'
};

// Variables globales
let productoActual = null;
let usuarioActual = null;

// Función para obtener parámetros de la URL
function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

// Función para mostrar estados de carga
function toggleLoading(mostrar) {
    const main = document.querySelector('.detalle-contenedor');
    if (mostrar) {
        main.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando detalles del producto...</p>
            </div>
        `;
    }
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const main = document.querySelector('.detalle-contenedor');
    main.innerHTML = `
        <div class="error-container">
            <h2>❌ Error</h2>
            <p>${mensaje}</p>
            <button onclick="window.history.back()" class="btn-volver">Volver atrás</button>
        </div>
    `;
}

// Función para cargar los detalles del producto
async function cargarDetalleProducto(productoId) {
    try {
        toggleLoading(true);

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.producto}/${productoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo cargar el producto`);
        }

        const producto = await response.json();
        productoActual = producto;

        // Cargar información del usuario propietario
        await cargarInfoUsuario(producto.usuarioId);
        
        // Renderizar el producto
        renderizarProducto(producto);

    } catch (error) {
        console.error('Error al cargar el producto:', error);
        mostrarError('No se pudo cargar la información del producto. Por favor, intenta de nuevo.');
    }
}

// Función para cargar información del usuario
async function cargarInfoUsuario(usuarioId) {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.usuario}/${usuarioId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            usuarioActual = await response.json();
        }
    } catch (error) {
        console.error('Error al cargar información del usuario:', error);
        // No es crítico, continuamos sin la info del usuario
    }
}

// Función para renderizar el producto
function renderizarProducto(producto) {
    const main = document.querySelector('.detalle-contenedor');
    
    main.innerHTML = `
        <h1>${producto.nombre || 'Producto sin nombre'}</h1>

        <div class="contenido-principal">
            <!-- Galería de imágenes -->
            <div class="galeria">
                <div class="img-principal">
                    <img src="${producto.imagenes?.[0] || 'img/placeholder.jpg'}" 
                         alt="${producto.nombre}"
                         onerror="this.src='img/placeholder.jpg'">
                </div>
                <div class="img-secundarias">
                    ${crearImagenesSecundarias(producto.imagenes)}
                </div>
            </div>

            <!-- Información de usuario -->
            <div class="info-usuario">
                <div class="foto-perfil">
                    <img src="${usuarioActual?.fotoPerfil || 'img/user-placeholder.jpg'}" 
                         alt="Foto de perfil"
                         onerror="this.src='img/user-placeholder.jpg'">
                </div>
                <p><strong>Nombre de usuario:</strong> ${usuarioActual?.nombre || 'Usuario'}</p>
                <p><strong>Información de usuario:</strong> ${usuarioActual?.descripcion || 'Sin información adicional'}</p>
                <button onclick="proponerTrueque('${producto.id}')" class="btn-editar">
                    Proponer trueque
                </button>
            </div>
        </div>

        <!-- Descripción -->
        <div class="descripcion">
            <button class="btn-descripcion" onclick="toggleDescripcion()">
                • Descripción del producto
            </button>
            <div class="descripcion-contenido" id="descripcion-contenido" style="display: none;">
                <p>${producto.descripcion || 'Sin descripción disponible'}</p>
                <div class="detalles-producto">
                    <p><strong>Categoría:</strong> ${producto.categoria || 'Sin categoría'}</p>
                    <p><strong>Estado:</strong> ${producto.estado || 'No especificado'}</p>
                    <p><strong>Ubicación:</strong> ${producto.ubicacion || 'No especificada'}</p>
                    ${producto.fechaPublicacion ? `<p><strong>Publicado:</strong> ${formatearFecha(producto.fechaPublicacion)}</p>` : ''}
                </div>
            </div>
        </div>

        <!-- Productos aceptados -->
        <div class="productos-aceptados">
            <p>Acepto productos como:</p>
            <div class="productos-grid">
                ${crearProductosAceptados(producto.productosAceptados)}
            </div>
        </div>
    `;

    // Agregar event listeners para la galería
    configurarGaleria();
}

// Función para crear imágenes secundarias
function crearImagenesSecundarias(imagenes) {
    if (!imagenes || imagenes.length <= 1) {
        return '<div class="img-mini"></div><div class="img-mini"></div>';
    }

    return imagenes.slice(1, 3).map(imagen => `
        <div class="img-mini" onclick="cambiarImagenPrincipal('${imagen}')">
            <img src="${imagen}" alt="Imagen del producto" onerror="this.src='img/placeholder.jpg'">
        </div>
    `).join('') + (imagenes.length === 2 ? '<div class="img-mini"></div>' : '');
}

// Función para crear productos aceptados
function crearProductosAceptados(productosAceptados) {
    if (!productosAceptados || productosAceptados.length === 0) {
        return Array(4).fill('<div class="producto"><p>Cualquier producto</p></div>').join('');
    }

    const productos = productosAceptados.slice(0, 4);
    const productosHTML = productos.map(producto => `
        <div class="producto">
            ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='img/placeholder.jpg'">` : ''}
            <p>${producto.nombre || producto}</p>
        </div>
    `).join('');

    // Rellenar con divs vacíos si hay menos de 4
    const productosVacios = Array(4 - productos.length).fill('<div class="producto"></div>').join('');
    
    return productosHTML + productosVacios;
}

// Función para cambiar imagen principal
function cambiarImagenPrincipal(nuevaImagen) {
    const imgPrincipal = document.querySelector('.img-principal img');
    if (imgPrincipal) {
        imgPrincipal.src = nuevaImagen;
    }
}

// Función para configurar la galería
function configurarGaleria() {
    const imagenesSecundarias = document.querySelectorAll('.img-mini img');
    imagenesSecundarias.forEach(img => {
        img.addEventListener('click', function() {
            // Remover clase activa de todas las imágenes
            imagenesSecundarias.forEach(i => i.classList.remove('activa'));
            // Agregar clase activa a la imagen clickeada
            this.classList.add('activa');
        });
    });
}

// Función para toggle de descripción
function toggleDescripcion() {
    const contenido = document.getElementById('descripcion-contenido');
    const boton = document.querySelector('.btn-descripcion');
    
    if (contenido.style.display === 'none' || contenido.style.display === '') {
        contenido.style.display = 'block';
        boton.textContent = '▼ Descripción del producto';
    } else {
        contenido.style.display = 'none';
        boton.textContent = '• Descripción del producto';
    }
}

// Función para proponer trueque
function proponerTrueque(productoId) {
    // Verificar si el usuario está logueado
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para proponer un trueque');
        window.location.href = '/vistas/Login.html';
        return;
    }

    // Verificar que no sea el propio producto del usuario
    const usuarioIdActual = localStorage.getItem('usuarioId');
    if (productoActual && productoActual.usuarioId === usuarioIdActual) {
        alert('No puedes proponer un trueque con tu propio producto');
        return;
    }

    // Redirigir a la página de proponer trueque con el ID del producto
    window.location.href = `/vistas/ProponerTrueque.html?productoId=${productoId}`;
}

// Función para formatear fecha
function formatearFecha(fecha) {
    try {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return fecha;
    }
}

// Función para manejar el botón de volver
function volverAtras() {
    window.history.back();
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    const productoId = obtenerParametroURL('id') || obtenerParametroURL('productoId');
    
    if (!productoId) {
        mostrarError('No se especificó qué producto mostrar. Verifica el enlace.');
        return;
    }

    cargarDetalleProducto(productoId);
});

// Función para recargar el producto (útil para botones de refresh)
function recargarProducto() {
    const productoId = obtenerParametroURL('id') || obtenerParametroURL('productoId');
    if (productoId) {
        cargarDetalleProducto(productoId);
    }
}
