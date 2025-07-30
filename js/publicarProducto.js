document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-producto');

  if (!validarAccesoFormulario()) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    let usuarioLogueado;
    try {
      const sesionData = localStorage.getItem('sesion');
      if (!sesionData) throw new Error('No hay datos de sesión');
      usuarioLogueado = JSON.parse(sesionData);
    } catch (error) {
      showMessage('Error en los datos de sesión. Inicia sesión nuevamente.',"error");
      setTimeout(() => {
        window.location.href = '../vistas/login.html';
      }, 3000); 
      return;
    }

    if (!usuarioLogueado?.id || isNaN(parseInt(usuarioLogueado.id))) {
      showMessage('ID de usuario inválido. Inicia sesión nuevamente.',"error");
      setTimeout(() => {
        window.location.href = '../vistas/login.html';
      }, 3000); 
      return;
    }

    const usuario_id = parseInt(usuarioLogueado.id);
    const nombre = document.getElementById('nombreProducto')?.value?.trim();
    const categoriaValue = document.getElementById('categoria')?.value;
    const valorValue = document.getElementById('valorEstimado')?.value;
    const descripcion = document.getElementById('descripcionProducto')?.value?.trim();
    const calidadRadio = document.querySelector('input[name="idCalidad"]:checked');

    if (!nombre) {
      showMessage('El nombre del producto es obligatorio.',"warning");
      document.getElementById('nombreProducto')?.focus();
      return;
    }

    if (!categoriaValue || categoriaValue === '0') {
      showMessage('Debes seleccionar una categoría.',"warning");
      document.getElementById('categoria')?.focus();
      return;
    }

    if (!valorValue || valorValue === '0') {
      showMessage('El valor estimado es obligatorio y debe ser mayor a 0.',"warning");
      document.getElementById('valorEstimado')?.focus();
      return;
    }

    if (!descripcion) {
      showMessage('La descripción del producto es obligatoria.',"warning");
      document.getElementById('descripcionProducto')?.focus();
      return;
    }

    if (!calidadRadio) {
      showMessage('Debes seleccionar la calidad del producto.',"warning");
      return;
    }

    const categoria = parseInt(categoriaValue);
    const valor = parseFloat(valorValue);
    const calidad = parseInt(calidadRadio.value);

    if ([categoria, valor, calidad].some(n => isNaN(n) || n <= 0)) {
      showMessage('Hay valores invalidos en categoría, valor o calidad.',"error");
      return;
    }

    // Crear FormData con los nombres exactos que espera el servidor
    const formData = new FormData();
    formData.append('nombreProducto', nombre);
    formData.append('descripcionProducto', descripcion);
    formData.append('valorEstimado', String(valor));
    // Usar exactamente los nombres que muestra Postman
    formData.append('idCategoria', String(categoria));
    formData.append('idCalidad', String(calidad));
    formData.append('usuario_id', String(usuario_id));

    const imagenInput = document.getElementById('imagenProducto');
    if (imagenInput?.files?.[0]) {
      console.log('Imagen seleccionada:', imagenInput.files[0]);
      // Usar 'imagen' como nombre del campo para el archivo
      formData.append('imagen', imagenInput.files[0]);
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const textoOriginal = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publicando...';

    try {
      // No usar proxy CORS a menos que sea necesario para desarrollo
      const response = await fetch('http://54.87.124.61/api/products', {
        method: 'POST',
        body: formData
        // No incluyas Content-Type en los headers cuando usas FormData, 
        // el navegador lo configurará automáticamente con el boundary correcto
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { message: 'No se pudo obtener respuesta del servidor' };
      }

      if (!response.ok) {
        showMessage(responseData.message || 'Error en el servidor', "error");
        throw new Error(responseData.message || 'Error al publicar');
      }

      showMessage('Producto publicado exitosamente.',"success");
      form.reset();
      document.getElementById('preview-imagen').style.display = 'none';
      setTimeout(() => {
        window.location.href = '../vistas/MisProductos.html';
      }, 3000); 

    } catch (error) {
      console.error('Error completo:', error);
      const msg = error.message;
      if (msg.includes('campos') || msg.includes('NumberFormatException')) {
        showMessage("Error en los campos enviados.","error");
      } else if (msg.includes('usuario')) {
        showMessage("Error con el usuario. Inicia sesión nuevamente.","error");
        setTimeout(() => {
          window.location.href = '../vistas/login.html';
        }, 3000);
      } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        showMessage("No se pudo conectar con el servidor. Puede ser un problema de CORS.","error");
        console.log('Para desarrollo, considera usar una extensión CORS o configurar un proxy.');
      } else {
        showMessage(`Error al publicar el producto: ${msg}`,"error");
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = textoOriginal;
    }
  });

  function previsualizarImagen() {
    const input = document.getElementById('imagenProducto');
    const preview = document.getElementById('preview-imagen');
    
    if (input?.files?.[0]) {
      const file = input.files[0];
      
      // Verificar el tamaño del archivo (en bytes)
      if (file.size > 2000000) { // 2MB (ajustado del límite anterior)
        showMessage('La imagen es demasiado grande. El tamaño máximo es 2MB.', 'warning');
        input.value = ''; // Limpiar el input
        return;
      }
      
      const reader = new FileReader();
      reader.onload = e => {
        // Crear una imagen para redimensionar
        const img = new Image();
        img.onload = function() {
          // Redimensionar imagen si es necesario
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Mantener relación de aspecto pero limitar tamaño máximo
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Mostrar la imagen redimensionada en el preview
          preview.src = canvas.toDataURL('image/jpeg', 0.8); // Aumentar calidad a 80%
          preview.style.display = 'block';
          
          // Reemplazar el archivo en el input con la versión redimensionada
          canvas.toBlob(blob => {
            const newFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: new Date().getTime()
            });
            
            // Crear un nuevo FileList (no se puede modificar el original directamente)
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(newFile);
            input.files = dataTransfer.files;
            
            console.log('Imagen redimensionada:', newFile.size, 'bytes');
          }, 'image/jpeg', 0.8);
        };
        
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  const imagenInput = document.getElementById('imagenProducto');
  if (imagenInput) {
    imagenInput.addEventListener('change', previsualizarImagen);
  }

  const nombreInput = document.getElementById('nombreProducto');
  const descripcionInput = document.getElementById('descripcionProducto');
  const valorInput = document.getElementById('valorEstimado');

  nombreInput?.addEventListener('input', function () {
    this.setCustomValidity(this.value.trim().length < 3 ? 'Debe tener al menos 3 caracteres.' : '');
  });

  descripcionInput?.addEventListener('input', function () {
    this.setCustomValidity(this.value.trim().length < 10 ? 'Debe tener al menos 10 caracteres.' : '');
  });

  valorInput?.addEventListener('input', function () {
    const valor = parseFloat(this.value);
    this.setCustomValidity(isNaN(valor) || valor <= 0 ? 'Debe ser un número mayor a 0.' : '');
  });

  function validarAccesoFormulario() {
    try {
      const usuario = JSON.parse(localStorage.getItem('sesion'));
      if (!usuario?.id) {
        showMessage('Debes iniciar sesión para publicar productos.',"warning");
        setTimeout(() => {
          window.location.href = '../vistas/login.html';
        }, 3000); 
        return false;
      }
      return true;
    } catch (e) {
      showMessage('Error al verificar la sesión.',"error");
      setTimeout(() => {
        window.location.href = '../vistas/login.html';
      }, 3000);
      return false;
    }
  }
});

function showMessage(message, tipo = 'info') {
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');

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
    if (messageDiv) {
        messageDiv.style.display = 'block';
        messageDiv.textContent = message;
    }
}