document.addEventListener("DOMContentLoaded", () => {
  const btnRechazar = document.querySelector(".btn-rechazar");
  const navbar = document.querySelector(".navbar");

  // Verificar que el botón y la navbar existan
  if (!btnRechazar || !navbar) return;

  // Crear el banner
  const banner = document.createElement("div");
  banner.className = "mensaje-exito";
  banner.style.display = "none";
  banner.style.position = "relative";
  banner.style.width = "100vw";
  banner.style.margin = "0";
  banner.style.padding = "10px 20px";
  banner.style.fontWeight = "bold";
  banner.style.textAlign = "center";
  banner.style.boxSizing = "border-box";
  banner.style.zIndex = "1000";

  // Insertar el banner justo después del navbar
  navbar.insertAdjacentElement("afterend", banner);

  function mostrarBanner(mensaje, tipo) {
    banner.textContent = mensaje;

    if (tipo === "exito") {
      banner.style.backgroundColor = "#dffbf0";
      banner.style.color = "#1a7c4c";
    } else {
      banner.style.backgroundColor = "#f8d7da";
      banner.style.color = "#842029";
    }

    banner.style.display = "block";

    setTimeout(() => {
      banner.style.display = "none";
    }, 4000);
  }

  btnRechazar.addEventListener("click", () => {
    try {
      // Simula éxito
      mostrarBanner("✅ La propuesta ha sido rechazada.", "exito");

      // Descomenta esto si quieres simular un error:
      // throw new Error("Error al rechazar");

    } catch (error) {
      mostrarBanner("❌ Ocurrió un error al rechazar la propuesta.", "error");
    }
  });
});
