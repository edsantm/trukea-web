// Configuración de la API
const API_BASE = 'http://localhost:8082/api';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".formulario-producto");
  const inputNombre = document.querySelector("#nombre");
  const inputDescripcion = document.querySelector("#descripcion");
  const selectCategoria = document.querySelector("#categoria");
  const radiosEstado = document.getElementsByName("estado");
  const btnGuardar = document.querySelector(".btn-guardar");
  const btnCancelar = document.querySelector(".btn-cancelar");
  const btnImagen = document.querySelector(".btn-imagen");
  const imagenInput = document.querySelector("#imagen-input");
  const imagenPlaceholder = document.querySelector(".imagen-placeholder");
  const productoIdInput = document.querySelector("#producto-id");

  let imagenFile = null;
  let productoId = null;

  // Obtener ID del producto desde URL
  const urlParams = new URLSearchParams(window.location.search);
  productoId = urlParams.get('id');
  
  if (productoId) {
    productoIdInput.value = productoId;
    cargarProducto(productoId);
  }

  // Crear el banner dinámico
  const banner = document.createElement("div");
  banner.className = "mensaje-exito";
  banner.style.display = "none";
  document.body.insertBefore(banner, form.parentElement);

  function mostrarBanner(mensaje, tipo) {
    banner.textContent = mensaje;
    if (tipo === "exito") {
      banner.style.backgroundColor = "#dbf7e3";
      banner.style.color = "#179e4a";
    } else {
      banner.style.backgroundColor = "#f8d7da";
      banner.style.color = "#842029";
    }
    banner.style.display = "block";

    setTimeout(() => {
      banner.style.display = "none";
    }, 4000);
  }

  // Cargar categorías desde la API
  async function cargarCategorias() {
    try {
      const response = await fetch(`${API_BASE}/categorias`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar categorías`);
      }
      
      const categorias = await response.json();
      
      // Limpiar y recrear opciones
      selectCategoria.innerHTML = '<option value="">Selecciona una categoría</option>';

      // Validar que categorias es un array
      if (Array.isArray(categorias) && categorias.length > 0) {
        categorias.forEach(categoria => {
          const option = document.createElement('option');
          option.value = categoria.id || categoria.categoriaId;
          
          // Manejar diferentes estructuras de respuesta de la API
          const nombre = categoria.nombre || 
                        categoria.descripcion || 
                        categoria.tipo || 
                        categoria.category || 
                        `Categoría ${categoria.id}`;
          
          option.textContent = nombre;
          selectCategoria.appendChild(option);
        });
      } else {
        throw new Error('No se recibieron categorías válidas');
      }
      
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      // Categorías de respaldo hardcodeadas
      cargarCategoriasRespaldo();
    }
  }

  // Función de respaldo para categorías
  function cargarCategoriasRespaldo() {
    const categoriasDefault = [
      { id: 1, nombre: "Ropa y calzado" },
      { id: 2, nombre: "Electrónica" },
      { id: 3, nombre: "Accesorios" },
      { id: 4, nombre: "Juguetes" },
      { id: 5, nombre: "Útiles escolares" },
      { id: 6, nombre: "Artículos del hogar" },
      { id: 7, nombre: "Belleza y cuidado personal" }
    ];
    
    selectCategoria.innerHTML = '<option value="">Selecciona una categoría</option>';
    categoriasDefault.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.id;
      option.textContent = categoria.nombre;
      selectCategoria.appendChild(option);
    });
  }

  // Cargar datos del producto para edición
  async function cargarProducto(id) {
    try {
      mostrarCarga(true);
      const response = await fetch(`${API_BASE}/productos/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado');
        }
        throw new Error('Error al cargar el producto');
      }
      
      const producto = await response.json();
      
      // Llenar el formulario con los datos del producto
      inputNombre.value = producto.nombre || '';
      inputDescripcion.value = producto.descripcion || '';
      
      // Manejar diferentes nombres de campo para categoría
      const categoriaId = producto.categoriaId || 
                         producto.categoria_id || 
                         producto.categoria?.id || 
                         producto.categoryId || '';
      selectCategoria.value = categoriaId;
      
      // Marcar el estado correspondiente
      const estadoValue = mapearEstadoFromAPI(producto.estado);
      radiosEstado.forEach(radio => {
        radio.checked = (radio.value === estadoValue);
      });

      // Cargar imagen si existe
      const imagenUrl = producto.imagen || 
                       producto.imagen_url || 
                       producto.imageUrl || 
                       producto.foto;
                       
      if (imagenUrl) {
        mostrarImagenPreview(imagenUrl);
      }

    } catch (error) {
      console.error('Error al cargar producto:', error);
      mostrarBanner(`❌ Error al cargar el producto: ${error.message}`, 'error');
      
      // Redirigir si el producto no existe
      if (error.message.includes('no encontrado')) {
        setTimeout(() => {
          window.location.href = "/vistas/MisPorductos.html";
        }, 2000);
      }
    } finally {
      mostrarCarga(false);
    }
  }

  // Función para mostrar imagen de preview
  function mostrarImagenPreview(url) {
    imagenPlaceholder.style.backgroundImage = `url(${url})`;
    imagenPlaceholder.style.backgroundSize = "cover";
    imagenPlaceholder.style.backgroundPosition = "center";
    imagenPlaceholder.style.backgroundRepeat = "no-repeat";
  }

  // Mapear estado desde la API al formato del frontend
  function mapearEstadoFromAPI(estado) {
    if (!estado) return '';
    
    const estadoLower = estado.toString().toLowerCase().replace(/[^a-z]/g, '_');
    const mapeoEstados = {
      'nuevo': 'nuevo',
      'usado': 'usado', 
      'buen_estado': 'buen_estado',
      'bueno': 'buen_estado',
      'excelente': 'nuevo',
      'regular': 'usado',
      'perfecto': 'nuevo',
      'como_nuevo': 'nuevo'
    };
    
    return mapeoEstados[estadoLower] || 'usado';
  }

  // Mapear estado del frontend al formato de la API
  function mapearEstadoToAPI(estado) {
    const mapeoEstados = {
      'nuevo': 'Nuevo',
      'usado': 'Usado',
      'buen_estado': 'Buen estado'
    };
    
    return mapeoEstados[estado] || 'Usado';
  }

  // Función para obtener el ID del usuario actual
