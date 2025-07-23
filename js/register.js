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

const API_BASE_URL = 'http://localhost:8082/api';

// Función para verificar si el email ya existe
async function verificarEmailExiste(email) {
  try {
    const response = await fetch(`http://localhost:8082/api/usuarios/${encodeURIComponent(email)}`);
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
    const response = await fetch(`http://localhost:8082/api/usuarios`, {
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
  const btnContinuar = document.querySelector(".Continuar");

  btnContinuar.addEventListener("click", async function () {
    const nombre = document.getElementById('name');
    const apellido = document.getElementById('last name');
    const email = document.getElementById('email');
    const pass = document.getElementById('password');
    const confirm = document.getElementById('confirmPassword');

    const campos = [nombre, apellido, email, pass, confirm];
    let hayError = false;

    // Resetear estilos de campos
    campos.forEach(input => {
      input.style.border = "1px solid gray";
    });

    // Validar campos vacíos
    campos.forEach(input => {
      if (input.value.trim() === "") {
        input.style.border = "2px solid red";
        hayError = true;
      }
    });

    if (hayError) {
      mostrarAlerta("error", "❌ Todos los campos son obligatorios.");
      return;
    }

    // Validar que el nombre solo contenga letras
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!soloLetras.test(nombre.value.trim())) {
      nombre.style.border = "2px solid red";
      mostrarAlerta("error", "❌ El nombre solo debe contener letras.");
      return;
    }

    if (!soloLetras.test(apellido.value.trim())) {
      apellido.style.border = "2px solid red";
      mostrarAlerta("error", "❌ El apellido solo debe contener letras.");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      email.style.border = "2px solid red";
      mostrarAlerta("error", "❌ Ingresa un correo electrónico válido.");
      return;
    }

    // Validar longitud mínima de contraseña
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

    // Preparar datos del usuario para la API
    const datosUsuario = {
      nombre: nombre.value.trim(),
      apellido: apellido.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: pass.value
    };

    try {
      // Deshabilitar botón y mostrar estado de carga
      btnContinuar.disabled = true;
      btnContinuar.textContent = "Verificando...";
      btnContinuar.style.opacity = "0.6";
      
      // Verificar si el email ya existe
      const emailExiste = await verificarEmailExiste(datosUsuario.email);
      if (emailExiste) {
        email.style.border = "2px solid red";
        mostrarAlerta("error", "❌ El correo electrónico ya está registrado.");
        return;
      }

      // Cambiar texto del botón
      btnContinuar.textContent = "Registrando...";
      mostrarAlerta("exito", "⏳ Creando tu cuenta...");
      
      // Registrar usuario
      const usuarioCreado = await registrarUsuario(datosUsuario);
      
      // Guardar datos del usuario en localStorage para la siguiente página
      const datosGuardar = {
        id: usuarioCreado.id || Date.now(), // Fallback si no viene ID
        nombre: usuarioCreado.nombre || datosUsuario.nombre,
        apellido: usuarioCreado.apellido || datosUsuario.apellido,
        email: usuarioCreado.email || datosUsuario.email
      };
      
      localStorage.setItem('usuarioRegistrado', JSON.stringify(datosGuardar));

      mostrarAlerta("exito", "✔️ Usuario registrado exitosamente. Redirigiendo...");

      // Esperar antes de redirigir
      setTimeout(() => {
        window.location.href = './RegistrarCiudad.html';
      }, 1500);

    } catch (error) {
      console.error('Error completo:', error);
      
      // Manejar diferentes tipos de errores
      let mensajeError = "❌ Error al registrar usuario.";
      
      if (error.message.includes("email") || error.message.includes("correo") || 
          error.message.includes("Email") || error.message.includes("duplicate")) {
        mensajeError = "❌ El correo electrónico ya está registrado.";
        email.style.border = "2px solid red";
      } else if (error.message.includes("400")) {
        mensajeError = "❌ Datos inválidos. Verifica la información ingresada.";
      } else if (error.message.includes("500")) {
        mensajeError = "❌ Error del servidor. Inténtalo más tarde.";
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        mensajeError = "❌ Error de conexión. Verifica tu internet.";
      } else if (error.message && error.message !== "Error HTTP: 500") {
        mensajeError = `❌ ${error.message}`;
      }
      
      mostrarAlerta("error", mensajeError);
      
    } finally {
      // Rehabilitar botón en cualquier caso
      btnContinuar.disabled = false;
      btnContinuar.textContent = "Continuar";
      btnContinuar.style.opacity = "1";
    }
  });
});