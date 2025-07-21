document.addEventListener("DOMContentLoaded", function () {
  const alerta = document.getElementById('alerta');
  const icono = document.getElementById('alerta-icono');
  const mensaje = document.getElementById('alerta-mensaje');
  const btnImagen = document.querySelector(".btn-seleccionar");
  const placeholder = document.querySelector(".imagen-placeholder");

  // Crear input dinámico tipo file
  const inputFile = document.createElement("input");
  inputFile.type = "file";
  inputFile.accept = "image/*";
  inputFile.style.display = "none";
  document.body.appendChild(inputFile);

  // Mostrar alerta
  function mostrarAlerta(tipo, texto) {
    alerta.classList.remove("oculto", "exito", "error");
    alerta.classList.add(tipo);

    if (tipo === "exito") {
      icono.innerHTML = "✔";
      icono.style.backgroundColor = "#27AE60"; // recuadro verde
      icono.style.color = "#fff";
    } else {
      icono.innerHTML = "✖";
      icono.style.backgroundColor = "transparent"; // sin recuadro
      icono.style.color = "#C0392B";
    }

    mensaje.textContent = texto;
    alerta.style.top = "0";

    setTimeout(() => {
      alerta.classList.add("oculto");
      alerta.style.top = "-60px";
    }, 4000);
  }

  // Evento al hacer clic en botón de imagen
  btnImagen.addEventListener("click", () => {
    inputFile.click();
  });

  // Mostrar imagen cargada
  inputFile.addEventListener("change", function () {
    const archivo = this.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function (e) {
      placeholder.innerHTML = ""; // Limpia contenido previo
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";
      placeholder.appendChild(img);
    };
    lector.readAsDataURL(archivo);
  });

  // Validación de formulario
  const form = document.querySelector("form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const campos = form.querySelectorAll("input, select, textarea");
    let valido = true;

    campos.forEach(campo => {
      if (campo.type !== "radio" && campo.value.trim() === "") {
        valido = false;
      }
    });

    const radioSeleccionado = form.querySelector("input[name='estado']:checked");
    if (!radioSeleccionado) valido = false;

    if (!valido) {
      mostrarAlerta("error", "Todos los campos son obligatorios.");
    } else {
      mostrarAlerta("exito", "Tu artículo se ha publicado correctamente.");
    }
  });
});