function obtenerUsuarioId() {
  // 1. PRIMER INTENTO: Buscar en localStorage
  // Busca en orden: 'usuarioId', 'userId', 'user_id'. Se queda con el primero que encuentra.
  let usuarioId = localStorage.getItem('usuarioId') || 
                 localStorage.getItem('userId') || 
                 localStorage.getItem('user_id');
  
  // Si encontró algo, lo convierte a número y lo devuelve. La función termina aquí.
  if (usuarioId) return parseInt(usuarioId);
  
  // 2. SEGUNDO INTENTO: Si no encontró nada arriba, busca en sessionStorage
  usuarioId = sessionStorage.getItem('usuarioId') || 
             sessionStorage.getItem('userId') || 
             sessionStorage.getItem('user_id');
  
  // Si encontró algo aquí, lo convierte a número y lo devuelve. La función termina.
  if (usuarioId) return parseInt(usuarioId);
  
  // 3. VALOR POR DEFECTO: Si la función llega hasta este punto, 
  //    significa que no encontró NADA en localStorage ni en sessionStorage.
  
  // Muestra un aviso en la consola para el desarrollador.
  console.warn('No se encontró usuarioId. Usando valor temporal para desarrollo');
  
  // Devuelve el valor predeterminado que tú quieres. ¡Esta es la línea clave!
  return 1; 
}
  // Función para mostrar/ocultar indicador de carga
  function mostrarCarga(mostrar) {
    if (mostrar) {
      btnGuardar.textContent = 'Guardando...';
      btnGuardar.disabled = true;
      btnGuardar.style.opacity = '0.6';
    } else {
      btnGuardar.textContent = productoId ? 'Actualizar Producto' : 'Guardar Producto';
      btnGuardar.disabled = false;
      btnGuardar.style.opacity = '1';
    }
  }

  // Manejo del botón de imagen
  btnImagen.addEventListener("click", () => {
    imagenInput.click();
  });

  // Manejo de selección de archivo de imagen
  imagenInput.addEventListener("change", (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      imagenFile = archivo;
      const lector = new FileReader();
      lector.onload = () => {
        mostrarImagenPreview(lector.result);
      };
      lector.readAsDataURL(archivo);
    }
  });

  // Función para subir imagen
  async function subirImagen(productoIdParam, archivo) {
    const formData = new FormData();
    formData.append('imagen', archivo);
    formData.append('file', archivo); // Por si la API espera 'file'
    
    try {
      // Intentar endpoint específico para imágenes
      let response = await fetch(`${API_BASE}/productos/${productoIdParam}/imagen`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok && response.status === 404) {
        // Si no existe endpoint específico, intentar con PUT al producto
        const productFormData = new FormData();
        productFormData.append('imagen', archivo);
        
        response = await fetch(`${API_BASE}/productos/${productoIdParam}`, {
          method: 'PUT',
          body: productFormData
        });
      }
      
      if (!response.ok) {
        throw new Error('No se pudo subir la imagen');
      }
      
      const result = await response.json().catch(() => ({}));
      return true;
      
    } catch (error) {
      console.error('Error al subir imagen:', error);
      mostrarBanner('Error al subir la imagen. El producto se guardó sin imagen.', 'error');
      return false;
    }
  }

  // Validación de formulario
  function validarFormulario() {
    const errores = [];
    
    if (inputNombre.value.trim().length < 3) {
      errores.push('El nombre debe tener al menos 3 caracteres');
    }
    
    if (inputDescripcion.value.trim().length < 10) {
      errores.push('La descripción debe tener al menos 10 caracteres');
    }
    
    if (!selectCategoria.value) {
      errores.push('Debe seleccionar una categoría');
    }
    
    const estadoSeleccionado = Array.from(radiosEstado).find(radio => radio.checked);
    if (!estadoSeleccionado) {
      errores.push('Debe seleccionar el estado del producto');
    }
    
    return errores;
  }

  // Manejo del envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validar formulario
    const errores = validarFormulario();
    if (errores.length > 0) {
      mostrarBanner(`${errores.join('. ')}.`, "error");
      return;
    }

    const estadoSeleccionado = Array.from(radiosEstado).find(radio => radio.checked);
    
    // Preparar datos para envío
    const productData = {
      nombre: inputNombre.value.trim(),
      descripcion: inputDescripcion.value.trim(),
      categoriaId: parseInt(selectCategoria.value),
      estado: mapearEstadoToAPI(estadoSeleccionado.value),
      usuarioId: obtenerUsuarioId()
    };

    mostrarCarga(true);

    try {
      let response;
      let url;
      
      if (productoId) {
        // Actualizar producto existente
        url = `${API_BASE}/productos/${productoId}`;
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });
      } else {
        // Crear nuevo producto
        url = `${API_BASE}/productos`;
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 
                           errorData?.error || 
                           `Error al guardar el producto`;
        throw new Error(errorMessage);
      }

      const resultado = await response.json();
      
      // Obtener ID del producto para subir imagen
      const idProducto = resultado.id || 
                        resultado.productoId || 
                        productoId;
      
      // Intentar subir imagen si hay una seleccionada
      if (imagenFile && idProducto) {
        await subirImagen(idProducto, imagenFile);
      }
      
      // Mostrar mensaje de éxito
      const tipoOperacion = productoId ? 'actualizado' : 'guardado';
      mostrarBanner(`¡Producto ${tipoOperacion} exitosamente!`, 'exito');
      
      // Limpiar formulario si es un producto nuevo
      if (!productoId) {
        form.reset();
        imagenPlaceholder.style.backgroundImage = '';
        imagenPlaceholder.style.border = '';
        imagenFile = null;
      }
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        window.location.href = "/vistas/MisPorductos.html";
      }, 2000);

    } catch (error) {
      console.error('Error completo:', error);
      mostrarBanner(`Error al guardar: ${error.message}`, "error");
    } finally {
      mostrarCarga(false);
    }
  });

  // Manejo del botón cancelar
  btnCancelar.addEventListener("click", (e) => {
    e.preventDefault();
    
    // Verificar si hay cambios sin guardar
    const hayCambios = 
      inputNombre.value.trim() !== "" ||
      inputDescripcion.value.trim() !== "" ||
      selectCategoria.value !== "" ||
      Array.from(radiosEstado).some(radio => radio.checked) ||
      imagenFile !== null;
    
    if (hayCambios) {
      if (confirm('¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.')) {
        window.location.href = "/vistas/MisPorductos.html";
      }
    } else {
      window.location.href = "/vistas/MisPorductos.html";
    }
  });

  // Inicialización
  console.log('Inicializando formulario de producto...');
  cargarCategorias();

  // Cambiar texto del botón según el contexto
  if (productoId) {
    btnGuardar.textContent = 'Actualizar Producto';
    document.title = 'Editar Producto - Tukea';
  } else {
    btnGuardar.textContent = 'Guardar Producto';
    document.title = 'Nuevo Producto - Tukea';
  }
});