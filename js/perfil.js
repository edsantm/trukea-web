document.addEventListener("DOMContentLoaded", function () {
  const inputFoto = document.getElementById("foto");
  const vistaPrevia = document.getElementById("vista-previa");
  const btnSubir = document.getElementById("btnSubirFoto");

  btnSubir.addEventListener("click", () => inputFoto.click());

  inputFoto.addEventListener("change", () => {
    const archivo = inputFoto.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onload = function (e) {
        vistaPrevia.innerHTML = `<img src="${e.target.result}" alt="Imagen de perfil">`;
      };
      reader.readAsDataURL(archivo);

      // Enviar imagen al servidor
      const formData = new FormData();
      formData.append("imagen", archivo);
      formData.append("idUsuario", 1); // usa el id correcto en producción

      fetch("http://localhost:7000/api/usuarios/subir-imagen", {
        method: "POST",
        body: formData
      })
        .then(res => res.ok ? console.log("Imagen subida") : console.error("Error al subir"))
        .catch(err => console.error("Error:", err));
    }
  });
});
