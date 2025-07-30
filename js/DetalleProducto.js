// Configuración de la API
        const API_BASE_URL = 'http://54.87.124.61/api/'; // Cambia esto por tu URL base
        
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
                imageContainer.innerHTML = `<img src="${product.imagen}" alt="${product.nombre}" onerror="this.parentElement.innerHTML='<div class=\\"no-image\\"><i>📷</i><div>Error al cargar imagen</div></div>'">`;
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