document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-producto');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Obtener usuario desde sesión/localStorage
    let usuarioLogueado;
    try {
      const sesionData = localStorage.getItem('sesion');
      console.log('🔍 Datos brutos de sesión:', sesionData);
      
      if (!sesionData) {
        throw new Error('No hay datos de sesión');
      }
      
      usuarioLogueado = JSON.parse(sesionData);
      console.log('👤 Usuario parseado:', usuarioLogueado);
      
    } catch (error) {
      console.error('❌ Error al obtener datos de sesión:', error);
      alert('⚠️ Error en los datos de sesión. Inicia sesión nuevamente.');
      window.location.href = '../index.html';
      return;
    }

    // Verificar que el usuario tenga ID válido
    if (!usuarioLogueado || !usuarioLogueado.id) {
      console.error('❌ Usuario sin ID válido:', usuarioLogueado);
      alert('⚠️ No se encontró el ID del usuario. Inicia sesión nuevamente.');
      window.location.href = '../index.html';
      return;
    }

    // Convertir ID a número para asegurar que sea válido
    const usuario_id = parseInt(usuarioLogueado.id);
    
    if (isNaN(usuario_id) || usuario_id <= 0) {
      console.error('❌ ID de usuario inválido:', usuarioLogueado.id);
      alert('⚠️ ID de usuario inválido. Inicia sesión nuevamente.');
      window.location.href = '../index.html';
      return;
    }
    
    console.log('✅ ID de usuario válido:', usuario_id);

    // Obtener valores del formulario con validación estricta
    const nombre = document.getElementById('nombreProducto')?.value?.trim();
    const categoriaValue = document.getElementById('categoria')?.value;
    const valorValue = document.getElementById('valorEstimado')?.value;
    const descripcion = document.getElementById('descripcionProducto')?.value?.trim();
    const calidadRadio = document.querySelector('input[name="idCalidad"]:checked');

    console.log('📋 Valores del formulario:');
    console.log('- Nombre:', nombre);
    console.log('- Categoría (raw):', categoriaValue);
    console.log('- Valor (raw):', valorValue);
    console.log('- Descripción:', descripcion);
    console.log('- Calidad radio:', calidadRadio);

    // Validación de campos obligatorios
    if (!nombre) {
      alert('⚠️ El nombre del producto es obligatorio.');
      document.getElementById('nombreProducto')?.focus();
      return;
    }

    if (!categoriaValue || categoriaValue === '' || categoriaValue === '0') {
      alert('⚠️ Debes seleccionar una categoría.');
      document.getElementById('categoria')?.focus();
      return;
    }

    if (!valorValue || valorValue === '' || valorValue === '0') {
      alert('⚠️ El valor estimado es obligatorio y debe ser mayor a 0.');
      document.getElementById('valorEstimado')?.focus();
      return;
    }

    if (!descripcion) {
      alert('⚠️ La descripción del producto es obligatoria.');
      document.getElementById('descripcionProducto')?.focus();
      return;
    }

    if (!calidadRadio) {
      alert('⚠️ Debes seleccionar la calidad del producto.');
      return;
    }

    // Convertir valores a números
    const categoria = parseInt(categoriaValue);
    const valor = parseFloat(valorValue);
    const calidad = parseInt(calidadRadio.value);

    // Validar conversiones numéricas
    if (isNaN(categoria) || categoria <= 0) {
      alert('⚠️ Categoría inválida. Selecciona una categoría válida.');
      return;
    }

    if (isNaN(valor) || valor <= 0) {
      alert('⚠️ Valor estimado inválido. Debe ser un número mayor a 0.');
      return;
    }

    if (isNaN(calidad) || calidad <= 0) {
      alert('⚠️ Calidad inválida. Selecciona una calidad válida.');
      return;
    }

    console.log('✅ Valores convertidos:');
    console.log('- Categoría ID:', categoria);
    console.log('- Valor:', valor);
    console.log('- Calidad ID:', calidad);

    // Crear FormData en lugar de JSON (según tu API controller)
    const formData = new FormData();
    
    // Agregar campos según los nombres que espera tu API
    formData.append('nombreProducto', String(nombre));
    formData.append('descripcionProducto', String(descripcion));
    formData.append('valorEstimado', String(valor));  // Tu API parsea con Double.parseDouble()
    formData.append('idCategoria', String(categoria)); // Tu API usa "idCategoria", no "categoriaId"
    formData.append('idCalidad', String(calidad));     // Tu API usa "idCalidad", no "calidadId"
    formData.append('usuario_id', String(usuario_id)); // Tu API usa "usuario_id", no "usuarioId"
    
    // Agregar imagen si existe
    const imagenInput = document.getElementById('imagenProducto');
    if (imagenInput && imagenInput.files && imagenInput.files[0]) {
      formData.append('imagen', imagenInput.files[0]);
      console.log('📸 Imagen agregada:', imagenInput.files[0].name);
    } else {
      console.log('📷 Sin imagen seleccionada');
    }

    // Mostrar contenido del FormData para debugging
    console.log('📤 FormData a enviar:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`- ${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`- ${key}: ${value} (tipo: ${typeof value})`);
      }
    }

    // Deshabilitar botón de envío durante la petición
    const submitBtn = form.querySelector('button[type="submit"]');
    const textoOriginal = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publicando...';

    try {
      console.log('📤 Enviando FormData a la API...');
      console.log('🔗 URL:', 'http://localhost:3000/api/products');

      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        // NO incluir Content-Type header cuando usas FormData
        // El navegador lo establece automáticamente con el boundary correcto
        body: formData  // Enviar FormData directamente
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      let responseData;
      try {
        responseData = await response.json();
        console.log('📥 Response data:', responseData);
      } catch (jsonError) {
        console.error('❌ Error parsing JSON response:', jsonError);
        const textResponse = await response.text();
        console.log('📄 Raw response:', textResponse);
        throw new Error(`Error del servidor (${response.status}): ${textResponse}`);
      }

      if (!response.ok) {
        console.error('❌ API Error:', responseData);
        throw new Error(responseData.message || responseData.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Éxito
      console.log('✅ Producto creado exitosamente:', responseData);
      alert('✅ Producto publicado exitosamente');
      form.reset(); 

      window.location.href = '../vistas/MisProductos.html';

    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error stack:', error.stack);
      
      // Mostrar error más específico
      let errorMessage = error.message;
      
      if (errorMessage.includes('campos son obligatorios')) {
        alert('❌ Faltan campos obligatorios. Verifica que todos los campos estén llenos.');
      } else if (errorMessage.includes('NumberFormatException')) {
        alert('❌ Error en formato de números. Verifica los valores numéricos.');
      } else if (errorMessage.includes('usuario')) {
        alert('❌ Error con el usuario. Inicia sesión nuevamente.');
        window.location.href = '../index.html';
      } else if (errorMessage.includes('Failed to fetch')) {
        alert('❌ No se pudo conectar con el servidor. Verifica que la API esté funcionando.');
      } else {
        alert(`❌ Error al publicar el producto: ${errorMessage}`);
      }
    } finally {
      // Restaurar botón de envío
      submitBtn.disabled = false;
      submitBtn.textContent = textoOriginal;
    }
  });

  // Función para previsualizar imagen (opcional)
  function previsualizarImagen() {
    const input = document.getElementById('imagenProducto');
    const preview = document.getElementById('preview-imagen');
    
    if (input && input.files && input.files[0]) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        if (preview) {
          preview.src = e.target.result;
          preview.style.display = 'block';
        }
      };
      
      reader.readAsDataURL(input.files[0]);
    }
  }

  // Agregar listener para previsualización de imagen si existe el input
  const imagenInput = document.getElementById('image-placeholder');
  if (imagenInput) {
    imagenInput.addEventListener('change', previsualizarImagen);
  }

  // Validación en tiempo real
  const nombreInput = document.getElementById('nombreProducto');
  const descripcionInput = document.getElementById('descripcionProducto');
  const valorInput = document.getElementById('valorEstimado');

  if (nombreInput) {
    nombreInput.addEventListener('input', function() {
      if (this.value.trim().length < 3) {
        this.setCustomValidity('El nombre debe tener al menos 3 caracteres.');
      } else {
        this.setCustomValidity('');
      }
    });
  }

  if (descripcionInput) {
    descripcionInput.addEventListener('input', function() {
      if (this.value.trim().length < 10) {
        this.setCustomValidity('La descripción debe tener al menos 10 caracteres.');
      } else {
        this.setCustomValidity('');
      }
    });
  }

  if (valorInput) {
    valorInput.addEventListener('input', function() {
      const valor = parseFloat(this.value);
      if (isNaN(valor) || valor <= 0) {
        this.setCustomValidity('El valor debe ser un número mayor a 0.');
      } else {
        this.setCustomValidity('');
      }
    });
  }
});

