function showMessage(text, estado = 'info', duration = 4000,errores = []) {
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

       // Limpiar errores previos
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    // Marcar campos con error si se pasan
    errores.forEach(selector => {
        const campo = document.querySelector(selector);
        if (campo) campo.classList.add('input-error');
    });

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


document.addEventListener("DOMContentLoaded", function () {
 const alerta = document.getElementById('alerta');
  if (alerta) {
    alerta.classList.add('oculto');
    alerta.style.opacity = '0';
    alerta.style.top = '-60px';
  }
  const inputImagen = document.getElementById("input-imagen");
  const btnCambiar = document.getElementById("btnCambiarImagen");
  const vistaPrevia = document.getElementById("vista-previa");
  
  // Abrir el selector de archivos al hacer clic en el botón
  btnCambiar.addEventListener("click", function () {
    inputImagen.click();
 
  });

  // Mostrar la imagen seleccionada
  inputImagen.addEventListener("change", function () {
    const archivo = inputImagen.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = function (e) {
        vistaPrevia.innerHTML = `<img src="${e.target.result}" alt="Imagen de perfil">`;
      };
      lector.readAsDataURL(archivo);
    }
  });

 const form = document.querySelector(".formulario");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const inputs = form.querySelectorAll("input");
    let camposVacios = false;

    inputs.forEach(input => {
      if (input.value.trim() === "") {
        camposVacios = true;
        input.style.border = "2px solid red";
      } else {
        input.style.border = "1px solid gray";
      }
    });

    if (camposVacios) {
      showMessage(" Por favor, completa todos los campos.","error",4000,['#nombreUsuario', '#apellidos','#ciudad', '#fechaNacimiento']);
      return;
    }

    showMessage("✔️ Los cambios se han guardado exitosamente.","success",4000);
  });
});


  async function obtenerDatosUsuario() {
  const token = localStorage.getItem('sesion');
  const usuario = JSON.parse(token);
  const id_usuario = usuario.id // Ajusta si usas sesión u otro mecanismo
  const res = await fetch(`http://localhost:3000/api/users/profile/${id_usuario}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error(`Error al cargar perfil: ${res.status}`);
  return await res.json(); // espera { nombre, apellidos, ciudad, fechaNacimiento, imagenPerfil }
}

async function cargarDatosEnFormulario() {
  try {
    const usuario = await obtenerDatosUsuario();
    document.getElementById('nombreUsuario').value = usuario.nombre || '';
    document.getElementById('apellidos').value = usuario.apellidos || '';
    document.getElementById('ciudad').value = usuario.ciudad || '';
    document.getElementById('fechaNacimiento').value = usuario.fechaNacimiento || '';
    if (usuario.imagenPerfil) {
      document.getElementById('imagenPerfilPreview').src = usuario.imagenPerfil;
    }
  } catch (error) {
    console.error(error);
    alert('❌ No se pudo cargar tu perfil.');
  }
}

function configurarCambioImagen() {
  const input = document.getElementById('imagenPerfilInput');
  const preview = document.getElementById('imagenPerfilPreview');
  const btn = document.getElementById('btnCambiarImagen');

  btn.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    const archivo = input.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onload = e => preview.src = e.target.result;
      reader.readAsDataURL(archivo);
    }
  });
}

async function guardarCambios() {
  const token = localStorage.getItem('token');
  const formData = new FormData();

  formData.append('nombre', document.getElementById('nombreUsuario').value);
  formData.append('apellidos', document.getElementById('apellidos').value);
  formData.append('ciudad', document.getElementById('ciudad').value);
  formData.append('fechaNacimiento', document.getElementById('fechaNacimiento').value);


  try {
    const res = await fetch('https://tu-api.com/api/usuarios/miperfil', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || `Error ${res.status}`);
    }
    alert('✅ Perfil actualizado con éxito');
    // si deseas, puedes recargar o redirigir:
    // window.location.reload();
  } catch (error) {
    console.error(error);
    alert('❌ No se pudo guardar los cambios.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarDatosEnFormulario();
  document.getElementById('btnGuardar').addEventListener('click', guardarCambios);
});
;
