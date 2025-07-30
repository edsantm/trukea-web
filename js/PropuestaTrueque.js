document.addEventListener("DOMContentLoaded", () => {
  const btnRechazar = document.querySelector(".btn-rechazar");
  const btnAceptar = document.querySelector(".btn-aceptar");
  const navbar = document.querySelector(".navbar");

  // Verificar que la navbar exista
  if (!navbar) return;

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

  // Función para proponer trueque
  async function proponerTrueque(datosTradeque) {
    try {
      const response = await fetch('http://54.87.124.61/api/trades/propose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(datosTradeque)
      });

      if (!response.ok) {
        throw new Error('Error al proponer el trueque');
      }

      const result = await response.json();
      mostrarBanner("✅ Propuesta de trueque enviada exitosamente.", "exito");
      
      
      return result;

    } catch (error) {
      console.error('Error al proponer trueque:', error);
      mostrarBanner("❌ Error al enviar la propuesta de trueque.", "error");
      throw error;
    }
  }

  // Event listener para botón de rechazar (código existente)
  if (btnRechazar) {
    btnRechazar.addEventListener("click", () => {
      try {
        mostrarBanner("✅ La propuesta ha sido rechazada.", "exito");
      } catch (error) {
        mostrarBanner("❌ Ocurrió un error al rechazar la propuesta.", "error");
      }
    });
  }

  // Event listener para botón de aceptar trueque (proponer)
  if (btnAceptar) {
    btnAceptar.addEventListener("click", async () => {
      try {
        // Obtener datos de los inputs del formulario
        const inputs = document.querySelectorAll('input[type="text"]');
        const tuProductoNombre = inputs[0]?.value;
        const tuProductoDescripcion = inputs[1]?.value;
        const productoOfrecidoNombre = inputs[2]?.value;
        const productoOfrecidoDescripcion = inputs[3]?.value;
        const usuario = inputs[4]?.value;
        const comentario = inputs[5]?.value;

        // Validar datos requeridos
        if (!tuProductoNombre || !productoOfrecidoNombre || !usuario) {
          mostrarBanner("❌ Por favor completa todos los campos requeridos.", "error");
          return;
        }

        // Preparar datos para enviar al backend
        const datosTradeque = {
          tuProducto: {
            nombre: tuProductoNombre,
            descripcion: tuProductoDescripcion
          },
          productoOfrecido: {
            nombre: productoOfrecidoNombre,
            descripcion: productoOfrecidoDescripcion
          },
          usuario: usuario,
          comentario: comentario || '',
          // Agrega más campos según lo que necesite tu backend
        };

        await proponerTrueque(datosTradeque);

      } catch (error) {
        // El error ya se maneja en la función proponerTrueque
      }
    });
  }
});