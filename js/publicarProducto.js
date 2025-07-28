document.addEventListener("DOMContentLoaded", function () {
  const alerta = document.getElementById('alerta');
  const icono = document.getElementById('alerta-icono');
  const mensaje = document.getElementById('alerta-mensaje');
  const btnImagen = document.querySelector(".btn-seleccionar");
  const placeholder = document.querySelector(".imagen-placeholder");
  const btnPublicar = document.getElementById('btn-publicar');

  // URL base de la API
  const API_BASE_URL = 'http://localhost:8082/api';
  
  const inputFile = document.createElement("input");
  inputFile.type = "file";
  inputFile.accept = "image/*";
  inputFile.style.display = "none";
  document.body.appendChild(inputFile);

  // Mostrar alerta
  function mostrarAlerta(tipo, texto) {
    alerta.classList.remove("oculto", "exito", "error");
    alerta.classList.add(tipo);

    if (tipo === "exito") {
      icono.innerHTML = "✔";
      icono.style.backgroundColor = "#27AE60";
      icono.style.color = "#fff";
    } else {
      icono.innerHTML = "✖";
      icono.style.backgroundColor = "transparent";
      icono.style.color = "#C0392B";
    }

    mensaje.textContent = texto;
    alerta.style.top = "0";

    setTimeout(() => {
      alerta.classList.add("oculto");
      alerta.style.top = "-60px";
    }, 4000);
  }

  // Cargar categorías desde la API
  async function cargarCategorias() {
    try {
      console.log('Intentando cargar categorías desde:', `${API_BASE_URL}/categorias`);
      
      const response = await fetch(`http://localhost:8082/api/categorias`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Si tu API requiere autenticación, agrégala aquí
          // 'Authorization': 'Bearer ' + token
        },
        mode: 'cors' // Explícitamente habilitar CORS
      });
      
      console.log('Respuesta de categorías:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const categorias = await response.json();
      console.log('Categorías recibidas:', categorias);
      
      const selectCategoria = document.getElementById('categoria');
      
      // Limpiar opciones existentes
      selectCategoria.innerHTML = '<option value="">Selecciona una categoría</option>';
      
      // Agregar categorías dinámicamente
      categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        selectCategoria.appendChild(option);
      });
      
      console.log('Categorías cargadas exitosamente');
      
    } catch (error) {
      console.error('Error cargando categorías:', error);
      mostrarAlerta("error", `Error al cargar las categorías: ${error.message}`);
      
      // Fallback con categorías estáticas
      const selectCategoria = document.getElementById('categoria');
      selectCategoria.innerHTML = `
        <option value="">Selecciona una categoría</option>
        <option value="1">Tecnología</option>
        <option value="2">Hogar</option>
        <option value="3">Ropa</option>
      `;
    }
  }

  // Evento al hacer clic en botón de imagen
  btnImagen.addEventListener("click", () => {
    inputFile.click();
  });

  // Mostrar imagen cargada
  inputFile.addEventListener("change", function () {
    const archivo = this.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function (e) {
      placeholder.innerHTML = ""; 
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";
      placeholder.appendChild(img);
    };
    lector.readAsDataURL(archivo);
  });

  // Función para convertir imagen a Base64
  function imagenABase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Validación y envío del formulario
  const form = document.getElementById("form-producto");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Deshabilitar botón durante el envío
    btnPublicar.disabled = true;
    btnPublicar.textContent = "Publicando...";

    try {
      const nombreProducto = document.getElementById("nombreProducto").value.trim();
      const idCategoria = document.getElementById("categoria").value;
      const valorEstimado = document.getElementById("valorEstimado").value;
      const descripcionProducto = document.getElementById("descripcionProducto").value.trim();
      const idCalidad = document.querySelector("input[name='idCalidad']:checked")?.value;

      console.log('Datos del formulario:', {
        nombreProducto,
        idCategoria,
        valorEstimado,
        descripcionProducto,
        idCalidad
      });

      // Validaciones según tu API
      if (!nombreProducto) {
        mostrarAlerta("error", "El nombre del producto es obligatorio.");
        return;
      }
      if (!idCategoria) {
        mostrarAlerta("error", "Debes seleccionar una categoría.");
        return;
      }
      if (!valorEstimado || valorEstimado <= 0) {
        mostrarAlerta("error", "El valor estimado debe ser mayor a 0.");
        return;
      }
      if (!idCalidad) {
        mostrarAlerta("error", "Debes seleccionar la calidad del producto.");
        return;
      }

      // Preparar datos exactamente como tu API los espera
      const productData = {
        nombreProducto: nombreProducto,
        descripcionProducto: descripcionProducto || null,
        valorEstimado: parseInt(valorEstimado),
        idCalidad: parseInt(idCalidad),
        idCategoria: parseInt(idCategoria),
        
         //Si necesitas el ID del usuario, descomenta la siguiente línea
         //usuarioId: obtenerUsuarioActual()
      };

      console.log('Enviando datos a la API:', productData);

      // Enviar a la API como JSON
      const response = await fetch(`${API_BASE_URL}/productos`, { 
        method: "POST",
         
        mode: 'cors', // Explícitamente habilitar CORS
        body: JSON.stringify(productData),
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Respuesta exitosa:', data);
      
      if (data && (data.id || data.success)) {
        mostrarAlerta("exito", "¡Tu producto se ha publicado correctamente!");
        
        // Limpiar formulario después del éxito
        setTimeout(() => {
          form.reset();
          placeholder.innerHTML = "";
          inputFile.value = "";
        }, 1000);
      } else {
        mostrarAlerta("error", "Hubo un error al publicar el producto.");
      }

    } catch (error) {
      console.error("Error al publicar producto:", error);
      mostrarAlerta("error", `Error de conexión: ${error.message}`);
    } finally {
      // Rehabilitar botón
      btnPublicar.disabled = false;
      btnPublicar.textContent = "Publicar Producto";
    }
  });

  // Función para obtener el ID del usuario logueado
  function obtenerUsuarioActual() {
    // Por ahora retorna un ID fijo, pero deberías implementar tu lógica de autenticación
    // Por ejemplo: obtener del localStorage, sessionStorage, o hacer una consulta a la API
    return 1; // ID temporal
  }

  
  console.log('Script cargado correctamente');
});