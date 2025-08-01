// ================================
// FUNCIONES DE AUTENTICACIÓN
// ================================

// Función de inicio de sesión
document.addEventListener('DOMContentLoaded', function() {
    const btnLogin = document.getElementById('btnLogin');
    
    if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
            const email = document.getElementById('correo').value.trim();
            const password = document.getElementById('contrasena').value.trim();
            
            
            // Validación básica
            if (!email || !password) {
                showMessage('Por favor, completa todos los campos.', 'warning', 4000, ['#correo', '#contrasena']);
                return;
                
            }
            
            
            // Deshabilitar botón durante la petición
            btnLogin.disabled = true;
            btnLogin.textContent = 'Iniciando sesión...';
            
            try {
                const response = await fetch('http://54.87.124.61/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        correo: email,
                        contrasena: password
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok || !data.success) {
                    showMessage(data.message || 'Error al iniciar sesión',"error", 4000, ['#correo', '#contrasena']);
                    return;
                }
                
                const user = data.data.user;
                
                // Guardar datos del usuario en localStorage como JSON
                localStorage.setItem('sesion', JSON.stringify(user));
                
                
                console.log('Usuario logueado:', user);
                showMessage('Inicio de sesión exitoso.',"success",4000,[]);

                setTimeout(() => {
                    window.location.href = '../vistas/ExplorarTrueque.html';
                }, 2000); 
            
        
                
            } catch (error) {
                console.error('Error en login:', error);
                showMessage('Hubo un problema al iniciar sesión. Intenta más tarde.',"error",4000,[]);
            } finally {
                // Restaurar botón
                btnLogin.disabled = false;
                btnLogin.textContent = 'Iniciar Sesión';
            }
        });
    }
});

// ================================
// FUNCIONES DE SESIÓN
// ================================

// Función para obtener datos de la sesión
function obtenerDatosSesion() {
    try {
        const sesionData = localStorage.getItem('sesion');
        
        if (!sesionData) {
            console.log('No se encontraron datos de sesión');
            return null;
        }
        
        // Parsear los datos JSON
        const datosUsuario = JSON.parse(sesionData);
        return datosUsuario;
        
    } catch (error) {
        console.error('Error al obtener datos de sesión:', error);
        return null;
    }
}

// Función para verificar si hay una sesión activa
function verificarSesion() {
    const sesion = localStorage.getItem('sesion');
    return sesion !== null && sesion !== undefined && sesion !== '';
}

function showMessage(text, estado = 'info', duration = 4000,errores = []) {
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

       // Limpiar errores previos
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    // Marcar campos con error si se pasan
    errores.forEach(selector => {
        const campo = document.querySelector(selector);
        if (campo) campo.classList.add('input-error');
    });

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





// ================================
// FUNCIONES DE CERRAR SESIÓN
// ================================

// Función básica para cerrar sesión
function cerrarSesion() {
    try {
        // Limpiar localStorage
        localStorage.removeItem('sesion');
        localStorage.removeItem('userData');
        localStorage.removeItem('userPreferences');
        
        // Limpiar sessionStorage también
        sessionStorage.clear();
        
        console.log('Sesión cerrada correctamente');
        
        // Mostrar mensaje de confirmación
        alert('Has cerrado sesión exitosamente');
        
        // Redireccionar a la página de login
        window.location.href = '../index.html';
        
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Hubo un problema al cerrar la sesión');
        // Aún así, intentar redireccionar
        window.location.href = '../index.html';
    }
}

// Función de cerrar sesión con confirmación
function cerrarSesionConConfirmacion() {
    const confirmacion = confirm('¿Estás seguro de que quieres cerrar sesión?');
    
    if (confirmacion) {
        cerrarSesion();
    }
}


// ================================
// FUNCIONES DE PROTECCIÓN Y UI
// ================================

// Función para proteger páginas que requieren autenticación
function protegerPagina() {
    if (!verificarSesion()) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = '../vistas/login.html';
        return false;
    }
    return true;
}

// Función para mostrar/ocultar elementos según el estado de sesión
function actualizarInterfazSesion() {
    const sesionActiva = verificarSesion();
    
    // Mostrar/ocultar elementos de usuario logueado
    const elementosLogueado = document.querySelectorAll('.usuario-logueado');
    const elementosDeslogueado = document.querySelectorAll('.usuario-deslogueado');
    
    elementosLogueado.forEach(elemento => {
        elemento.style.display = sesionActiva ? 'block' : 'none';
    });
    
    elementosDeslogueado.forEach(elemento => {
        elemento.style.display = sesionActiva ? 'none' : 'block';
    });
    
    // Si hay sesión activa, cargar datos del usuario
    if (sesionActiva) {
        cargarDatosUsuario();
    }
}

