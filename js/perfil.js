
const API_CONFIG = {
    baseUrl: 'http://localhost:8082/api', // Cambia por tu URL de API
    endpoints: {
        productos: '/productos'
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

      fetch("http://localhost:8082/api/usuarios/", {
        method: "POST",
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
        
        // 🔍 DEBUG: Ver qué llega de la API
        console.log(' Datos recibidos de la API:', data);
        console.log(' Tipo de dato:', typeof data);
        console.log(' Es array?:', Array.isArray(data));
        console.log(' Cantidad:', data?.length || 'No es array');
        
        if (data && data.length > 0) {
            console.log('Primer producto sin adaptar:', data[0]);
            console.log('Propiedades disponibles:', Object.keys(data[0]));
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
            <div class="info-prod">
                <p><strong>${producto.nombre || 'Sin nombre'}</strong></p>
                <p class="descripcion">${producto.descripcion || 'Sin descripción'}</p>
                <p class="estado">Estado: ${producto.estado || 'No especificado'}</p>
            </div>
            
        </div>
    `;
}

function adaptarProductoAPI(producto) {
    console.log(' Adaptando producto:', producto);
    
    const adaptado = {
        id: producto.idProducto,
        nombre: producto.nombreProducto,
        descripcion: producto.descripcionProducto,
        estado: producto.valorEstimado ? `Valor: $${producto.valorEstimado}` : 'Sin valor estimado',
        imagen: '', 
        categoria: producto.idCategoria,
        calidad: producto.idCalidad
    };
    
    console.log(' Producto adaptado:', adaptado);
    return adaptado;
}

// Función para renderizar - CON DEBUG
function renderProducts(productos) {
    console.log(' Renderizando productos:', productos);
    console.log(' Cantidad a renderizar:', productos?.length || 0);
    
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
        console.log(' Adaptando productos...');
        const productosAdaptados = productos.map(adaptarProductoAPI);
        console.log(' Productos adaptados:', productosAdaptados);
        
        productosContainer.innerHTML = productosAdaptados.map(createProductHTML).join('');
        console.log(' HTML insertado en el DOM');
    }
}



// Función para mostrar estados de carga y error
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const productosDiv = document.getElementById('container-productos');
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
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

function showError(message) {
    const errorDiv = document.getElementById('error');
    const loadingDiv = document.getElementById('loading');
    const productosDiv = document.getElementById('productos');
    
    loadingDiv.style.display = 'none';
    productosDiv.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
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


