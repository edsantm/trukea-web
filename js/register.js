document.getElementById('btnRegistrar').addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const lastName = document.getElementById('last name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validación básica
    if (!name || !lastName || !email || !password || !confirmPassword) {
        alert("Por favor completa todos los campos.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    const nuevoUsuario = {
        name: name,
        lastName: lastName,
        email: email,
        password: password,
        confirmPassword : confirmPassword
    };

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario)
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

  btnContinuar.addEventListener("click", function () {
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
      return; // 🔴 No continuar
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

    // ✅ Si todo está bien, guardar y redirigir después de un tiempo
    localStorage.setItem('registroData', JSON.stringify({
      email: email.value,
      password: pass.value
    }));

    mostrarAlerta("exito", "✔️ Datos validados. Redirigiendo...");

    window.location.href = './RegistrarCiudad.html';
    }, 1500);
  });

