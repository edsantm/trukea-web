const API_CONFIG = {
    baseUrl: 'http://54.87.124.61/api', 
    endpoints: {
        productos: '/products'
    }
};

// Función para obtener los datos de la sesión del localStorage
function obtenerDatosSesion() {
    try {
        // Obtener los datos de la sesión del localStorage
        const sesionData = localStorage.getItem('sesion');
        
        // Verificar si existen datos de sesión
        if (!sesionData) {
            console.log('No se encontraron datos de sesión');
            return null;
        }
        
        // Parsear los datos JSON
        const datosUsuario = JSON.parse(sesionData);
        
        return datosUsuario;
    } catch (error) {
        console.error('Error al obtener datos de sesión:', error);
        return null;
    }
}

// Función para filtrar productos por nombre y apellido del usuario - MODIFICADA PARA MIS PRODUCTOS
function filtrarProductosPorUsuario(productos, mostrarSoloMios = true) {
    const usuarioLogueado = JSON.parse(localStorage.getItem('sesion'));

    console.log("Usuario logueado:", usuarioLogueado);

    if (!usuarioLogueado) {
        console.error('No se encontró la sesión del usuario.');
        return [];
    }

    const nombreUsuario = usuarioLogueado.nombre;
    const apellidoUsuario = usuarioLogueado.apellido;

    console.log(`Comparando con nombre: ${nombreUsuario} y apellido: ${apellidoUsuario}`);
    console.log(`Modo: ${mostrarSoloMios ? 'Mostrar SOLO mis productos' : 'Mostrar productos de OTROS usuarios'}`);

    // Filtrar los productos según el modo
    const productosFiltrados = productos.filter(producto => {
        // Log para verificar los datos que se están comparando
        console.log(`Producto: ${producto.nombre || producto.nombreProducto}, Usuario: ${producto.usuarioNombre}, ${producto.usuarioApellido}`);

        // Asegurarse de que el producto tiene los campos usuarioNombre y usuarioApellido
        if (!producto.usuarioNombre || !producto.usuarioApellido) {
            console.warn('Producto no tiene los campos usuarioNombre o usuarioApellido:', producto);
            return false;  // Excluir productos sin estos campos
        }

        const coinciden = producto.usuarioNombre === nombreUsuario && producto.usuarioApellido === apellidoUsuario;
        console.log(`Coincide con usuario actual: ${coinciden}`);

        // Si mostrarSoloMios = true: retornar coinciden (mostrar solo los que SÍ coinciden)
        // Si mostrarSoloMios = false: retornar !coinciden (mostrar solo los que NO coinciden - para Explorar)
        return mostrarSoloMios ? coinciden : !coinciden;
    });

    const totalProductos = productos.length;
    const productosEncontrados = productosFiltrados.length;
    
    console.log(`✅ Filtrado completado: ${totalProductos} total → ${productosEncontrados} ${mostrarSoloMios ? 'productos míos encontrados' : 'productos de otros encontrados'}`);

    return productosFiltrados;
}

// Función para mostrar los datos en el HTML
function mostrarDatosEnHTML() {
    const datos = obtenerDatosSesion();
    
    if (!datos) {
        console.log('No se pudieron cargar los datos del usuario');
        return;
    }
    
    // Obtener elementos del HTML por ID
    const nombreElement = document.getElementById('nombre-usuario');
    const edadElement = document.getElementById('edad-usuario');
    const calificacionElement = document.getElementById('calificacion-usuario');
    
    // Asignar valores a los elementos HTML
    if (nombreElement && datos.nombre) {
        nombreElement.textContent = datos.nombre;
    }
    
    if (edadElement && datos.edad) {
        edadElement.textContent = datos.edad;
    }
    
    if (calificacionElement && datos.calificacion) {
        calificacionElement.textContent = datos.calificacion;
    }
    
    console.log('Datos cargados correctamente:', datos);
}

