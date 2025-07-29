document.addEventListener("DOMContentLoaded", () => {
  const data = [
    { nombre: "Luis", interacciones: 120 },
    { nombre: "Emilio", interacciones: 95 },
    { nombre: "Valeria", interacciones: 88 },
    { nombre: "David", interacciones: 70 }
  ];

  // Función para generar la gráfica 
  function generarGraficaEstatica(datos) {
    const contenedor = document.querySelector('.contenedor-top');
    const maxValor = Math.max(...datos.map(d => d.interacciones));
    
    // Crear el contenedor de la gráfica
    const graficaEstatica = document.createElement('div');
    graficaEstatica.className = 'grafica-estatica';

    datos.forEach(item => {
      const porcentaje = (item.interacciones / maxValor) * 100;
      
      const barraItem = document.createElement('div');
      barraItem.className = 'barra-item';
      
      barraItem.innerHTML = `
        <div class="nombre-usuario">${item.nombre}</div>
        <div class="barra-contenedor">
          <div class="barra-progreso" style="width: ${porcentaje}%;"></div>
        </div>
        <div class="valor-interacciones">${item.interacciones}</div>
      `;
      
      graficaEstatica.appendChild(barraItem);
    });

    // Insertar la gráfica después del canvas
    const canvas = document.getElementById('graficaTopUsuarios');
    canvas.parentNode.insertBefore(graficaEstatica, canvas.nextSibling);
  }

  // Función para actualizar gráfica existente
  function actualizarGraficaEstatica(datos) {
    const container = document.querySelector('.grafica-estatica');
    if (!container) {
      generarGraficaEstatica(datos);
      return;
    }

    const maxValor = Math.max(...datos.map(d => d.interacciones));
    
    // Limpiar contenido existente
    container.innerHTML = '';

    datos.forEach(item => {
      const porcentaje = (item.interacciones / maxValor) * 100;
      
      const barraItem = document.createElement('div');
      barraItem.className = 'barra-item';
      
      barraItem.innerHTML = `
        <div class="nombre-usuario">${item.nombre}</div>
        <div class="barra-contenedor">
          <div class="barra-progreso" style="width: ${porcentaje}%;"></div>
        </div>
        <div class="valor-interacciones">${item.interacciones}</div>
      `;
      
      container.appendChild(barraItem);
    });
  }

  
  generarGraficaEstatica(data);

});