document.addEventListener("DOMContentLoaded", () => {
  // URL de tu API en el servidor remoto
  const API_URL = 'http://54.87.124.61/api/ratings/most-active';

         function obtenerDatosSesion() {
    try {
        const sesionData = localStorage.getItem('sesion');
        if (!sesionData) {
            console.log('No se encontraron datos de sesión');
            return null;
        }
        const datosUsuario = JSON.parse(sesionData);
        console.log('Datos de sesión:', datosUsuario);  // Verificar los datos del usuario
        return datosUsuario;
    } catch (error) {
        console.error('Error al obtener datos de sesión:', error);
        return null;
    }
}


// Función de verificación de sesión independiente (sin depender de SessionManager)
    function checkUserSession() {
      try {
        // Buscar en diferentes posibles keys del localStorage
        const userData = localStorage.getItem('userData') || 
                       localStorage.getItem('sesion') || 
                       localStorage.getItem('user');
        
        const isLoggedIn = userData && userData !== 'null' && userData !== '';
        console.log('🔐 Verificando sesión:', {
          userData: userData,
          isLoggedIn: isLoggedIn,
          parsedData: userData ? JSON.parse(userData) : null
        });
        
        return isLoggedIn;
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        return false;
      }
    }

    // Funciones de navegación condicional
    function renderNavigation() {
      const navLinks = document.getElementById('nav-links');
      if (!navLinks) {
        console.error('No se encontró el elemento nav-links');
        return;
      }

      const isLoggedIn = checkUserSession();
      
      console.log('🔐 Estado de autenticación:', isLoggedIn ? 'Logueado' : 'No logueado');
      
      if (isLoggedIn) {
        // Usuario logueado - mostrar navegación completa
        navLinks.innerHTML = `
          <li><a href="/vistas/PublicarProducto.html">Publicar Producto</a></li>
          <li><a href="/vistas/MisProductos.html">Mis Productos</a></li>
          <li><a href="/vistas/Perfil.html">Mi Perfil</a></li>
          <li><a href="../vistas/SolicitudesRecibidas.html">
            <img src="/img/notificaciones.png" alt="Notificaciones" class="icono">
          </a></li>
        `;
      } else {
        // Usuario no logueado - solo mostrar botón de iniciar sesión
        navLinks.innerHTML = `
          <li><button onclick="iniciarSesion()" class="btn-iniciar-sesion">
            Iniciar Sesión
          </button></li>
        `;
      }
    }

    // Función para redirigir a iniciar sesión
    function iniciarSesion() {
      window.location.href = '../vistas/login.html';
    }

    // Función para actualizar la navegación cuando cambia el estado de autenticación
    function updateNavigationState() {
      renderNavigation();
    }

    // Inicializar navegación cuando se carga la página
    document.addEventListener('DOMContentLoaded', function() {
      console.log('🚀 Inicializando navegación...');
      
      // Pequeño delay para asegurar que todo se cargue
      setTimeout(() => {
        renderNavigation();
      }, 100);
      
      // Inicializar productos después si está disponible
      setTimeout(() => {
        if (typeof initProductos === 'function') {
          initProductos();
        }
      }, 200);
    });

    // Listener para cambios en localStorage (útil si el usuario cierra sesión en otra pestaña)
    window.addEventListener('storage', function(e) {
      if (e.key === 'sesion' || e.key === 'userData') {
        console.log('📱 Cambio detectado en almacenamiento de sesión');
        updateNavigationState();
      }
    });

    // Función de debugging para verificar estado manualmente
    window.debugAuth = function() {
      console.log('=== DEBUG AUTENTICACIÓN ===');
      console.log('localStorage.sesion:', localStorage.getItem('sesion'));
      console.log('localStorage.userData:', localStorage.getItem('userData'));
      console.log('Resultado checkUserSession():', checkUserSession());
      console.log('========================');
      renderNavigation();
    };
  
  // Función para obtener datos de la API
  async function obtenerTopUsuarios() {
    try {
      console.log(' Obteniendo datos de:', API_URL);
      
      const response = await fetch(`${API_URL}?limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          
          'Accept': 'application/json'
        },
        // Configuración para CORS si hay problemas
        mode: 'cors'
      });

      console.log(' Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log(' Datos recibidos:', responseData);
      
      // Validar que la respuesta tenga la estructura esperada de tu API
      if (!responseData.success) {
        throw new Error(responseData.message || 'La API devolvió success: false');
      }
      
      if (!responseData.data?.ranking || !Array.isArray(responseData.data.ranking)) {
        throw new Error('Estructura de datos inválida: falta ranking array');
      }
      
      // Mapear los datos de tu API al formato que espera tu gráfica
      const datosParaGrafica = responseData.data.ranking.map(usuario => ({
        nombre: usuario.nombre_completo || `${usuario.nombre} ${usuario.apellido}`,
        interacciones: usuario.puntuacion_actividad || 0
      }));
      
      console.log('✅ Datos mapeados para gráfica:', datosParaGrafica);
      return datosParaGrafica;
      
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
      
      // Mostrar mensaje de error al usuario
      mostrarError(`No se pudieron cargar los datos: ${error.message}`);
      
    ;
    }
  }

  // Función para generar la gráfica (tu código original con mejoras)
  function generarGraficaEstatica(datos) {
    const contenedor = document.querySelector('.contenedor-top');

    ocultarLoading();
    
    if (!contenedor) {
      console.error(' No se encontró el contenedor .contenedor-top');
      return;
    }

    if (!datos || datos.length === 0) {
      console.warn(' No hay datos para mostrar');
      contenedor.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay datos de usuarios activos disponibles</p>';
      return;
    }

    const maxValor = Math.max(...datos.map(d => d.interacciones));
    
    if (maxValor === 0) {
      console.warn(' Todos los valores son 0');
      contenedor.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay actividad registrada</p>';
      return;
    }
    
    // Crear el contenedor de la gráfica
    const graficaEstatica = document.createElement('div');
    graficaEstatica.className = 'grafica-estatica';

    // Agregar título
    const titulo = document.createElement('div');
    titulo.className = 'titulo-grafica';
    titulo.innerHTML = '<h3 style="text-align: center; color: #333; margin-bottom: 20px;">🏆 Usuarios Más Activos</h3>';
    graficaEstatica.appendChild(titulo);

    datos.forEach((item, index) => {
      const porcentaje = (item.interacciones / maxValor) * 100;
      
      const barraItem = document.createElement('div');
      barraItem.className = 'barra-item';
      
      // Determinar color según posición
      let colorBarra = '#007bff';
      if (index === 0) colorBarra = '#ffd700'; // Oro
      else if (index === 1) colorBarra = '#c0c0c0'; // Plata
      else if (index === 2) colorBarra = '#cd7f32'; // Bronce
      
      barraItem.innerHTML = `
        <div class="posicion-badge" style="background: ${colorBarra}; color: ${index < 3 ? '#000' : '#fff'};">
          ${index + 1}
        </div>
        <div class="nombre-usuario">${item.nombre}</div>
        <div class="barra-contenedor">
          <div class="barra-progreso" style="width: ${porcentaje}%; background-color: ${colorBarra};"></div>
        </div>
        <div class="valor-interacciones">${item.interacciones} pts</div>
      `;
      
      graficaEstatica.appendChild(barraItem);
    });

    // Insertar la gráfica después del canvas o al inicio del contenedor
    const canvas = document.getElementById('graficaTopUsuarios');
    if (canvas && canvas.parentNode) {
      canvas.parentNode.insertBefore(graficaEstatica, canvas.nextSibling);
    } else {
      contenedor.appendChild(graficaEstatica);
    }

    // Animar las barras
    setTimeout(() => {
      const barras = document.querySelectorAll('.barra-progreso');
      barras.forEach(barra => {
        barra.style.transition = 'width 1s ease-in-out';
      });
    }, 100);
  }

  // Función para actualizar gráfica existente (tu código original con mejoras)
  function actualizarGraficaEstatica(datos) {

    ocultarLoading();
    const container = document.querySelector('.grafica-estatica');
    if (!container) {
      generarGraficaEstatica(datos);
      return;
    }

    if (!datos || datos.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay datos disponibles</p>';
      return;
    }

    const maxValor = Math.max(...datos.map(d => d.interacciones));
    
    // Mantener el título y limpiar solo el contenido de barras
    const titulo = container.querySelector('.titulo-grafica');
    container.innerHTML = '';
    
    if (titulo) {
      container.appendChild(titulo);
    }

    datos.forEach((item, index) => {
      const porcentaje = (item.interacciones / maxValor) * 100;
      
      const barraItem = document.createElement('div');
      barraItem.className = 'barra-item';
      
      // Determinar color según posición
      let colorBarra = '#007bff';
      if (index === 0) colorBarra = '#ffd700';
      else if (index === 1) colorBarra = '#c0c0c0';
      else if (index === 2) colorBarra = '#cd7f32';
      
      barraItem.innerHTML = `
        <div class="posicion-badge" style="background: ${colorBarra}; color: ${index < 3 ? '#000' : '#fff'};">
          ${index + 1}
        </div>
        <div class="nombre-usuario">${item.nombre}</div>
        <div class="barra-contenedor">
          <div class="barra-progreso" style="width: ${porcentaje}%; background-color: ${colorBarra};"></div>
        </div>
        <div class="valor-interacciones">${item.interacciones} pts</div>
      `;
      
      container.appendChild(barraItem);
    });
  }

  // Función para mostrar errores
  function mostrarError(mensaje) {
    const contenedor = document.querySelector('.contenedor-top');
    if (contenedor) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.style.cssText = `
        background-color: #fee; 
        color: #c33; 
        padding: 15px; 
        border-radius: 8px; 
        margin: 10px 0;
        border: 1px solid #fcc;
        text-align: center;
      `;
      errorDiv.innerHTML = `
        <strong>⚠️ Error</strong><br>
        ${mensaje}<br>
        <small>Mostrando datos de ejemplo...</small>
      `;
      contenedor.prepend(errorDiv);
      
      // Remover mensaje después de 8 segundos
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 8000);
    }
  }

// Función para ocultar el loading
function ocultarLoading() {
  const loading = document.querySelector('.loading');
  if (loading) {
    loading.style.display = 'none'; // Oculta el elemento con clase 'loading'
  }
}

  // Función para mostrar loading
  function mostrarLoading() {
    const contenedor = document.querySelector('.contenedor-top');
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="loading" style="text-align: center; padding: 40px;">
          <div style="border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
          <p style="color: #666;">🔄 Cargando usuarios más activos...</p>
        </div>
      `;
    }
  }

  // Función para refrescar datos
  async function refrescarDatos() {
    mostrarLoading();
    const datos = await obtenerTopUsuarios();
    actualizarGraficaEstatica(datos);
  }

  // Inicializar la gráfica con datos de la API
  async function inicializar() {
    mostrarLoading();
    const datos = await obtenerTopUsuarios();
    generarGraficaEstatica(datos);
  }

  // Inicializar al cargar la página
  inicializar();

  

  // Exponer función para actualizar manualmente
  window.actualizarTopUsuarios = refrescarDatos;
});

// CSS adicional para mejorar la apariencia
const estilos = document.createElement('style');
estilos.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .barra-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding: 10px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
  }
  
  .barra-item:hover {
    transform: translateX(5px);
  }
  
  .posicion-badge {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    margin-right: 12px;
    min-width: 30px;
  }
  
  .nombre-usuario {
    flex: 1;
    font-weight: 600;
    color: #333;
    margin-right: 12px;
  }
  
  .barra-contenedor {
    flex: 2;
    background-color: #e9ecef;
    height: 8px;
    border-radius: 4px;
    margin-right: 12px;
    overflow: hidden;
  }
  
  .barra-progreso {
    height: 100%;
    border-radius: 4px;
    transition: width 1s ease-in-out;
  }
  
  .valor-interacciones {
    font-weight: bold;
    color: #495057;
    min-width: 60px;
    text-align: right;
    font-size: 14px;
  }
  
  .grafica-estatica {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  .error-message {
    animation: fadeIn 0.3s ease-in;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(estilos);