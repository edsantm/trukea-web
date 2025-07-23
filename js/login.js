document.addEventListener("DOMContentLoaded", function () {
  const correoInput = document.getElementById("correo");
  const contrasenaInput = document.getElementById("contrasena");
  const btnLogin = document.getElementById("btnLogin");

  btnLogin.addEventListener("click", function () {
    const correo = correoInput.value.trim();
    const contrasena = contrasenaInput.value.trim();

    if (!correo || !contrasena) {
      mostrarAlerta("error", "Por favor completa todos los campos.");
      return;
    }

    fetch("http://localhost:8082/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo, contrasena })
    })
      .then(response => response.json())
      .then(data => {
        if (data.exito) {
          mostrarAlerta("exito", "Inicio de sesión exitoso.");

          // Guardar info si quieres usarla después
          localStorage.setItem("idUsuario", data.usuario.id);
          localStorage.setItem("nombre", data.usuario.nombre);
          localStorage.setItem("correo", data.usuario.correo);

          setTimeout(() => {
            window.location.href = "./ExplorarTrueque.html";
          }, 1000);
        } else {
          mostrarAlerta("error", data.mensaje || "Correo o contraseña incorrectos.");
        }
      })
      .catch(error => {
        console.error("Error en la solicitud:", error);
        mostrarAlerta("error", "No se pudo conectar con el servidor.");
      });
  });

  function mostrarAlerta(tipo, mensaje) {
    const alerta = document.getElementById("alerta");
    const texto = document.getElementById("alerta-mensaje");

    alerta.classList.remove("oculto", "error", "exito");
    alerta.classList.add(tipo);
    texto.textContent = mensaje;

    setTimeout(() => {
      alerta.classList.add("oculto");
    }, 3000);
  }
});
