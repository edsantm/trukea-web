function mostrarAlerta(tipo, mensaje) {
  const alerta = document.getElementById('alerta');
  const texto = document.getElementById('alerta-mensaje');

  alerta.classList.remove('exito', 'error', 'oculto');
  alerta.classList.add(tipo); // exito o error
  texto.textContent = mensaje;

  alerta.style.opacity = '1';
  alerta.style.top = '0';

  setTimeout(() => {
    alerta.classList.add('oculto');
    alerta.style.opacity = '0';
    alerta.style.top = '-60px';
  }, 4000);
}

const API_BASE_URL = 'http://localhost:3000/api/';

// Función para verificar si el email ya existe
async function verificarEmailExiste(email) {
  try {
    const response = await fetch(`http://localhost:3000/api/auth/register${encodeURIComponent(email)}`);
    if (response.ok) {
      return true; // El usuario ya existe
    }
    return false; // El usuario no existe (404 o similar)
  } catch (error) {
    console.log('Email no encontrado o error de red:', error);
    return false;
  }
}

// Función para registrar usuario en la API
async function registrarUsuario(datosUsuario) {
  try {
    const response = await fetch(`http://localhost:3000/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(datosUsuario)
    });

    // Primero intentamos obtener el texto de la respuesta
    const responseText = await response.text();
    
    if (!response.ok) {
      let errorMessage = `Error HTTP: ${response.status}`;
      
      // Intentamos parsear como JSON si es posible
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Si no es JSON válido, usamos el texto tal como está
        errorMessage = responseText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    // Intentamos parsear la respuesta exitosa
    try {
      return JSON.parse(responseText);
    } catch (e) {
      // Si la respuesta no es JSON, retornamos un objeto básico
      return { message: 'Usuario creado exitosamente', email: datosUsuario.email };
    }
    
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Cambié el selector para usar el ID correcto del botón
  const btnContinuar = document.getElementById("btnRegistrar");

  btnContinuar.addEventListener("click", async function () {
    // Declarar correctamente todas las variables con los IDs correctos
    const nombre = document.getElementById('name');
    const apellido = document.getElementById('lastname'); // Cambiar el ID en HTML también
    const email = document.getElementById('email');
    const pass = document.getElementById('password');
    const confirm = document.getElementById('confirmPassword');

    const campos = [nombre, apellido, email, pass, confirm];
    let hayError = false;

    // Resetear estilos de campos
    campos.forEach(input => {
      if (input) { // Verificar que el elemento existe
        input.style.border = "1px solid gray";
      }
    });

    // Validar campos vacíos
    campos.forEach(input => {
      if (input && input.value.trim() === "") {
        input.style.border = "2px solid red";
        hayError = true;
      }
    });

    if (hayError) {
      mostrarAlerta("error", "❌ Todos los campos son obligatorios.");
      return; // No continuar
    }

    if (pass.value.length < 6) {
      pass.style.border = "2px solid red";
      mostrarAlerta("error", "❌ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Validar que las contraseñas coincidan
    if (pass.value !== confirm.value) {
      confirm.style.border = "2px solid red";
      mostrarAlerta("error", "❌ Las contraseñas no coinciden.");
      return;
    }

    // ✅ Si todo está bien, llamar a la API
    const datosUsuario = {
      nombre: nombre.value,
      apellido: apellido.value,
      email: email.value,
      password: pass.value
    };

    mostrarAlerta("exito", "✔️ Registrando usuario...");

    try {
      // AQUÍ SÍ LLAMAMOS A LA API
      const resultado = await registrarUsuario(datosUsuario);
      
      // Si llegamos aquí, el registro fue exitoso
      localStorage.setItem('registroData', JSON.stringify(datosUsuario));
      mostrarAlerta("exito", "✔️ Usuario registrado exitosamente. Redirigiendo...");
      
      setTimeout(() => {
        window.location.href = './RegistrarCiudad.html';
      }, 1500);
      
    } catch (error) {
      // Si hay error en la API, mostramos el mensaje
      mostrarAlerta("error", "❌ Error al registrar: " + error.message);
    }
  });
});