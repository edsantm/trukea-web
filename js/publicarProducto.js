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

    const formData = new FormData();
    formData.append('nombreProducto', nombre);
    formData.append('descripcionProducto', descripcion);
    formData.append('valorEstimado', String(valor));
    formData.append('idCategoria', String(categoria));
    formData.append('idCalidad', String(calidad));
    formData.append('usuario_id', String(usuario_id));

    const imagenInput = document.getElementById('imagenProducto');
    if (imagenInput?.files?.[0]) {
      formData.append('imagen', imagenInput.files[0]);
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const textoOriginal = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publicando...';

    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        showMessage(responseData.message,"error");
        throw new Error(responseData.message || 'Error al publicar');
      }

      showMessage('Producto publicado exitosamente.',"success");
      form.reset();
      setTimeout(() => {
        window.location.href = '../vistas/MisProductos.html';
      }, 3000); 

    } catch (error) {
      const msg = error.message;
      if (msg.includes('campos') || msg.includes('NumberFormatException')) {
        showMessage("Error en los campos enviados.","error");
      } else if (msg.includes('usuario')) {
        showMessage("Error con el usuario. Inicia sesión nuevamente.","error");

        setTimeout(() =>{
          window.location.href = '../vistas/login.html';
        }, 3000)
      } else if (msg.includes('Failed to fetch')) {
        showMessage("No se pudo conectar con el servidor.","error");

      } else {
        showMessage(` Error al publicar el producto: ${msg}`,"error");
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
      const reader = new FileReader();
      reader.onload = e => {
        if (preview) {
          preview.src = e.target.result;
          preview.style.display = 'block';
        }
      };
      reader.readAsDataURL(input.files[0]);
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
    const usuario = JSON.parse(localStorage.getItem('sesion'));
    if (!usuario?.id) {
    showMessage('Debes inciar sesion para publicar productos.',"warning");

      setTimeout(() => {
        window.location.href = '../vistas/login.html';
      }, 3000); 
      return fale;
    }
    return true;
  }
});

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
