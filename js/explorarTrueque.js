
const API_CONFIG = {
    baseUrl: 'http://54.87.124.61/api',
    endpoints: {
        productos: '/products'
    }
};

// Función para hacer peticiones a la API
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        return data.data.products;
    } catch (error) {
        console.error(' Error en la API:', error);
        throw error;
    }
}
function createProductHTML(producto) {

    return `
        <div class="producto" data-id="${producto.id || ''}">
                <img src="${producto.imagen || ''}" 
                    alt="${producto.nombre || 'Producto'}" 
                    onerror="this.src=''" />
            <div class="info">
                <h3>${producto.nombre || 'Sin nombre'}</h3>
                <p class="descripcion">${producto.descripcion || 'Sin descripción'}</p>
                <p class="estado">Estado: ${producto.estado || 'No especificado'}</p>
                <p class="valorEstimado">Valor Estimado: ${producto.valorEstimado || 'No especificado'}</p>
            </div>
                <button class="ver-btn" onclick="detalleProducto('${producto.id || ''}')">
                    Detalles del producto
                </button>
        </div>
    `;
}


function adaptarProductoAPI(producto) {

    const calidadId = producto.idCalidad || producto.calidad;
    const estado = producto.calidadNombre || calidadTexto[calidadId] || 'No especificado';

    return {
        id: producto.idProducto || producto.id || '',
        nombre: producto.nombreProducto || producto.nombre || 'Sin nombre',
        descripcion: producto.descripcionProducto || producto.descripcion || 'Sin descripción',
        estado: estado,
        valorEstimado: producto.valorEstimado,
        imagen: producto.imagen || '',
        categoria: producto.idCategoria || producto.categoriaNombre || null,
        calidad: calidadId
    };
}


// Función para renderizar productos - CORREGIDA
function renderProducts(productos) {
    
    const productosContainer = document.getElementById('container-productos');
    
    if (!productosContainer) {
        console.error(' No se encontró el elemento con ID "productos"');
        return;
    }
    
    if (!productos || productos.length === 0) {
        console.log(' No hay productos para mostrar');
        showMessage('No hay productos para mostrar', "error")
        productosContainer.innerHTML = `
            <div class="no-products">
                <h3>No hay productos disponibles</h3>
                <p>Agrega tu primer producto para comenzar.</p>
                <button onclick="window.location.href='AgregarProducto.html'" class="btn-agregar">
                    Agregar Producto
                </button>
            </div>
        `;
    } else {
        const productosAdaptados = productos.map(adaptarProductoAPI);
        productosContainer.innerHTML = productosAdaptados.map(createProductHTML).join('');
        console.log(' HTML insertado en el DOM');
    }
}

// Funciones de estado de carga - CORREGIDAS
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    const messageDiv = document.getElementById('message');
    const productosDiv = document.getElementById('productos');
    
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (messageDiv) messageDiv.style.display = 'none';
    if (productosDiv) productosDiv.style.display = 'none';
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) loadingDiv.style.display = 'none';
}

function showProducts() {
    const productosDiv = document.getElementById('productos');
    if (productosDiv) productosDiv.style.display = 'grid';
}

function showMessage(message, tipo = 'info') {
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');

    messageDiv.className= 'message';

    switch (tipo) {
        case 'success':
            messageDiv.classList.add('message-success');
            break;
        case 'error':
            messageDiv.classList.add('message-error');
            break;
        case 'warning':
            messageDiv.classList.add('message-warning');
            break;
        default:
            messageDiv.classList.add('message-info');
    }
    
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (messageDiv) {
        messageDiv.style.display = 'block';
        messageDiv.textContent = message;
    }
}


function detalleProducto(productId) {
    if (!productId || productId === '') {
        alert('ID de producto no válido');
        return;
    }
    
    console.log(` Redirigiendo a editar producto con ID: ${productId}`);
    
    
    window.location.href = `../vistas/DetalleProducto.html?id=${productId}`;
}


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
        console.log(` Productos cargados exitosamente: ${productos.length}`);
        
    } catch (error) {

        hideLoading();
        showMessage('Error al cargar los productos. Vuelve a intentar.',"error");
    }
}

function initProductos() {
    // Verificar que existan los elementos necesarios en el DOM
    const productosContainer = document.getElementById('productos')
    cargarProductos();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initProductos);

// Exportar funciones para uso externo y debugging
window.ProductosManager = {
    cargarProductos,
    detalleProducto,
    debug: {
        mostrarAPI: () => console.log('API Config:', API_CONFIG),
        probarConexion: () => fetchFromAPI(API_CONFIG.endpoints.productos),
        cambiarAAPI: cargarProductos
    }
};