document.addEventListener("DOMContentLoaded", function () {
const inputFoto = document.getElementById("foto");
const vistaPrevia = document.getElementById("vista-previa");
const btnSubir = document.getElementById("btnSubirFoto");

if (btnSubir && inputFoto) {
    btnSubir.addEventListener("click", () => inputFoto.click());

    inputFoto.addEventListener("change", () => {
        const archivo = inputFoto.files[0];
        if (archivo) {
        const reader = new FileReader();
        reader.onload = function (e) {
            vistaPrevia.innerHTML = `<img src="${e.target.result}" alt="Imagen de perfil">`;
        };
        reader.readAsDataURL(archivo);

          // Enviar imagen al servidor
        const formData = new FormData();
        formData.append("imagen", archivo);
        formData.append("idUsuario", 1); 

        fetch("http://54.87.124.61/api/users/profile/${id}", {
            method: "PUT",
            body: formData
        })
            .then(res => res.ok ? console.log("Imagen subida") : console.error("Error al subir"))
            .catch(err => console.error("Error:", err));
        }
    });
}
});

// Función para hacer peticiones a la API
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
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
                <p class="valorEstimado">Valor Estimado: ${producto.valorEstimado || 'No especificado'}</p>
            </div>
            <div class="acciones">
                <button class="btn-editar" onclick="editarProducto('${producto.id || ''}')">
                    Editar
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

// Función para renderizar productos - MODIFICADA PARA MIS PRODUCTOS
function renderProducts(productos) {
    const productosContainer = document.getElementById('container-productos');
    
    if (!productosContainer) {
        console.error('No se encontró el elemento con ID "container-productos"');
        return;
    }
    
    if (!productos || productos.length === 0) {
        console.log('No tienes productos publicados');
        showMessage('No tienes productos publicados', "info");
        productosContainer.innerHTML = `
            <div class="no-products">
                <h3>No tienes productos publicados</h3>
                <p>Agrega tu primer producto para comenzar a hacer trueques.</p>
                <button onclick="window.location.href='../vistas/PublicarProducto.html'" class="btn-agregar">
                    Publicar Producto
                </button>
            </div>
        `;
    } else {
        const productosAdaptados = productos.map(adaptarProductoAPI);
        productosContainer.innerHTML = productosAdaptados.map(createProductHTML).join('');
        console.log(`${productos.length} productos tuyos renderizados en el DOM`);
        
        // Mostrar mensaje de éxito
        showMessage(`Tienes ${productos.length} producto${productos.length === 1 ? '' : 's'} publicado${productos.length === 1 ? '' : 's'}`, "success", 3000);
    }
}

// Función para mostrar estados de carga y error
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    const messageDiv = document.getElementById('message');
    const productosDiv = document.getElementById('container-productos');
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (messageDiv) messageDiv.style.display = 'none';
    if (productosDiv) productosDiv.style.display = 'none';
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) loadingDiv.style.display = 'none';
}

function showProducts() {
    const productosDiv = document.getElementById('container-productos');
    if (productosDiv) productosDiv.style.display = 'grid';
}

function showMessage(message, tipo = 'info', duration = 4000) {
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');

    if (!messageDiv) return;

    messageDiv.className = 'message';

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
    messageDiv.style.display = 'block';
    messageDiv.textContent = message;

    // Auto-ocultar mensaje después del tiempo especificado
    if (duration > 0) {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, duration);
    }
}

// Función principal para cargar MIS productos desde API real
async function cargarMisProductos() {
    try {
        showLoading();
        
        // Verificar que hay usuario logueado
        const usuarioLogueado = obtenerDatosSesion();
        if (!usuarioLogueado) {
            hideLoading();
            showMessage('Debes iniciar sesión para ver tus productos', 'error');
            return;
        }
        
        console.log(`🔍 Cargando productos para usuario: ${usuarioLogueado.nombre} ${usuarioLogueado.apellido}`);
        
        // Cargar TODOS los productos desde la API
        const dataproductos = await fetchFromAPI(API_CONFIG.endpoints.productos);
        const todosLosProductos = dataproductos.data.products;
        
        console.log(`📦 Total de productos obtenidos de la API: ${todosLosProductos.length}`);
        
        // Filtrar para mostrar SOLO los productos del usuario actual
        const misProductos = filtrarProductosPorUsuario(todosLosProductos, true);
        
        console.log(`✅ Productos míos encontrados: ${misProductos.length}`);
        
        // Renderizar MIS productos
        renderProducts(misProductos);
        
        // Mostrar contenedor de productos
        hideLoading();
        showProducts();
        
    } catch (error) {
        console.error('❌ Error al cargar mis productos:', error);
        hideLoading();
        showMessage('Error al cargar tus productos. Por favor, intenta de nuevo más tarde.', "error");
    }
}

