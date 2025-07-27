function mostrarAlerta(tipo, mensaje) {
  const alerta = document.getElementById('alerta');
  const texto = document.getElementById('alerta-mensaje');

  alerta.classList.remove('exito', 'error', 'oculto');
  alerta.classList.add(tipo);
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


async function registrarUsuario(datosUsuario) {
  console.log(' Enviando datos a API:', datosUsuario);
  
  try {
    const response = await fetch(`http://localhost:3000/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(datosUsuario)
    });

    console.log(' Status respuesta:', response.status);

    
    const responseData = await response.json();
    console.log(' Respuesta completa:', responseData);
    
    if (!response.ok || !responseData.success) {
      
      throw new Error(responseData.message || `Error HTTP: ${response.status}`);
    }

    // Si llegamos aquí, fue exitoso
    console.log(' Registro exitoso:', responseData);
    return responseData;
    
  } catch (error) {
    console.error(' Error al registrar:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar al servidor. ¿Está corriendo tu API Java en localhost:3000?');
    }
    
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  console.log(' DOM cargado');
  
  const btnContinuar = document.getElementById("btnRegistrar");
  
  if (!btnContinuar) {
    console.error('❌ No se encontró el botón btnRegistrar');
    return;
  }
  
  console.log('✅ Botón encontrado');

  btnContinuar.addEventListener("click", async function () {
    console.log(' BOTÓN CLICKEADO');
    
    const nombre = document.getElementById('name');
    const apellido = document.getElementById('lastname');
    const email = document.getElementById('email');
    const pass = document.getElementById('password');
    const confirm = document.getElementById('confirmPassword');

    // Verificar que todos los elementos existen
    if (!nombre || !apellido || !email || !pass || !confirm) {
      console.error('❌ Algunos campos no se encontraron');
      mostrarAlerta("error", "❌ Error en los campos del formulario.");
      return;
    }

    const campos = [nombre, apellido, email, pass, confirm];
    let hayError = false;

    
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

    if (pass.value.length < 6) {
      pass.style.border = "2px solid red";
      mostrarAlerta("error", "❌ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (pass.value !== confirm.value) {
      confirm.style.border = "2px solid red";
      mostrarAlerta("error", "❌ Las contraseñas no coinciden.");
      return;
    }

    
    const datosUsuario = {
      name: nombre.value,              // ← Tu API espera "name"
      lastName: apellido.value,        // ← Tu API espera "lastName"  
      email: email.value,              // ← Correcto
      password: pass.value,            // ← Correcto
      confirmPassword: confirm.value   
    };

    console.log(' Datos preparados para API:', datosUsuario);
    mostrarAlerta("exito", " Registrando usuario...");

    try {
      const resultado = await registrarUsuario(datosUsuario);
      
      // Si llegamos aquí, el registro fue exitoso
      console.log('✅ Usuario registrado:', resultado);
      
      // Guardar datos para la siguiente página
      localStorage.setItem('registroData', JSON.stringify({
        name: nombre.value,
        lastName: apellido.value,
        email: email.value,
        userId: resultado.data?.userId // Si tu API retorna el ID
      }));
      
      mostrarAlerta("exito", "✔️ " + resultado.message + " Redirigiendo...");
      
      setTimeout(() => {
        window.location.href = './RegistrarCiudad.html';
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error:', error);
      mostrarAlerta("error", "❌ " + error.message);
    }
  });
  
  console.log('✅ Event listener agregado');
});