// Función auxiliar para debugging mejorada
function mostrarDatosSesion() {
  console.log('🔍 === DEBUGGING DE SESIÓN ===');
  
  const sesion = localStorage.getItem('sesion');
  console.log('📦 Datos brutos de localStorage:', sesion);
  
  if (sesion) {
    try {
      const usuario = JSON.parse(sesion);
      console.log('👤 Usuario parseado:', usuario);
      console.log('🆔 ID del usuario:', usuario.id, '(tipo:', typeof usuario.id, ')');
      console.log('📧 Email:', usuario.correo || usuario.email);
      console.log('👨‍💼 Nombre:', usuario.nombre);
      
      // Verificar si el ID es válido
      const idNumerico = parseInt(usuario.id);
      if (isNaN(idNumerico)) {
        console.error('❌ ID no es un número válido!');
      } else {
        console.log('✅ ID numérico válido:', idNumerico);
      }
      
    } catch (error) {
      console.error('❌ Error al parsear sesión:', error);
    }
  } else {
    console.log('⚠️ No hay datos de sesión en localStorage');
  }
  
  console.log('🔍 === FIN DEBUGGING ===');
}

// Función para verificar estado del formulario
function debugFormulario() {
  console.log('🔍 === DEBUGGING DE FORMULARIO ===');
  
  const elementos = {
    nombreProducto: document.getElementById('nombreProducto'),
    categoria: document.getElementById('categoria'),
    valorEstimado: document.getElementById('valorEstimado'),
    descripcionProducto: document.getElementById('descripcionProducto'),
    calidadRadio: document.querySelector('input[name="idCalidad"]:checked'),
    imagenProducto: document.getElementById('imagenProducto')
  };
  
  Object.entries(elementos).forEach(([nombre, elemento]) => {
    if (elemento) {
      if (nombre === 'calidadRadio') {
        console.log(`✅ ${nombre}:`, elemento.value, '(checked)');
      } else if (nombre === 'imagenProducto') {
        console.log(`✅ ${nombre}:`, elemento.files ? `${elemento.files.length} archivo(s)` : 'Sin archivos');
      } else {
        console.log(`✅ ${nombre}:`, elemento.value);
      }
    } else {
      console.error(`❌ ${nombre}: Elemento no encontrado en el DOM`);
    }
  });
  
  console.log('🔍 === FIN DEBUGGING FORMULARIO ===');
}

