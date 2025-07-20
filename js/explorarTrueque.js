document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("toggle-categorias");
  const lista = document.getElementById("lista-categorias");
  const flecha = toggle.querySelector(".flecha");

  toggle.addEventListener("click", () => {
    lista.classList.toggle("oculto");
    flecha.classList.toggle("abierta");
  });
});
