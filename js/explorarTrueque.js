const API_CONFIG = {
    baseUrl: 'http://54.87.124.61/api',
    endpoints: {
        productos: '/products'
    }
};

// Utilidad para manejo de localStorage de manera segura
const SessionManager = {
    getUserData() {
        try {
            // Buscar en diferentes posibles keys del localStorage
            const userData = localStorage.getItem('userData') || 
                           localStorage.getItem('sesion') || 
                           localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error al leer datos de sesión:', error);
            return null;
        }
    },

    getCurrentUserFullName() {
        const userData = this.getUserData();
        if (!userData) return null;
        
        // Estructura específica de tu localStorage: {nombre: "ali", apellido: "jaras"}
        const nombre = userData.nombre || '';
        const apellido = userData.apellido || '';
        
        return `${nombre} ${apellido}`.trim();
    },

    getCurrentUserId() {
        const userData = this.getUserData();
        return userData ? userData.id : null;
    },

    // Método para debugging - mostrar datos actuales del usuario
    logCurrentUser() {
        const userData = this.getUserData();
        console.log('📱 Datos del usuario actual:', {
            id: this.getCurrentUserId(),
            nombreCompleto: this.getCurrentUserFullName(),
            email: userData?.email,
            rawData: userData
        });
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
        console.error('Error en la API:', error);
        throw error;
    }
}

// Función para filtrar productos por nombre y apellido del usuario (adaptada de tu código original)
function filtrarProductosPorUsuario(productos, excluirPropios = true) {
    const usuarioLogueado = JSON.parse(localStorage.getItem('sesion'));

    console.log("Usuario logueado:", usuarioLogueado);

    if (!usuarioLogueado) {
        console.error('No se encontró la sesión del usuario.');
        return productos; // Retornar todos los productos si no hay sesión
    }

    const nombreUsuario = usuarioLogueado.nombre;
    const apellidoUsuario = usuarioLogueado.apellido;

    console.log(`Comparando con nombre: ${nombreUsuario} y apellido: ${apellidoUsuario}`);
    console.log(`Modo: ${excluirPropios ? 'Excluir productos propios (Explorar)' : 'Incluir solo productos propios (Mis Productos)'}`);

    // Filtrar los productos según el modo
    const productosFiltrados = productos.filter(producto => {
        // Log para verificar los datos que se están comparando
        console.log(`Producto: ${producto.nombre || producto.nombreProducto}, Usuario: ${producto.usuarioNombre}, ${producto.usuarioApellido}`);

        // Asegurarse de que el producto tiene los campos usuarioNombre y usuarioApellido
        if (!producto.usuarioNombre || !producto.usuarioApellido) {
            console.warn('Producto no tiene los campos usuarioNombre o usuarioApellido:', producto);
            // Si excluimos propios, incluir productos sin datos de usuario (pueden ser de otros)
            // Si incluimos propios, excluir productos sin datos de usuario
            return excluirPropios;
        }

        const coinciden = producto.usuarioNombre === nombreUsuario && producto.usuarioApellido === apellidoUsuario;
        console.log(`Coincide con usuario actual: ${coinciden}`);

        // Si excluirPropios = true (Explorar Trueque): retornar !coinciden (mostrar solo los que NO coinciden)
        // Si excluirPropios = false (Mis Productos): retornar coinciden (mostrar solo los que SÍ coinciden)
        return excluirPropios ? !coinciden : coinciden;
    });

    const productosExcluidos = productos.length - productosFiltrados.length;
    console.log(`✅ Filtrado completado: ${productos.length} total → ${productosFiltrados.length} después del filtro (${productosExcluidos} ${excluirPropios ? 'excluidos' : 'incluidos'})`);

    return productosFiltrados;
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
        calidad: calidadId,
        // Preservar datos del usuario para filtrado
        idUsuario: producto.idUsuario || producto.userId,
        nombreUsuario: producto.nombreUsuario || producto.userName,
        apellidoUsuario: producto.apellidoUsuario || producto.userLastName
    };
}

// Función para renderizar productos
function renderProducts(productos) {
    const productosContainer = document.getElementById('container-productos');
    
    if (!productosContainer) {
        console.error('No se encontró el elemento con ID "container-productos"');
        return;
    }
    
    if (!productos || productos.length === 0) {
        console.log('No hay productos para mostrar');
        showMessage('No hay productos disponibles para explorar', "info");
        productosContainer.innerHTML = `
            <div class="no-products">
                <h3>No hay productos disponibles</h3>
                <p>No se encontraron productos de otros usuarios para intercambiar.</p>
                <button onclick="window.location.reload()" class="btn-refresh">
                    Actualizar
                </button>
            </div>
        `;
    } else {
        const productosAdaptados = productos.map(adaptarProductoAPI);
        productosContainer.innerHTML = productosAdaptados.map(createProductHTML).join('');
        console.log(`Productos renderizados: ${productos.length}`);
    }
}

