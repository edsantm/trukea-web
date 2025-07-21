// Función para mostrar banner de alerta
function mostrarAlerta(mensaje) {
  const alerta = document.getElementById('alerta');
  const texto = document.getElementById('alerta-mensaje');
  const icono = document.getElementById('alerta-icono');

  alerta.classList.remove('oculto');
  alerta.style.top = '0';
  alerta.style.opacity = '1';

  alerta.classList.add('error');
  texto.textContent = mensaje;
  icono.textContent = '❌';

  setTimeout(() => {
    alerta.classList.add('oculto');
    alerta.style.top = '-60px';
    alerta.style.opacity = '0';
  }, 4000);
}

document.addEventListener("DOMContentLoaded", function () {
  const boton = document.querySelector(".text-wrapper-5"); // botón "Registrarse"
  boton.addEventListener("click", function (e) {
    const nombre = document.querySelector("input").value.trim();
    const ciudad = document.querySelector("select").value;

    if (nombre === "" || ciudad === "") {
      e.preventDefault(); // previene el cambio de página
      mostrarAlerta("Por favor, completa todos los campos.");
    }
  });
});
