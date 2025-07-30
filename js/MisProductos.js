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
        console.log(data);
        
        return data.data.products; // Asegúrate de que los productos se devuelvan correctamente
    } catch (error) {
        console.error('Error en la API:', error);
        throw error;
    }
}

// Función para filtrar productos por nombre y apellido del usuario
function filtrarProductosPorUsuario(productos) {
    const usuarioLogueado = JSON.parse(localStorage.getItem('sesion'));

    console.log("Usuario logueado:", usuarioLogueado);

    if (!usuarioLogueado) {
        console.error('No se encontró la sesión del usuario.');
        return [];
    }

    const nombreUsuario = usuarioLogueado.nombre;
    const apellidoUsuario = usuarioLogueado.apellido;

    console.log(`Comparando con nombre: ${nombreUsuario} y apellido: ${apellidoUsuario}`);

    // Filtrar los productos para mostrar solo los del usuario actual
    return productos.filter(producto => {
        // Log para verificar los datos que se están comparando
        console.log(`Producto: ${producto.nombre}, Usuario: ${producto.usuarioNombre}, ${producto.usuarioApellido}`);

        // Asegurarse de que el producto tiene los campos usuarioNombre y usuarioApellido
        if (!producto.usuarioNombre || !producto.usuarioApellido) {
            console.warn('Producto no tiene los campos usuarioNombre o usuarioApellido:', producto);
            return false;  // Excluir productos sin estos campos
        }

        const coinciden = producto.usuarioNombre === nombreUsuario && producto.usuarioApellido === apellidoUsuario;
        console.log(`Coincide: ${coinciden}`);

        return coinciden;
    });
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
                <p class="valorEstimado">Valor Estimado: ${producto.valorEstimado || 'No especificado'}</p>
            </div>
            <div class="acciones">
                <button class="editar" onclick="editarProducto('${producto.id || ''}')">
                     Editar
                </button>
                <button class="eliminar" onclick="eliminarProducto('${producto.id}')">
                     Eliminar
                </button>
            </div>
        </div>
    `;
}

// Función para adaptar el producto según la respuesta de la API
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
    const productosContainer = document.getElementById('productos');
    
    if (!productosContainer) {
        console.error('No se encontró el elemento con ID "productos"');
        return;
    }
    
    if (!productos || productos.length === 0) {
        console.log('No hay productos para mostrar');
        showMessage('No hay productos para mostrar', "error");
        productosContainer.innerHTML = `
            <div class="no-products">
                <h3>No hay productos disponibles</h3>
                <p>Agrega tu primer producto para comenzar.</p>
                <button onclick="window.location.href='../vistas/PublicarProducto.html'" class="btn-agregar">
                    Agregar Producto
                </button>
            </div>
        `;
    } else {
        const productosAdaptados = productos.map(adaptarProductoAPI);
        productosContainer.innerHTML = productosAdaptados.map(createProductHTML).join('');
        console.log('HTML insertado en el DOM');
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

function showMessage(text, estado = 'info', duration = 4000) {
    const msg = document.getElementById('message');

    // Remover solo clases de estado
    msg.classList.remove('message-success', 'message-error', 'message-warning', 'message-info');

    // Agregar nueva clase de estado
    switch (estado) {
        case 'success':
            msg.classList.add('message-success');
            break;
        case 'error':
            msg.classList.add('message-error');
            break;
        case 'warning':
            msg.classList.add('message-warning');
            break;
        default:
            msg.classList.add('message-info');
    }

    // Mostrar mensaje
    msg.textContent = text;
    msg.classList.add('show');
    msg.style.display = 'block';

    // Ocultar después del tiempo
    setTimeout(() => {
        msg.classList.remove('show');
        setTimeout(() => {
            msg.style.display = 'none';
        }, 300);
    }, duration);
}

async function eliminarProducto(productId) {
    if (!productId || productId === '') {
        alert('ID de producto no válido');
        return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        return;
    }
    console.log(` Eliminando producto con ID: ${productId}`);

    try {
      
        
        console.log(` Realizando petición DELETE a: ${API_CONFIG.baseUrl}${API_CONFIG.endpoints.productos}/${productId}`);
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.productos}/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                
            }
        });

        if (response.ok) {
            console.log(' Producto eliminado exitosamente');
            showMessage("Producto eliminado exitosamente", "success");
            await cargarProductos();
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Error HTTP: ${response.status}`;
        // mandamos mensaje a la funcion message
            console.error('Error al eliminar:',errorMessage);
            showMessage(errorMessage,"error");
        }

    } catch (error) {
        console.error(' Error de conexión al eliminar:', error);
        showMessage(error, "error");
    }
}


function editarProducto(productId) {
    if (!productId || productId === '') {
        alert('ID de producto no válido');
        return;
    }
    
    console.log(` Redirigiendo a editar producto con ID: ${productId}`);
    
    
    window.location.href = `../vistas/EditarProducto.html?id=${productId}`;
}

// Función para cargar productos
async function cargarProductos() {
    try {
        showLoading();
        
        // Cargar productos desde la API
        const productos = await fetchFromAPI(API_CONFIG.endpoints.productos);
        
        console.log("Productos cargados desde la API:", productos);

        // Filtrar productos por el nombre y apellido del usuario
        const productosFiltrados = filtrarProductosPorUsuario(productos);
        
        // Renderizar productos
        renderProducts(productosFiltrados);
        
        // Mostrar contenedor de productos
        hideLoading();
        showProducts();
        
        console.log(`Productos cargados exitosamente: ${productosFiltrados.length}`);
        
    } catch (error) {
        hideLoading();
        showMessage('Error al cargar los productos. Vuelve a intentar.', "error");
    }
}


function initProductos() {
    // Verificar que existan los elementos necesarios en el DOM
    const productosContainer = document.getElementById('productos');
    cargarProductos();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initProductos);