// Función para verificar que el HTML tenga la estructura correcta
function verificarEstructuraHTML() {
  console.log('🔍 === VERIFICANDO ESTRUCTURA HTML ===');
  
  const elementosRequeridos = [
    'form-producto',        // Form principal
    'nombreProducto',       // Input nombre
    'categoria',           // Select categoría
    'valorEstimado',       // Input valor
    'descripcionProducto', // Textarea descripción
    'imagenProducto'       // Input file (opcional)
  ];
  
  elementosRequeridos.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      console.log(`✅ #${id}: Encontrado (${elemento.tagName})`);
    } else {
      console.error(`❌ #${id}: NO ENCONTRADO`);
    }
  });

  
  // Verificar radio buttons de calidad
  const radiosCalidad = document.querySelectorAll('input[name="idCalidad"]');
  console.log(`🔘 Radio buttons calidad: ${radiosCalidad.length} encontrados`);
  
  console.log('🔍 === FIN VERIFICACIÓN HTML ===');
}

// Función para validar que el usuario esté logueado antes de mostrar el formulario
function validarAccesoFormulario() {
  const usuarioLogueado = JSON.parse(localStorage.getItem('sesion'));
  
  if (!usuarioLogueado || !usuarioLogueado.id) {
    alert('⚠️ Debes iniciar sesión para publicar productos.');
    window.location.href = '../index.html';
    return false;
  }
  
  return true;
}

// Ejecutar validación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  validarAccesoFormulario();
  
  // Mostrar datos de sesión en consola para debugging
  mostrarDatosSesion();
  
  // Verificar que el HTML tenga la estructura correcta
  verificarEstructuraHTML();
  
  // Agregar botón de debug (opcional)
  setTimeout(() => {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🔍 Debug';
    debugBtn.type = 'button';
    debugBtn.style.position = 'fixed';
    debugBtn.style.top = '10px';
    debugBtn.style.right = '10px';
    debugBtn.style.zIndex = '9999';
    debugBtn.style.padding = '5px 10px';
    debugBtn.style.backgroundColor = '#007bff';
    debugBtn.style.color = 'white';
    debugBtn.style.border = 'none';
    debugBtn.style.borderRadius = '4px';
    debugBtn.style.cursor = 'pointer';
    
    debugBtn.addEventListener('click', () => {
      mostrarDatosSesion();
      debugFormulario();
      verificarEstructuraHTML();
    });
    
    document.body.appendChild(debugBtn);
  }, 1000);
});