// Funciones para manejar productos (editar/eliminar)
function editarProducto(productId) {
    if (!productId || productId === '') {
        showMessage('ID de producto no válido', 'error');
        return;
    }
    
    console.log(`✏️ Editando producto con ID: ${productId}`);
    window.location.href = `../vistas/EditarProducto.html?id=${productId}`;
}

function eliminarProducto(productId) {
    if (!productId || productId === '') {
        showMessage('ID de producto no válido', 'error');
        return;
    }
    
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (confirmacion) {
        console.log(`🗑️ Eliminando producto con ID: ${productId}`);
        // Aquí irías la lógica para eliminar el producto via API
        // Por ahora solo mostramos el mensaje
        showMessage('Funcionalidad de eliminar en desarrollo', 'warning');
    }
}

// Función para actualizar un elemento específico
function actualizarElemento(selector, ...valores) {
    const elemento = document.querySelector(selector);
    if (elemento) {
        // Filtrar valores válidos (no undefined, null o vacíos)
        const valoresValidos = valores.filter(valor => 
            valor !== undefined && valor !== null && valor !== ''
        );
        
        if (valoresValidos.length > 0) {
            // Unir los valores con un espacio
            elemento.textContent = valoresValidos.join(' ');
        }
    }
}

// Función alternativa para actualizar elementos con HTML personalizado
function actualizarElementoHTML(selector, contenidoHTML) {
    const elemento = document.querySelector(selector);
    if (elemento && contenidoHTML !== undefined && contenidoHTML !== null) {
        elemento.innerHTML = contenidoHTML;
    }
}

// Función principal para cargar datos del usuario en el HTML
function cargarDatosUsuario() {
    const datos = obtenerDatosSesion();
    
    if (!datos) {
        console.log('No se pudieron cargar los datos del usuario');
        // Mostrar mensaje de "sin datos" si no hay información
        document.querySelectorAll('.user-data-field').forEach(elemento => {
            elemento.textContent = 'Sin datos';
        });
        return;
    }
    
    // Actualizar elementos usando diferentes métodos de selección
    
    // Por ID - Nombre completo (nombre + apellido)
    actualizarElemento('#nombre-usuario, .nombre-usuario', `HOLA: ${datos.nombre} ${datos.apellido}`);
    
    // Edad con formato personalizado
    if (datos.edad) {
        actualizarElementoHTML('#edad-usuario', `<strong>Edad:</strong> ${datos.edad} años`);
    }
    
    // Calificación con estrellas
    if (datos.calificacion) {
        const estrellas = '⭐'.repeat(Math.floor(datos.calificacion / 2)); // Convertir a estrellas de 5
        actualizarElementoHTML('#calificacion-usuario', 
            `<strong>Calificación:</strong> ${datos.calificacion}/10 <span class="estrellas">${estrellas}</span>`
        );
    }
    
    // Otros elementos
    actualizarElemento('#email-usuario, .email-usuario', datos.correo || datos.email);
    
    // Por clase (para compatibilidad)
    actualizarElemento('.edad-usuario', datos.edad);
    actualizarElemento('.calificacion-usuario', datos.calificacion);
    
    // Elementos con data attributes
    const elementosData = document.querySelectorAll('[data-usuario]');
    elementosData.forEach(elemento => {
        const campo = elemento.getAttribute('data-usuario');
        if (datos[campo] !== undefined && datos[campo] !== null) {
            elemento.textContent = datos[campo];
        }
    });
    
    console.log('Datos de usuario cargados:', datos);

    // Cargar MIS productos después de cargar los datos del usuario
    cargarMisProductos();
}

// También ejecutar si el documento ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarDatosUsuario);
} else {
    cargarDatosUsuario();
}

// Exportar funciones para uso externo
window.ProductosManager = {
    cargarMisProductos,
    filtrarProductosPorUsuario,
    editarProducto,
    eliminarProducto,
    
    // Funciones de debugging
    debug: {
        mostrarSesion: () => console.log('Datos de sesión:', obtenerDatosSesion()),
        probarAPI: () => fetchFromAPI(API_CONFIG.endpoints.productos),
        recargarProductos: cargarMisProductos,
        probarFiltro: async () => {
            const data = await fetchFromAPI(API_CONFIG.endpoints.productos);
            const productos = data.data.products;
            console.log('Todos los productos:', productos);
            console.log('Mis productos:', filtrarProductosPorUsuario(productos, true));
        }
    }
};

