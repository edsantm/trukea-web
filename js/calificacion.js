// Esperar a que cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  const estrellas = document.querySelectorAll(".estrellas span");
  const comentarioInput = document.querySelector(".comentario");
  const btnEnviar = document.querySelector(".btn-calificar");
  const alerta = document.querySelector(".alerta");

  let calificacionSeleccionada = 0;

  // Función para marcar las estrellas seleccionadas
  estrellas.forEach((estrella, index) => {
    estrella.addEventListener("click", () => {
      calificacionSeleccionada = index + 1;

      // Resetear todas las estrellas
      estrellas.forEach((e, i) => {
        e.textContent = i < calificacionSeleccionada ? "★" : "☆";
        e.style.color = i < calificacionSeleccionada ? "#f5c518" : "#555";
      });
    });
  });

  // Función para mostrar alerta
  function mostrarAlerta(mensaje, tipo) {
    alerta.textContent = mensaje;

    if (tipo === "exito") {
      alerta.style.backgroundColor = "#d6f5ec";
      alerta.style.color = "#1a734c";
    } else if (tipo === "error") {
      alerta.style.backgroundColor = "#f8d7da";
      alerta.style.color = "#842029";
    }

    alerta.style.display = "block";

    // Ocultar después de 4 segundos
    setTimeout(() => {
      alerta.style.display = "none";
    }, 4000);
  }

  // Evento click en botón "Enviar Calificación"
  btnEnviar.addEventListener("click", () => {
    const comentario = comentarioInput.value.trim();

    if (calificacionSeleccionada === 0 || comentario === "") {
      mostrarAlerta("❌ Por favor selecciona una calificación y escribe un comentario.", "error");
      return;
    }

    // Aquí podrías hacer el POST a tu API real
    // Simulamos éxito
    mostrarAlerta("✅ ¡Tu opinión cuenta! Califica con honestidad para ayudar a otros usuarios a tener mejores experiencias.", "exito");

    // Resetear campos
    calificacionSeleccionada = 0;
    estrellas.forEach(e => {
      e.textContent = "☆";
      e.style.color = "#555";
    });
    comentarioInput.value = "";
  });
});
