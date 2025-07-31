// Configuración de la API
        const API_BASE_URL = 'http://54.87.124.61/api'; // Cambia esto por tu URL base


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


        
        // Función para obtener el ID del producto desde la URL
        function getProductIdFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('id') || '1'; // Por defecto usa ID 1 si no se especifica
        }

        // Función para formatear el precio
        function formatPrice(price) {
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(price);
        }

        // Función para obtener la clase CSS según la calidad
        function getQualityClass(quality) {
            const qualityLower = quality.toLowerCase();
            if (qualityLower.includes('excelente')) return 'quality-excelente';
            if (qualityLower.includes('bueno') || qualityLower.includes('buena')) return 'quality-bueno';
            return 'quality-regular';
        }

        // Función para cargar los datos del producto
        async function loadProduct() {
            const productId = getProductIdFromUrl();
            const loadingElement = document.getElementById('loading');
            const errorElement = document.getElementById('error');
            const productElement = document.getElementById('product');


            try {
                // Mostrar loading
                loadingElement.style.display = 'flex';
                errorElement.style.display = 'none';
                productElement.style.display = 'none';

                // Hacer la petición a la API
                const response = await fetch(`${API_BASE_URL}/products/${productId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const dataproduct = await response.json();
                const product = dataproduct.data.product;
                console.log(dataproduct); 
                console.log(product);
                // Actualizar el contenido de la página
                updateProductView(product);

                // Ocultar loading y mostrar producto
                loadingElement.style.display = 'none';
                productElement.style.display = 'block';

            } catch (error) {
                console.error('Error loading product:', error);
                
                // Mostrar error
                loadingElement.style.display = 'none';
                errorElement.style.display = 'block';
                errorElement.textContent = `Error al cargar el producto: ${error.message}`;
            }
        }

        // Función para actualizar la vista con los datos del producto
        function updateProductView(product) {
            // Nombre del producto
            document.getElementById('productName').textContent = product.nombre || 'Producto sin nombre';

            // Descripción
            document.getElementById('productDescription').textContent = product.descripcion || 'Sin descripción disponible';

            // Precio
            document.getElementById('productPrice').textContent = formatPrice(product.valorEstimado || 0);

            // Calidad
            const qualityElement = document.getElementById('productQuality');
            qualityElement.textContent = product.calidadNombre || 'No especificada';
            qualityElement.className = `quality-badge ${getQualityClass(product.calidadNombre || '')}`;

            // Información del usuario
            const userInfo = `${product.usuarioNombre || ''} ${product.usuarioApellido || ''}`.trim() || 'Usuario no disponible';
            document.getElementById('userInfo').textContent = userInfo;

            // Ubicación
            document.getElementById('productLocation').textContent = product.ciudadNombre || 'Ubicación no especificada';

            // Imagen
            const imageContainer = document.getElementById('productImageContainer');
            if (product.imagen) {
                imageContainer.innerHTML = `<img src="${product.imagen}" alt="${product.nombre}" onerror="this.parentElement.innerHTML='<div class=\\"no-image\\"></div>`;
            }

            // Actualizar el título de la página
            document.title = `${product.nombre} - Detalles del Producto`;

            const proponerTrueque = document.getElementById('btn-Trueque');
        }


         // Función para navegar a la página de proponer trueque
        function navigateToProposeTrade() {
            const productId = getProductIdFromUrl();
            const tradeUrl = `../vistas/ProponerTrueque.html?id=${productId}`;
            window.location.href = tradeUrl;
        }

        // Inicializar la aplicación cuando se carga la página
        document.addEventListener('DOMContentLoaded', function() {
            // Para pruebas, puedes comentar loadProduct() y descomentar loadMockData()
            loadProduct();
            // loadMockData(); // Descomenta esta línea para usar datos de prueba
            document.getElementById('proposeTradeBtn').addEventListener('click', navigateToProposeTrade);
        });

        // Manejo de errores globales
        window.addEventListener('error', function(e) {
            console.error('Global error:', e.error);
        });