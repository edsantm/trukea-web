
const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  endpoints: {
    productos: '/products'
  }
};

let productoActual = null;

// ✅ Solo una definición de readTrueque
async function readTrueque() {
  const productId = getProductIdFromUrl(); // Obtener ID desde la URL

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.productos}/${productId}`);

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const data = await response.json();
    productoActual = data.product || data.data?.product || data;
    console.log(productoActual);
    // Mostrar en el HTML
    document.getElementById('nombreProducto').textContent = productoActual.nombre || 'Producto sin nombre';
    document.getElementById('descripcionProducto').textContent = productoActual.descripcion || 'Sin descripción';
    document.getElementById('publicadoPor').textContent = `${productoActual.usuarioNombre || ''} ${productoActual.usuarioApellido || ''}`.trim() || 'Usuario desconocido';

    // Guardamos ID del dueño
    productoActual.usuarioNombre = productoActual.usuario?.Nombre || null;

  } catch (error) {
    console.error("Error al cargar el producto:", error);
  }
}

function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id') || '1';
}

async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error en la API:', error);
    throw error;
  }
}

function createProductHTML(producto) {
  return `
    <div class="oferta" data-id="${producto.id || ''}">
        <input type="checkbox">
        <div>
            <strong>${producto.nombre || 'Sin nombre'}</strong><br>
            <span>Estado: ${producto.estado || 'No especificado'}</span>
        </div>
    </div>
  `;
}

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

function showLoading() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('error').style.display = 'none';
  document.getElementById('productos').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function showProducts() {
  document.getElementById('productos').style.display = 'grid';
}

function showError(message) {
  document.getElementById('error').textContent = message;
  document.getElementById('error').style.display = 'block';
  document.getElementById('loading').style.display = 'none';
  document.getElementById('productos').style.display = 'none';
}

async function cargarProductos() {
  try {
    showLoading();
    const response = await fetchFromAPI(API_CONFIG.endpoints.productos);
    const productos = response.data.products || response.products || [];
    renderProducts(productos);
    hideLoading();
    showProducts();
  } catch (error) {
    showError('Error al cargar productos.');
  }
}

function initProductos() {
  if (!document.getElementById('productos')) {
    console.error('Error: No se encontró el contenedor de productos');
    return;
  }
  readTrueque();
  cargarProductos();
}

// ✅ Botón de "Proponer Trueque"
document.getElementById('btnProponerTrueque').addEventListener('click', async () => {
  const productoDeseadoId = getProductIdFromUrl();
  const comentario = document.getElementById('comentario-box').value;
  const productoOfrecido = document.querySelector('.oferta input[type="checkbox"]:checked');

  if (!productoOfrecido) {
    alert("Selecciona un producto para ofrecer.");
    return;
  }

  const productoOfrecidoId = productoOfrecido.closest('.oferta').dataset.id;
  const propuestoPor = 1; // Debes obtenerlo dinámicamente (session/localStorage)
  const recibidoPor = productoActual.usuario_id;

  const propuesta = {
    producto_deseado_id: parseInt(productoDeseadoId),
    producto_ofrecido_id: parseInt(productoOfrecidoId),
    comentario,
    propuesto_por: propuestoPor,
    recibido_por: recibidoPor,
    estado: "pendiente"
  };

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/trueques`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propuesta)
    });

    if (!response.ok) throw new Error("Error al enviar propuesta");

    alert("Propuesta enviada exitosamente.");
  } catch (err) {
    console.error(err);
    alert("Error al enviar la propuesta.");
  }
});

document.addEventListener('DOMContentLoaded', initProductos);
