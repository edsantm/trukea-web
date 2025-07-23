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
      formData.append("idUsuario", 1); 

      fetch("http://localhost:8082/api/usuarios/", {
        method: "POST",
        body: formData
      })
        .then(res => res.ok ? console.log("Imagen subida") : console.error("Error al subir"))
        .catch(err => console.error("Error:", err));
    }
  });
});