// Funciones de estado de carga
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    const messageDiv = document.getElementById('message');
    
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (messageDiv) messageDiv.style.display = 'none';
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
    if (!msg) return;

    // Remover clases de estado anteriores
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

    // Ocultar después del tiempo especificado
    setTimeout(() => {
        msg.classList.remove('show');
        setTimeout(() => {
            msg.style.display = 'none';
        }, 300);
    }, duration);
}

function detalleProducto(productId) {
    if (!productId || productId === '') {
        showMessage('ID de producto no válido', 'error');
        return;
    }
    
    console.log(`Redirigiendo a detalle de producto con ID: ${productId}`);
    window.location.href = `../vistas/DetalleProducto.html?id=${productId}`;
}

// Función principal para cargar productos con filtro (usando tu función de filtrado)
async function cargarProductos(options = {}) {
    const { excluirPropios = true, showLoadingIndicator = true } = options;
    
    try {
        if (showLoadingIndicator) showLoading();
        
        // Obtener productos desde la API
        const productosRaw = await fetchFromAPI(API_CONFIG.endpoints.productos);
        
        // Aplicar tu filtro personalizado
        const productosFiltrados = filtrarProductosPorUsuario(productosRaw, excluirPropios);
        
        console.log(`Productos totales: ${productosRaw.length}, Productos filtrados: ${productosFiltrados.length}`);
        
        // Renderizar productos filtrados
        renderProducts(productosFiltrados);
        
        if (showLoadingIndicator) {
            hideLoading();
            showProducts();
        }
        
        // Mostrar mensaje informativo
        const productosAfectados = productosRaw.length - productosFiltrados.length;
        if (productosAfectados > 0) {
            if (excluirPropios) {
                console.log(`Se excluyeron ${productosAfectados} productos propios del usuario`);
                showMessage(`Mostrando ${productosFiltrados.length} productos disponibles para intercambio`, 'success', 3000);
            } else {
                console.log(`Se incluyeron ${productosFiltrados.length} productos del usuario`);
                showMessage(`Mostrando ${productosFiltrados.length} de tus productos`, 'info', 3000);
            }
        }
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        if (showLoadingIndicator) hideLoading();
        showMessage('Error al cargar los productos. Por favor, intenta nuevamente.', "error");
    }
}

// Función para recargar productos (útil para debugging)
async function recargarProductos() {
    await cargarProductos({ excludeOwnProducts: true, showLoadingIndicator: true });
}

function initProductos() {
    // Verificar y mostrar datos del usuario logueado
    const userData = SessionManager.getUserData();
    if (!userData) {
        console.warn('⚠️ Usuario no logueado - algunos filtros pueden no funcionar correctamente');
        showMessage('No se encontró sesión de usuario. Algunos filtros pueden no aplicarse.', 'warning');
    } else {
        // Log de información del usuario para debugging
        SessionManager.logCurrentUser();
    }
    
    // Cargar productos con filtro por defecto
    cargarProductos();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initProductos);

// API pública para uso externo y debugging
window.ProductosManager = {
    cargarProductos,
    recargarProductos,
    detalleProducto,
    
    // Tu función de filtrado personalizada
    filtrarProductosPorUsuario,
    
    // Utilidades de sesión
    session: {
        getUserData: SessionManager.getUserData,
        getCurrentUserName: SessionManager.getCurrentUserFullName,
        getCurrentUserId: SessionManager.getCurrentUserId
    },
    
    // Funciones de debugging
    debug: {
        mostrarAPI: () => console.log('API Config:', API_CONFIG),
        mostrarSesion: () => console.log('Datos de sesión:', SessionManager.getUserData()),
        probarConexion: () => fetchFromAPI(API_CONFIG.endpoints.productos),
        
        // Para Explorar Trueque (excluir productos propios)
        cargarExplorar: () => cargarProductos({ excluirPropios: true }),
        
        // Para Mis Productos (incluir solo productos propios)
        cargarMisProductos: () => cargarProductos({ excluirPropios: false }),
        
        // Probar filtrado manualmente
        probarFiltro: async () => {
            const productos = await fetchFromAPI(API_CONFIG.endpoints.productos);
            console.log('Productos sin filtro:', productos);
            console.log('Productos excluidos (Explorar):', filtrarProductosPorUsuario(productos, true));
            console.log('Productos incluidos (Mis Productos):', filtrarProductosPorUsuario(productos, false));
        }
    }
};