// ================================
// FUNCIONES PARA MOSTRAR DATOS
// ================================

// Función para actualizar un elemento específico
function actualizarElemento(selector, valor) {
    const elemento = document.querySelector(selector);
    if (elemento && valor !== undefined && valor !== null) {
        elemento.textContent = valor;
    }
}

// Función principal para cargar datos del usuario en el HTML
function cargarDatosUsuario() {
    const datos = obtenerDatosSesion();
    
    if (!datos) {
        console.log('No se pudieron cargar los datos del usuario');
        // Mostrar mensaje de "sin datos" si no hay información
        document.querySelectorAll('.user-data-field').forEach(elemento => {
            elemento.textContent = 'Sin datos';
        });
        return;
    }
    
    // Actualizar elementos usando diferentes métodos de selección
    
    // Por ID
    actualizarElemento('#nombre-usuario', datos.nombre);
    actualizarElemento('#edad-usuario', datos.edad);
    actualizarElemento('#calificacion-usuario', datos.calificacion);
    actualizarElemento('#email-usuario', datos.correo || datos.email);
    
    // Por clase
    actualizarElemento('.nombre-usuario', datos.nombre);
    actualizarElemento('.edad-usuario', datos.edad);
    actualizarElemento('.calificacion-usuario', datos.calificacion);
    actualizarElemento('.email-usuario', datos.correo || datos.email);
    
    // Elementos con data attributes
    const elementosData = document.querySelectorAll('[data-usuario]');
    elementosData.forEach(elemento => {
        const campo = elemento.getAttribute('data-usuario');
        if (datos[campo] !== undefined && datos[campo] !== null) {
            elemento.textContent = datos[campo];
        }
    });
    
    console.log('Datos de usuario cargados:', datos);
}

// ================================
// EVENT LISTENERS Y INICIALIZACIÓN
// ================================

// Configurar event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    
    // *** BOTONES DE CERRAR SESIÓN ***
    
    // Botón principal de logout (por ID)
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', cerrarSesionConConfirmacion);
    }
    
    // Botones por clase
    const btnsCerrarSesion = document.querySelectorAll('.btn-cerrar-sesion');
    btnsCerrarSesion.forEach(btn => {
        btn.addEventListener('click', cerrarSesionConConfirmacion);
    });
    
    // Botones con data-action="logout"
    const logoutButtons = document.querySelectorAll('[data-action="logout"]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', cerrarSesionConConfirmacion);
    });
    
    // *** INICIALIZACIÓN DE LA PÁGINA ***
    
    // Actualizar interfaz según estado de sesión
    actualizarInterfazSesion();
    
});

// ================================
// FUNCIONES DE UTILIDAD
// ================================

// Función para obtener información específica del usuario
function obtenerInfoUsuario(campo) {
    const datos = obtenerDatosSesion();
    return datos ? datos[campo] : null;
}

// Función para actualizar datos del usuario en localStorage
function actualizarDatosUsuario(nuevosDatos) {
    try {
        const datosActuales = obtenerDatosSesion() || {};
        const datosActualizados = { ...datosActuales, ...nuevosDatos };
        
        localStorage.setItem('sesion', JSON.stringify(datosActualizados));
        
        // Recargar la interfaz
        cargarDatosUsuario();
        
        return true;
    } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
        return false;
    }
}

// Función para validar formato de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función para validar contraseña (mínimo 6 caracteres)
function validarContrasena(password) {
    return password && password.length >= 6;
}

// ================================
// FUNCIONES PARA DEBUGGING/TESTING
// ================================

// Función para crear una sesión de prueba (solo para desarrollo)
function crearSesionPrueba() {
    const datosEjemplo = {
        id: 1,
        nombre: "Juan Pérez",
        edad: 25,
        calificacion: 8.5,
        correo: "juan@ejemplo.com"
    };
    
    localStorage.setItem('sesion', JSON.stringify(datosEjemplo));
    actualizarInterfazSesion();
    alert('Sesión de prueba creada');
}

// Función para limpiar completamente el localStorage (solo para desarrollo)
function limpiarTodoLocalStorage() {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos locales?')) {
        localStorage.clear();
        sessionStorage.clear();
        alert('Todos los datos locales han sido eliminados');
        window.location.reload();
    }
}