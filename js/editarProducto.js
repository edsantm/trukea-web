document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) return showMessage("No se encontró producto a editar","error");

  await cargarCategorias();
  await cargarProducto(productId);

  document.querySelector("#btnActualizar").addEventListener("click", async (e) => {
    e.preventDefault(); // evita submit si está en un <form>
    await actualizarProducto(productId);
  });
});

async function cargarCategorias() {
  const select = document.querySelector("#categoria");
  try {
    const res = await fetch("http://54.87.124.61/api/categories");
    const data = await res.json();
    const categorias = data.data.categories;

    select.innerHTML = '<option value="">Selecciona una categoría</option>';
    categorias.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = c.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    showMessage("No se pudieron cargar las categorías.","error");
  }
}

async function cargarProducto(productId) {
  try {
    const res = await fetch(`http://54.87.124.61/api/products/${productId}`);
    const data = await res.json();
    if (!res.ok) return showMessage("Producto no encontrado","error");

    const p = data.data.product;
    console.log(p);

      document.querySelector("#producto-id").value = p.id;
      document.querySelector("#nombre").value = p.nombre;
      document.querySelector("#descripcion").value = p.descripcion;

// Asegúrate de tener este input en tu HTML:
      document.querySelector("#valor").value = p.valorEstimado || 0;

// ← esto está dentro de cargarProducto()

// Buscar la opción cuyo texto coincide con categoriaNombre
const categoriaSelect = document.querySelector("#categoria");
[...categoriaSelect.options].forEach(option => {
  if (option.textContent.trim().toLowerCase() === p.categoriaNombre.trim().toLowerCase()) {
    categoriaSelect.value = option.value;
  }
});

const calidadMap = {
  "nuevo": "Nuevo",
  "usado": "Usado",
  "buen_estado": "Buen estado"
};

// Marcar el radio que coincida
document.querySelectorAll("input[name='estado']").forEach(radio => {
  if (calidadMap[radio.value] === p.calidadNombre) {
    radio.checked = true;
  }
});



  } catch (error) {
    console.error("Error cargando producto:", error);
    showMessage("No se pudo cargar el producto.","error");
  }
}

async function actualizarProducto(productId) {
  const formData = new FormData();

  const nombre = document.querySelector("#nombre").value.trim();
  const descripcion = document.querySelector("#descripcion").value.trim();
  const categoriaId = document.querySelector("#categoria").value;
  const calidadRadio = document.querySelector("input[name='estado']:checked");

  if (!nombre || !descripcion || !categoriaId || !calidadRadio) {
    return showMessage("Todos los campos son obligatorios","warning");
    
  }

  formData.append("nombre", nombre);
  formData.append("descripcion", descripcion);
  formData.append("valorEstimado", document.querySelector("#valor").value); // o puedes usar otro campo input si lo tienes
  formData.append("categoria_id", categoriaId);
  formData.append("calidad_id", calidadRadio.dataset.id);

  // Si tuvieras un input para imagen, descomenta esto:
  // const imagenInput = document.querySelector("#imagen");
  // if (imagenInput && imagenInput.files.length > 0) {
  //   formData.append("imagen", imagenInput.files[0]);
  // }

  try {
    const res = await fetch(`http://54.87.124.61/api/products/${productId}`, {
      method: "PUT",
      body: formData
    });

    const result = await res.json();
    if (!res.ok) return showMessage("Error: " + result.message,"error");
    showMessage('Producto actualizado correctamente.',"success");

      setTimeout(() => {
        window.location.href = '../vistas/MisProductos.html';
      }, 3000); 
  } catch (error) {
    console.error("Error al actualizar:", error);
    showMessage('Hubo un error al actualizar el producto.',"error");
  }
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