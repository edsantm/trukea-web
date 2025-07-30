
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

// Función para crear el HTML de un producto
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
/*function initProductos() {
    // Verificar que existan los elementos necesarios en el DOM
    if (!document.getElementById('productos')) {
        console.error('Error: No se encontró el elemento con ID "productos"');
        return;
    }
    
    cargarProductos();
    
    
}*/
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
    actualizarElemento('#nombre-usuario, .nombre-usuario', `HOLA: ${datos.nombre}  ${datos.apellido} `);
    
    // Edad con formato personalizado
    if (datos.edad) {
        actualizarElementoHTML('#edad-usuario', `<strong>Edad:</strong> ${datos.edad} años`);
    }
    
    // Calificación con estrellas
    if (datos.calificacion) {
        const estrellas = generarEstrellas(datos.calificacion);
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

    cargarProductos();
}


// También ejecutar si el documento ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarDatosUsuario);
} else {
    cargarDatosUsuario();
}

// Exportar funciones para uso externo si es necesario
window.ProductosManager = {
    cargarProductos,

};


