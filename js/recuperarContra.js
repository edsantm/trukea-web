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
  const form = document.querySelector("form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const inputs = form.querySelectorAll("input[type='password']");
    const pass1 = inputs[0].value.trim();
    const pass2 = inputs[1].value.trim();
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
      mostrarAlerta("error", "❌ Por favor, completa todos los campos.");
      return;
    }

    if (pass1.length < 6) {
      mostrarAlerta("error", "❌ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (pass1 !== pass2) {
      mostrarAlerta("error", "❌ Las contraseñas no coinciden.");
      return;
    }

    mostrarAlerta("exito", "✔️ Contraseña restablecida correctamente.");
  });
});
