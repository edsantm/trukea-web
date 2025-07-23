
const API_CONFIG = {
    baseUrl: 'https://tu-api.com/api', // Cambia por tu URL de API
    endpoints: {
        productos: '/productos'
    }
};

// Función para hacer peticiones a la API
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en la API:', error);
        throw error;
    }
}

// Función para crear el HTML de un producto (estilo card)
function createProductHTML(producto) {
    return `
        <div class="producto" data-id="${producto.id || ''}">
                <img src="${producto.imagen || 'https://via.placeholder.com/120'}" 
                     alt="${producto.nombre || 'Producto'}" 
                     onerror="this.src='https://via.placeholder.com/120?text=Sin+Imagen'" />
            <div class="info">
                <h3>${producto.nombre || 'Sin nombre'}</h3>
                <p class="descripcion">${producto.descripcion || 'Sin descripción'}</p>
                <p class="estado">Estado: ${producto.estado || 'No especificado'}</p>
            </div>
            <div class="acciones">
                <button class="editar" onclick="window.location.href='EditarProducto.html?id=${producto.id || ''}'">
                    Editar
                </button>
                <button class="eliminar" onclick="eliminarProducto('${producto.id || ''}')">
                    Eliminar
                </button>
            </div>
        </div>
    `;
}

// Función para renderizar todos los productos
function renderProducts(productos) {
    const productosContainer = document.getElementById('productos');
    
    if (!productos || productos.length === 0) {
        productosContainer.innerHTML = `
            <div class="no-products">
                <h3>No hay productos disponibles</h3>
                <p>Agrega tu primer producto para comenzar.</p>
            </div>
        `;
    } else {
        productosContainer.innerHTML = productos.map(createProductHTML).join('');
    }
}

// Función para mostrar estados de carga y error
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const productosDiv = document.getElementById('productos');
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    productosDiv.style.display = 'none';
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';
}

function showProducts() {
    const productosDiv = document.getElementById('productos');
    productosDiv.style.display = 'grid';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    const loadingDiv = document.getElementById('loading');
    const productosDiv = document.getElementById('productos');
    
    loadingDiv.style.display = 'none';
    productosDiv.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
}

// Función para eliminar producto
async function eliminarProducto(productId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/productos/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Agregar headers de autenticación si es necesario
                // 'Authorization': 'Bearer ' + token
            }
        });

        if (response.ok) {
            // Mostrar mensaje de éxito
            alert('Producto eliminado exitosamente');
            // Recargar los productos después de eliminar
            cargarProductos();
        } else {
            const errorData = await response.json();
            alert(`Error al eliminar el producto: ${errorData.message || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error de conexión al eliminar el producto');
    }
}

// Función principal para cargar productos desde API real
async function cargarProductos() {
    try {
        showLoading();
        
        // Cargar productos desde la API
        const productos = await fetchFromAPI(API_CONFIG.endpoints.productos);
        
        // Renderizar productos
        renderProducts(productos);
        
        // Mostrar contenedor de productos
        hideLoading();
        showProducts();
        
        console.log(`Productos cargados: ${productos.length}`);
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        showError('Error al cargar los productos. Por favor, intenta de nuevo más tarde.');
    }
}

// Función con datos de ejemplo para testing (sin API)
function cargarProductosEjemplo() {
    const productosEjemplo = [
        {
            id: 1,
            nombre: "Headphones",
            descripcion: "Los intercambio por Airpods",
            estado: "semi-nuevo",
            imagen: "https://i.imgur.com/WYzQ2g2.png",
            categoria: "Electrónicos",
            precio: 150
        },
        {
            id: 2,
            nombre: "Suéter",
            descripcion: "Lo intercambio por un pantalón. Es talla M por un pantalón talla 38",
            estado: "semi-nuevo",
            imagen: "https://i.imgur.com/5X4XXuA.png",
            categoria: "Ropa"
        },
        {
            id: 3,
            nombre: "Teclado",
            descripcion: "Lo intercambio por un mouse",
            estado: "dos años de uso",
            imagen: "https://i.imgur.com/mWBQIWU.png",
            categoria: "Electrónicos",
            precio: 75
        }
         ,
        {
            id: 4,
            nombre: "Teclado",
            descripcion: "Lo intercambio por un mouse",
            estado: "dos años de uso",
            imagen: "https://i.imgur.com/mWBQIWU.png",
            categoria: "Electrónicos",
            precio: 75
        }
    ];

    // Simular delay de red
    showLoading();
    setTimeout(() => {
        hideLoading();
        showProducts();
        renderProducts(productosEjemplo);
        console.log(`Productos de ejemplo cargados: ${productosEjemplo.length}`);
    }, 1000);
}

// Función para filtrar productos (funcionalidad extra)
function filtrarProductos(termino) {
    const productos = document.querySelectorAll('.producto');
    const terminoLower = termino.toLowerCase();
    
    productos.forEach(producto => {
        const nombre = producto.querySelector('h3').textContent.toLowerCase();
        const descripcion = producto.querySelector('.descripcion').textContent.toLowerCase();
        
        if (nombre.includes(terminoLower) || descripcion.includes(terminoLower)) {
            producto.style.display = 'block';
        } else {
            producto.style.display = 'none';
        }
    });
}

// Función para recargar productos (útil para botón de refresh)
function recargarProductos() {
    cargarProductos();
}

// Función para agregar listeners de eventos adicionales
function setupEventListeners() {
    // Agregar funcionalidad de búsqueda si existe un input de búsqueda
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filtrarProductos(e.target.value);
        });
    }
    
    // Agregar listener para botón de recarga si existe
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', recargarProductos);
    }
}

// Función de inicialización
function initProductos() {
    // Verificar que existan los elementos necesarios en el DOM
    if (!document.getElementById('productos')) {
        console.error('Error: No se encontró el elemento con ID "productos"');
        return;
    }
    
    // Configurar event listeners adicionales
    setupEventListeners();
    
    // Cargar productos
    // Cambia entre estas dos opciones según tu necesidad:
    
    // Para API real:
    // cargarProductos();
    
    // Para datos de ejemplo (testing):
    cargarProductosEjemplo();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initProductos);

// Exportar funciones para uso externo si es necesario
window.ProductosManager = {
    cargarProductos,
    cargarProductosEjemplo,
    recargarProductos,
    filtrarProductos,
    eliminarProducto
};