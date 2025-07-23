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

document.addEventListener("DOMContentLoaded", function () {
  const btnContinuar = document.querySelector(".Continuar");

  btnContinuar.addEventListener("click", async function () {
    const email = document.getElementById('email');
    const pass = document.getElementById('password');
    const confirm = document.getElementById('confirmPassword');

    const campos = [email, pass, confirm];
    let hayError = false;

    // Validar campos vacíos
    campos.forEach(input => {
      if (input.value.trim() === "") {
        input.style.border = "2px solid red";
        hayError = true;
      } else {
        input.style.border = "1px solid gray";
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

    // 🔄 Conectar con tu API de registro
    try {
      const response = await fetch("http://localhost:3000/api/register", { // 👈 Cambia a tu URL real
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo: email.value,
          contrasena: pass.value
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar.");
      }

      mostrarAlerta("exito", "✔️ Registro exitoso. Redirigiendo...");

      setTimeout(() => {
        window.location.href = './RegistrarCiudad.html';
      }, 1500);

    } catch (error) {
      mostrarAlerta("error", "❌ " + error.message);
      console.error("Error en registro:", error);
    }
  });
});
