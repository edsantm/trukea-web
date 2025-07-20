function mostrarAlerta(tipo, mensaje) {
  const alerta = document.getElementById('alerta');
  const icono = document.getElementById('alerta-icono');
  const texto = document.getElementById('alerta-mensaje');

  alerta.classList.remove('exito', 'error', 'oculto');
  alerta.classList.add(tipo); // "exito" o "error"

  icono.innerHTML = tipo === 'exito' ? '✔️' : '✖';
  texto.textContent = mensaje;

  alerta.style.opacity = '1';
  alerta.style.top = '0px';

  setTimeout(() => {
    alerta.classList.add('oculto');
    alerta.style.opacity = '0';
    alerta.style.top = '-60px';
  }, 4000);
}

// Ejemplo básico: interceptar envío del formulario
document.addEventListener("DOMContentLoaded", function () {
  const alerta = document.getElementById('alerta');
  if (alerta) {
    alerta.classList.add('oculto');
    alerta.style.opacity = '0';
    alerta.style.top = '-60px';
  }
 const form = document.querySelector("form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Aquí iría tu lógica real de publicación
    // Por ahora, solo mostramos una alerta aleatoria de prueba
    const exito = Math.random() > 0.3;

    if (exito) {
      mostrarAlerta("exito", "✔️ Producto publicado exitosamente.");
    } else {
      mostrarAlerta("error", "❌ Error al publicar el producto.");
    }
  });
});
