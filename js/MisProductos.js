const API_CONFIG = {
    baseUrl: 'http://localhost:8082/api',
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
        
        const data = await response.json();
        
        console.log(' Datos recibidos de la API:', data);
        console.log(' Tipo de dato:', typeof data);
        console.log(' Es array?:', Array.isArray(data));
        console.log(' Cantidad:', data?.length || 'No es array');
        
        if (data && data.length > 0) {
            console.log(' Primer producto sin adaptar:', data[0]);
            console.log(' Propiedades disponibles:', Object.keys(data[0]));
        }
        
        return data;
    } catch (error) {
        console.error(' Error en la API:', error);
        throw error;
    }
}

// Función para crear el HTML de un producto (estilo card)
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
            </div>
            <div class="acciones">
                <button class="editar" onclick="editarProducto('${producto.id || ''}')">
                     Editar
                </button>
                <button class="eliminar" onclick="eliminarProducto('${producto.id || ''}')">
                     Eliminar
                </button>
            </div>
        </div>
    `;
}

// Función adaptadora con validación mejorada
function adaptarProductoAPI(producto) {
    console.log(' Adaptando producto:', producto);
    
    const adaptado = {
        id: producto.idProducto || producto.id || '',
        nombre: producto.nombreProducto || producto.nombre || 'Sin nombre',
        descripcion: producto.descripcionProducto || producto.descripcion || 'Sin descripción',
        estado: producto.valorEstimado ? 
            `Valor estimado: $${producto.valorEstimado}` : 
            'Sin valor estimado',
        imagen: producto.imagen || '',
        categoria: producto.idCategoria || producto.categoria || null,
        calidad: producto.idCalidad || producto.calidad || null
    };
    
    console.log(' Producto adaptado:', adaptado);
    return adaptado;
}

// Función para renderizar productos - CORREGIDA
function renderProducts(productos) {
    console.log(' Renderizando productos:', productos);
    console.log(' Cantidad a renderizar:', productos?.length || 0);
    
    const productosContainer = document.getElementById('productos');
    
    if (!productosContainer) {
        console.error(' No se encontró el elemento con ID "productos"');
        return;
    }
    
    if (!productos || productos.length === 0) {
        console.log(' No hay productos para mostrar');
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
        console.log(' Adaptando productos...');
        const productosAdaptados = productos.map(adaptarProductoAPI);
        console.log(' Productos adaptados:', productosAdaptados);
        
        productosContainer.innerHTML = productosAdaptados.map(createProductHTML).join('');
        console.log(' HTML insertado en el DOM');
    }
}

// Funciones de estado de carga - CORREGIDAS
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const productosDiv = document.getElementById('productos');
    
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (errorDiv) errorDiv.style.display = 'none';
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

function showError(message) {
    const errorDiv = document.getElementById('error');
    const loadingDiv = document.getElementById('loading');
    const productosDiv = document.getElementById('productos');
    
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (productosDiv) productosDiv.style.display = 'none';
    if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = message;
    }
}


async function eliminarProducto(productId) {
    if (!productId || productId === '') {
        alert('ID de producto no válido');
        return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        return;
    }

    try {
        console.log(` Eliminando producto con ID: ${productId}`);
        
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.productos}/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Agregar headers de autenticación si es necesario
                // 'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            console.log(' Producto eliminado exitosamente');
            alert('Producto eliminado exitosamente');
            // Recargar los productos después de eliminar
            await cargarProductos();
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Error HTTP: ${response.status}`;
            console.error(' Error al eliminar:', errorMessage);
            alert(`Error al eliminar el producto: ${errorMessage}`);
        }
    } catch (error) {
        console.error(' Error de conexión al eliminar:', error);
        alert('Error de conexión al eliminar el producto. Verifica tu conexión a internet.');
    }
}


function editarProducto(productId) {
    if (!productId || productId === '') {
        alert('ID de producto no válido');
        return;
    }
    
    console.log(` Redirigiendo a editar producto con ID: ${productId}`);
    
    
    window.location.href = `EditarProducto.html?id=${productId}`;
}


async function cargarProductos() {
    try {
        console.log(' Iniciando carga de productos desde API...');
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
        console.error(' Error al cargar productos:', error);
        hideLoading();
        showError('Error al cargar los productos. Verifica que el servidor esté funcionando y vuelve a intentar.');
    }
}

function initProductos() {
    console.log(' Iniciando gestor de productos...');
    
    // Verificar que existan los elementos necesarios en el DOM
    const productosContainer = document.getElementById('productos');
    if (!productosContainer) {
        console.error(' Error: No se encontró el elemento con ID "productos"');
        console.log(' Verifica que tu HTML tenga: <div id="productos"></div>');
        return;
    }
    
    console.log(' Elemento "productos" encontrado');
    
    cargarProductos();
    
    
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initProductos);

// Exportar funciones para uso externo y debugging
window.ProductosManager = {
    cargarProductos,
    eliminarProducto,
    editarProducto,
    debug: {
        mostrarAPI: () => console.log('API Config:', API_CONFIG),
        probarConexion: () => fetchFromAPI(API_CONFIG.endpoints.productos),
        cambiarAAPI: cargarProductos
    }
};