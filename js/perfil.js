
const API_CONFIG = {
    baseUrl: 'http://localhost:3000/api', // Cambia por tu URL de API
    endpoints: {
        productos: '/products'
    }
};

document.addEventListener("DOMContentLoaded", function () {
const inputFoto = document.getElementById("foto");
const vistaPrevia = document.getElementById("vista-previa");
const btnSubir = document.getElementById("btnSubirFoto");

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

    fetch("http://localhost:3000/api/users/profile/${id}", {
        method: "PUT",
        body: formData
    })
        .then(res => res.ok ? console.log("Imagen subida") : console.error("Error al subir"))
        .catch(err => console.error("Error:", err));
    }
});
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
            <div class="info-prod">
                <p><strong>${producto.nombre || 'Sin nombre'}</strong></p>
                <p class="descripcion">${producto.descripcion || 'Sin descripción'}</p>
                <p class="estado">Estado: ${producto.estado || 'No especificado'}</p>
            </div>
            
        </div>
    `;
}

function adaptarProductoAPI(producto) {
    
    const adaptado = {
        id: producto.idProducto,
        nombre: producto.nombreProducto,
        descripcion: producto.descripcionProducto,
        estado: producto.valorEstimado ? `Valor: $${producto.valorEstimado}` : 'Sin valor estimado',
        imagen: '', 
        categoria: producto.idCategoria,
        calidad: producto.idCalidad
    };
    
    return adaptado;
}

// Función para renderizar - CON DEBUG
function renderProducts(productos) {
    
    const productosContainer = document.getElementById('container-productos');
    
    if (!productos || productos.length === 0) {
        console.log(' No hay productos para mostrar');
        productosContainer.innerHTML = `
            <div class="no-products">
                <h3>No hay productos disponibles</h3>
                <p>Agrega tu primer producto para comenzar.</p>
            </div>
        `;
    } else {
        const productosAdaptados = productos.map(adaptarProductoAPI);
        
        productosContainer.innerHTML = productosAdaptados.map(createProductHTML).join('');
        console.log(' HTML insertado en el DOM');
    }
}



// Función para mostrar estados de carga y error
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    const messageDiv = document.getElementById('message');
    const productosDiv = document.getElementById('container-productos');
    loadingDiv.style.display = 'block';
    messageDiv.style.display = 'none';
    productosDiv.style.display = 'none';
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';
}

function showProducts() {
    const productosDiv = document.getElementById('container-productos');
    productosDiv.style.display = 'grid';
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



// Función principal para cargar productos desde API real
async function cargarProductos() {
    try {
        showLoading();
        
        // Cargar productos desde la API
        const dataproductos = await fetchFromAPI(API_CONFIG.endpoints.productos);
        const productos = dataproductos.data.products;        
        // Renderizar productos
        renderProducts(productos);
        
        // Mostrar contenedor de productos
        hideLoading();
        showProducts();
        
        console.log(`Productos cargados: ${productos.length}`);
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        showMessage('Error al cargar los productos. Por favor, intenta de nuevo más tarde.',"error");
    }
}



// Función de inicialización
function initProductos() {
    // Verificar que existan los elementos necesarios en el DOM
    if (!document.getElementById('productos')) {
        console.error('Error: No se encontró el elemento con ID "productos"');
        return;
    }
    
    cargarProductos();
    
    
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initProductos);

// Exportar funciones para uso externo si es necesario
window.ProductosManager = {
    cargarProductos,

};


