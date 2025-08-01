const API_CONFIG = {
  baseUrl: 'http://54.87.124.61/api',
  endpoints: {
    productos: '/products'
  }
};

let productoActual = null;

// ✅ Solo una definición de readTrueque
async function readTrueque() {
  const productId = getProductIdFromUrl(); // Obtener ID desde la URL

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.productos}/${productId}`);

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const data = await response.json();
    productoActual = data.product || data.data?.product || data;
    console.log('Producto actual:', productoActual);
    
    // Mostrar en el HTML
    document.getElementById('nombreProducto').textContent = productoActual.nombre || 'Producto sin nombre';
    document.getElementById('descripcionProducto').textContent = productoActual.descripcion || 'Sin descripción';
    document.getElementById('publicadoPor').textContent = `${productoActual.usuarioNombre || ''} ${productoActual.usuarioApellido || ''}`.trim() || 'Usuario desconocido';

    // Guardamos datos del usuario propietario
    productoActual.propietario_id = productoActual.usuario_id || productoActual.idUsuario;
    productoActual.propietario_nombre = productoActual.usuarioNombre;
    productoActual.propietario_apellido = productoActual.usuarioApellido;

  } catch (error) {
    console.error("Error al cargar el producto:", error);
  }
}

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



function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id') || '1';
}

async function fetchFromAPI(endpoint) {
  try {
    console.log(`Haciendo fetch a: ${API_CONFIG.baseUrl}${endpoint}`);
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`);
    
    if (!response.ok) {
      console.error(`Error al hacer fetch: ${response.status}`);
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('Datos obtenidos:', data);
    return data;
  } catch (error) {
    console.error('Error en la API:', error);
    throw error;
  }
}

function createProductHTML(producto) {
  return `
    <div class="oferta" data-id="${producto.id || ''}">
        <input type="checkbox" name="producto-ofrecido" value="${producto.id || ''}">
        <div>
            <strong>${producto.nombre || 'Sin nombre'}</strong><br>
            <span>Estado: ${producto.estado || 'No especificado'}</span><br>
            <small>Valor estimado: ${producto.valorEstimado || 'No especificado'}</small>
        </div>
    </div>
  `;
}

// Función para filtrar productos por el nombre y apellido del usuario en sesión
function filtrarProductosPorUsuario(productos) {
  const usuario = obtenerDatosSesion(); // Obtener los datos del usuario en sesión
  if (!usuario) {
    console.error('No hay usuario en sesión');
    return [];
  }
  
  console.log('Usuario en sesión:', usuario);
  
  return productos.filter(producto => {
    // Construir nombres completos para comparación
    const nombreUsuarioProducto = `${producto.usuarioNombre || ''} ${producto.usuarioApellido || ''}`.toLowerCase().trim();
    const nombreCompletoSesion = `${usuario.nombre || ''} ${usuario.apellido || ''}`.toLowerCase().trim();
    
    console.log('Comparando:', {
      producto: nombreUsuarioProducto,
      sesion: nombreCompletoSesion,
      coincide: nombreUsuarioProducto === nombreCompletoSesion
    });
    
    // Filtrar para mostrar SOLO productos del usuario en sesión
    return nombreUsuarioProducto === nombreCompletoSesion;
  });
}

// Función para renderizar los productos
function renderProducts(productos) {
  const productosContainer = document.getElementById('productos');
  
  if (!productosContainer) {
    console.error('No se encontró el contenedor de productos');
    return;
  }
  
  if (!productos || productos.length === 0) {
    console.log('No tienes productos para ofrecer');
    productosContainer.innerHTML = `
      <div class="no-products">
        <h3>No tienes productos para ofrecer</h3>
        <p>Publica productos para poder hacer propuestas de trueque.</p>
        <button onclick="window.location.href='../vistas/PublicarProducto.html'" class="btn-agregar">
          Publicar Producto
        </button>
      </div>
    `;
  } else {
    // Agregar event listener para permitir solo una selección
    productosContainer.innerHTML = productos.map(createProductHTML).join('');
    
    // Hacer que solo se pueda seleccionar un checkbox a la vez
    const checkboxes = productosContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          // Desmarcar todos los otros checkboxes
          checkboxes.forEach(cb => {
            if (cb !== this) cb.checked = false;
          });
        }
      });
    });
    
    console.log(`Productos renderizados: ${productos.length}`);
  }
}

function showLoading() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const productosEl = document.getElementById('productos');
  
  if (loadingEl) loadingEl.style.display = 'block';
  if (errorEl) errorEl.style.display = 'none';
  if (productosEl) productosEl.style.display = 'none';
}

function hideLoading() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'none';
}

function showProducts() {
  const productosEl = document.getElementById('productos');
  if (productosEl) productosEl.style.display = 'grid';
}

function showError(message) {
  const errorEl = document.getElementById('error');
  const loadingEl = document.getElementById('loading');
  const productosEl = document.getElementById('productos');
  
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
  if (loadingEl) loadingEl.style.display = 'none';
  if (productosEl) productosEl.style.display = 'none';
}

