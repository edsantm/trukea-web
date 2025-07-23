// =======================
// Obtener parámetros de URL
// =======================
const params = new URLSearchParams(window.location.search);
const productoId = params.get('id'); // ID del producto que deseas
const usuarioId = 'TU_USUARIO_ID'; // ← Reemplaza con el ID del usuario actual

// =======================
// Cargar producto deseado
// =======================
async function cargarProducto() {
  try {
    // Reemplaza esta URL con la de tu API
    const response = await fetch(`https://tu-api.com/productos/${productoId}`);
    if (!response.ok) throw new Error('No se pudo cargar el producto');

    const producto = await response.json();

    document.getElementById('nombreProducto').textContent = producto.nombre || 'Sin nombre';
    document.getElementById('descripcionProducto').textContent = producto.descripcion || 'Sin descripción';
    document.getElementById('publicadoPor').textContent = producto.usuario || 'Anónimo';

    // Si tienes una imagen:
    // document.getElementById('imagenProducto').style.backgroundImage = `url(${producto.imagenUrl})`;

  } catch (error) {
    console.error('Error al cargar el producto:', error);
    alert('Error al cargar el producto que deseas.');
  }
}

// ==============================
// Cargar productos del usuario
// ==============================
async function cargarMisProductos() {
  try {
    // Reemplaza con tu endpoint real
    const response = await fetch(`https://tu-api.com/usuarios/${usuarioId}/productos`);
    if (!response.ok) throw new Error('No se pudieron cargar tus productos');

    const productos = await response.json();
    const contenedor = document.getElementById('misProductos');
    contenedor.innerHTML = '';

    if (productos.length === 0) {
      contenedor.innerHTML = '<p>No tienes productos registrados.</p>';
      return;
    }

    productos.forEach((producto, index) => {
      const ofertaHTML = `
        <div class="oferta">
          <input type="radio" name="productoOfrecido" value="${producto.id}" id="prod${index}">
          <label for="prod${index}">
            <strong>${producto.nombre}</strong><br>
            <span>${producto.estado}</span>
          </label>
        </div>
      `;
      contenedor.innerHTML += ofertaHTML;
    });

  } catch (error) {
    console.error('Error al cargar tus productos:', error);
    alert('Error al cargar tus productos disponibles.');
  }
}

// ========================
// Enviar propuesta POST
// ========================
async function enviarPropuesta() {
  const productoOfrecidoId = document.querySelector('input[name="productoOfrecido"]:checked')?.value;
  const comentario = document.querySelector('.comentario-box').value.trim();

  if (!productoOfrecidoId) {
    alert('Por favor, selecciona un producto para ofrecer.');
    return;
  }

  const propuesta = {
    productoSolicitadoId: productoId,
    productoOfrecidoId: productoOfrecidoId,
    comentario: comentario,
    proponenteId: usuarioId
  };

  try {
    // Reemplaza con tu URL de POST
    const response = await fetch('https://tu-api.com/propuestas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(propuesta)
    });

    if (response.ok) {
      alert('✅ ¡Propuesta enviada con éxito!');
      // Redireccionar o limpiar si quieres
      // window.location.href = "/vistas/ExplorarTrueque.html";
    } else {
      const errorData = await response.json();
      console.error('Respuesta del servidor:', errorData);
      alert('❌ Error al enviar la propuesta.');
    }

  } catch (error) {
    console.error('Error al enviar la propuesta:', error);
    alert('❌ No se pudo conectar con el servidor.');
  }
}

// ==========================
// Iniciar funciones al cargar
// ==========================
window.onload = () => {
  cargarProducto();
  cargarMisProductos();
};
