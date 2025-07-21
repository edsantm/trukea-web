document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".formulario-producto");
  const inputNombre = document.querySelector("#nombre");
  const inputDescripcion = document.querySelector("#descripcion");
  const selectCategoria = document.querySelector("#categoria");
  const radiosEstado = document.getElementsByName("estado");
  const btnGuardar = document.querySelector(".btn-guardar");
  const btnCancelar = document.querySelector(".btn-cancelar");
  const btnImagen = document.querySelector(".btn-imagen");
  const imagenPlaceholder = document.querySelector(".imagen-placeholder");

  // Crear el banner dinámico
  const banner = document.createElement("div");
  banner.className = "mensaje-exito";
  banner.style.display = "none";
  document.body.insertBefore(banner, form.parentElement);

  function mostrarBanner(mensaje, tipo) {
    banner.textContent = mensaje;
    if (tipo === "exito") {
      banner.style.backgroundColor = "#dbf7e3";
      banner.style.color = "#179e4a";
    } else {
      banner.style.backgroundColor = "#f8d7da";
      banner.style.color = "#842029";
    }
    banner.style.display = "block";

    setTimeout(() => {
      banner.style.display = "none";
    }, 4000);
  }

  // Manejo del botón de imagen
  btnImagen.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);
    input.click();

    input.addEventListener("change", () => {
      const archivo = input.files[0];
      if (archivo) {
        const lector = new FileReader();
        lector.onload = () => {
          imagenPlaceholder.style.backgroundImage = `url(${lector.result})`;
          imagenPlaceholder.style.backgroundSize = "cover";
          imagenPlaceholder.style.backgroundPosition = "center";
        };
        lector.readAsDataURL(archivo);
      }
      document.body.removeChild(input);
    });
  });

  // Manejo del botón guardar
  btnGuardar.addEventListener("click", (e) => {
    e.preventDefault();

    const estadoSeleccionado = Array.from(radiosEstado).some(radio => radio.checked);

    if (
      inputNombre.value.trim() === "" ||
      inputDescripcion.value.trim() === "" ||
      selectCategoria.value.trim() === "" ||
      !estadoSeleccionado
    ) {
      mostrarBanner("❌ Todos los campos son obligatorios.", "error");
      return;
    }

    // Simulación de éxito
    mostrarBanner("✅ Se han guardado los cambios correctamente.", "exito");

    // Aquí podrías usar fetch() para enviar datos a tu API
  });

  // Manejo del botón cancelar
  btnCancelar.addEventListener("click", (e) => {
    e.preventDefault();

    try {
      form.reset();
      imagenPlaceholder.style.backgroundImage = "none";
      mostrarBanner("✅ La edición ha sido cancelada.", "exito");
    } catch (error) {
      mostrarBanner("❌ Ocurrió un error al cancelar la edición.", "error");
    }
  });
});
