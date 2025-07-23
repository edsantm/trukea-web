function mostrarAlerta(tipo, mensaje) {
  const alerta = document.getElementById('alerta');
  const icono = document.getElementById('alerta-icono');
  const texto = document.getElementById('alerta-mensaje');

  alerta.classList.remove('exito', 'error');
  alerta.classList.add(tipo); // "exito" o "error"

  icono.innerHTML = tipo === 'exito' ? '✔️' : '✖';
  texto.textContent = mensaje;

  alerta.classList.remove('oculto');
  alerta.style.opacity = '1';
  alerta.style.top = '20px';

  setTimeout(() => {
    alerta.classList.add('oculto');
    alerta.style.opacity = '0';
    alerta.style.top = '-60px';
  }, 4000);
}

document.addEventListener("DOMContentLoaded", function () {
 const alerta = document.getElementById('alerta');
  if (alerta) {
    alerta.classList.add('oculto');
    alerta.style.opacity = '0';
    alerta.style.top = '-60px';
  }
  const inputImagen = document.getElementById("input-imagen");
  const btnCambiar = document.getElementById("btnCambiarImagen");
  const vistaPrevia = document.getElementById("vista-previa");
  
  // Abrir el selector de archivos al hacer clic en el botón
  btnCambiar.addEventListener("click", function () {
    inputImagen.click();
 
  });

  // Mostrar la imagen seleccionada
  inputImagen.addEventListener("change", function () {
    const archivo = inputImagen.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = function (e) {
        vistaPrevia.innerHTML = `<img src="${e.target.result}" alt="Imagen de perfil">`;
      };
      lector.readAsDataURL(archivo);
    }
  });

 const form = document.querySelector(".formulario");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const inputs = form.querySelectorAll("input");
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
      mostrarAlerta("error", " Por favor, completa todos los campos.");
      return;
    }

    mostrarAlerta("exito", "✔️ Los cambios se han guardado exitosamente.");
  });
});

    // Forzar que esté oculta al iniciar
  const alerta = document.getElementById('alerta');
  if (alerta) {
    alerta.classList.add('oculto');
    alerta.style.opacity = '0';
    alerta.style.top = '0px';
  }

  // Escuchar envío del formulario
  const formulario = document.querySelector(".formulario");

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    // Aquí podrías hacer fetch() a tu API para guardar los datos

    // Mostrar alerta de éxito
    mostrarAlerta("exito", "✔️ Los cambios se han guardado exitosamente.");
  });
;