function showMessage(text, estado = 'info', duration = 4000) {
    const msg = document.getElementById('message');

    // Remover solo clases de estado
    msg.classList.remove('message-success', 'message-error', 'message-warning', 'message-info');

    // Agregar nueva clase de estado
    switch (estado) {
        case 'success':
            msg.classList.add('message-success');
            break;
        case 'error':
            msg.classList.add('message-error');
            break;
        case 'warning':
            msg.classList.add('message-warning');
            break;
        default:
            msg.classList.add('message-info');
    }


    // Mostrar mensaje
    msg.textContent = text;
    msg.classList.add('show');
    msg.style.display = 'block';

    // Ocultar después del tiempo
    setTimeout(() => {
        msg.classList.remove('show');
        setTimeout(() => {
            msg.style.display = 'none';
        }, 300);
    }, duration);
}

async function cargarProductos() {
  try {
    showLoading();
    console.log('Cargando productos desde la API...');
    const response = await fetchFromAPI(API_CONFIG.endpoints.productos);
    const productos = response.data.products || response.products || [];

    console.log('Productos obtenidos desde la API:', productos);

    // Filtrar productos para que solo se muestren los del usuario en sesión
    const productosFiltrados = filtrarProductosPorUsuario(productos);

    console.log('Productos filtrados por usuario:', productosFiltrados);

    // Renderizar los productos
    renderProducts(productosFiltrados);

    // Mostrar contenedor de productos
    hideLoading();
    showProducts();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    showError('Error al cargar productos.');
  }
}

function initProductos() {
  if (!document.getElementById('productos')) {
    console.error('Error: No se encontró el contenedor de productos');
    return;
  }
  readTrueque();
  cargarProductos();
}

// ✅ FUNCIÓN CORREGIDA - Botón de "Proponer Trueque"
document.addEventListener('DOMContentLoaded', function() {
  initProductos();
  
  // Event listener para el botón de proponer trueque
  const btnProponerTrueque = document.getElementById('btnProponerTrueque');
  if (btnProponerTrueque) {
    btnProponerTrueque.addEventListener('click', async () => {
      try {
        // 1. Validar que hay usuario logueado
        const usuarioLogueado = obtenerDatosSesion();
        if (!usuarioLogueado) {
          showMessage('Debes iniciar sesión para hacer propuestas de trueque', 'error');
          return;
        }

        // 2. Obtener datos necesarios
        const productoDeseadoId = getProductIdFromUrl(); // El producto que está viendo
        const comentario = document.getElementById('comentario-box')?.value?.trim() || '';
        const productoOfrecidoCheckbox = document.querySelector('.oferta input[type="checkbox"]:checked');

        // 3. Validaciones
        if (!productoOfrecidoCheckbox) {
          showMessage("Selecciona un producto para ofrecer", 'warning');
          return;
        }

        if (!productoActual) {
          showMessage("Error: No se pudo cargar la información del producto", 'error');
          return;
        }

        // 4. Obtener ID del producto ofrecido
        const productoOfrecidoId = productoOfrecidoCheckbox.closest('.oferta').dataset.id;

        // 5. Validar que no es el mismo producto
        if (productoOfrecidoId === productoDeseadoId) {
          showMessage("No puedes intercambiar un producto contigo mismo", 'error');
          return;
        }

        // 6. Construir propuesta según tu formato EXACTO
        const propuesta = {
          producto_ofrecido_id: parseInt(productoOfrecidoId),    // Lo que TÚ ofreces
          producto_deseado_id: parseInt(productoDeseadoId),     // Lo que TÚ quieres
          usuario_oferente_id: parseInt(usuarioLogueado.id),    // TU ID (desde sesión)
          comentario: comentario
        };

        console.log('📤 Enviando propuesta:', propuesta);

        // 7. Mostrar loading
        showMessage('Enviando propuesta...', 'info');

        // 8. Enviar propuesta
        const response = await fetch(`${API_CONFIG.baseUrl}/trades/propose`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(propuesta)
        });

        // 9. Manejar respuesta
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Error HTTP: ${response.status}`);
        }

        const resultado = await response.json();
        console.log('✅ Propuesta enviada exitosamente:', resultado);

        // 10. Mostrar éxito y limpiar formulario
        showMessage("¡Propuesta enviada exitosamente!", 'success');
        
        // Limpiar selección y comentario
        if (productoOfrecidoCheckbox) productoOfrecidoCheckbox.checked = false;
        const comentarioBox = document.getElementById('comentario-box');
        if (comentarioBox) comentarioBox.value = '';

      } catch (error) {
        console.error('❌ Error al enviar propuesta:', error);
        showMessage(error.message || 'Error al enviar la propuesta. Intenta nuevamente.', 'error');
      }
    });
  }
});

// Exportar funciones para debugging
window.TruequeDetalle = {
  productoActual: () => productoActual,
  sesionActual: obtenerDatosSesion,
  recargarProductos: cargarProductos,
  debug: {
    mostrarPropuesta: () => {
      const usuarioLogueado = obtenerDatosSesion();
      const productoDeseadoId = getProductIdFromUrl();
      const productoOfrecidoCheckbox = document.querySelector('.oferta input[type="checkbox"]:checked');
      const productoOfrecidoId = productoOfrecidoCheckbox?.closest('.oferta').dataset.id;
      
      console.log('Debug Propuesta:', {
        usuario: usuarioLogueado,
        productoDeseado: productoDeseadoId,
        productoOfrecido: productoOfrecidoId,
        productoActual: productoActual
      });
    }
  }
};