// ===== CONFIGURACIÓN =====
const API_URL = 'http://localhost:8082/api/usuarios'; // ← CAMBIA POR TU URL DE API

// ===== ELEMENTOS DEL DOM =====
const btnLogin = document.getElementById('btnLogin');
const correoInput = document.getElementById('correo');
const contrasenaInput = document.getElementById('contrasena');
const messageDiv = document.getElementById('message');
const alertaMensaje = document.getElementById('alerta-mensaje');

// ===== FUNCIONES DE UTILIDAD =====
function mostrarAlerta(mensaje, tipo = 'error') {
    // Mostrar en el div de alerta
    if (alertaMensaje && messageDiv) {
        alertaMensaje.textContent = mensaje;
        messageDiv.className = 'alerta'; // Quitar 'oculto'
        messageDiv.style.display = 'block';
        messageDiv.classList.remove('oculto');
        
        // Agregar clase según el tipo si quieres estilos diferentes
        if (tipo === 'success' || tipo === 'exito') {
            messageDiv.classList.add('alerta-success');
        } else if (tipo === 'info' || tipo === 'cargando') {
            messageDiv.classList.add('alerta-info');
        } else {
            messageDiv.classList.add('alerta-error');
        }
        
        // Auto-ocultar después de 5 segundos (excepto para mensajes de carga)
        if (tipo !== 'info' && tipo !== 'cargando') {
            setTimeout(() => {
                ocultarAlerta();
            }, 5000);
        }
    }
    
    // También en consola para debugging técnico
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);
}

function mostrarMensajeDebug(mensaje, permanente = false) {
    // Para mensajes de debug que se ven en el HTML
    if (alertaMensaje && messageDiv) {
        alertaMensaje.textContent = mensaje;
        messageDiv.className = 'alerta alerta-debug';
        messageDiv.style.display = 'block';
        messageDiv.classList.remove('oculto');
        
        // Si no es permanente, ocultar después de 3 segundos
        if (!permanente) {
            setTimeout(() => {
                ocultarAlerta();
            }, 3000);
        }
    }
    console.log(mensaje);
}

function ocultarAlerta() {
    if (messageDiv) {
        messageDiv.style.display = 'none';
        messageDiv.classList.add('oculto');
        messageDiv.className = 'alerta oculto'; // Resetear clases
    }
}

function deshabilitarBoton(deshabilitar = true) {
    btnLogin.disabled = deshabilitar;
    btnLogin.textContent = deshabilitar ? 'Verificando...' : 'Iniciar Sesión';
}

// ===== FUNCIÓN PRINCIPAL DE LOGIN =====
async function iniciarSesion(correo, contrasena) {
    mostrarMensajeDebug('🔄 Iniciando proceso de login...');
    mostrarMensajeDebug(`📧 Verificando correo: ${correo}`);
    
    try {
        mostrarAlerta('🔄 Verificando credenciales...', 'info');
        
        // 1. Verificar que la URL de API esté configurada
        if (API_URL.includes('tu-api.com')) {
            throw new Error('⚠️ Debes configurar la URL de tu API primero');
        }
        
        // 2. Consumir la API con timeout
        mostrarMensajeDebug('📡 Conectando con la API...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
        
        const response = await fetch(API_URL, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                // Agrega headers adicionales si tu API los requiere
                // 'Authorization': 'Bearer tu-token',
            }
        });
        
        clearTimeout(timeoutId);
        
        mostrarMensajeDebug(`📊 Respuesta del servidor: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`❌ Error del servidor: ${response.status} - ${response.statusText}`);
        }
        
        const usuarios = await response.json();
        mostrarMensajeDebug(`👥 Usuarios encontrados: ${usuarios.length}`);
        
        // 3. Validar que la respuesta sea un array
        if (!Array.isArray(usuarios)) {
            throw new Error('❌ La API no devolvió un array de usuarios');
        }
        
        if (usuarios.length === 0) {
            throw new Error('❌ No se encontraron usuarios en la base de datos');
        }
        
        // Mostrar estructura del primer usuario para debugging
        if (usuarios[0]) {
            const campos = Object.keys(usuarios[0]).join(', ');
            mostrarMensajeDebug(`📋 Campos disponibles: ${campos}`);
        }
        
        // 4. Buscar usuario por correo
        mostrarMensajeDebug('🔍 Buscando usuario en la base de datos...');
        const usuario = usuarios.find(u => {
            // Adapta estos nombres según tu estructura de datos
            const emailUsuario = u.email || u.correo || u.mail || u.usuario;
            return emailUsuario && emailUsuario.toLowerCase() === correo.toLowerCase();
        });
        
        if (!usuario) {
            mostrarAlerta('❌ Correo no encontrado en la base de datos', 'error');
            return false;
        }
        
        mostrarMensajeDebug('✅ Usuario encontrado, verificando contraseña...');
        
        // 5. Verificar contraseña
        const passwordUsuario = usuario.password || usuario.contraseña || usuario.contrasena || usuario.pass;
        
        if (!passwordUsuario) {
            mostrarAlerta('❌ Error: Usuario sin contraseña configurada', 'error');
            return false;
        }
        
        // 6. Comparar contraseñas
        if (passwordUsuario === contrasena) {
            mostrarAlerta('✅ ¡Login exitoso! Redirigiendo...', 'success');
            
            // 7. Guardar datos del usuario (opcional)
            try {
                localStorage.setItem('usuario', JSON.stringify(usuario));
                localStorage.setItem('sesionActiva', 'true');
                mostrarMensajeDebug('💾 Sesión guardada correctamente');
            } catch (e) {
                mostrarMensajeDebug('⚠️ No se pudo guardar la sesión');
            }
            
            // 8. Redireccionar después de 2 segundos
            setTimeout(() => {
                mostrarMensajeDebug('🔄 Redirigiendo al dashboard...');
                // Cambia por tu página de destino
                window.location.href = '/dashboard.html';
                // O también puedes usar:
                // window.location.href = '/vistas/principal.html';
            }, 2000);
            
            return true;
        } else {
            mostrarAlerta('❌ Contraseña incorrecta', 'error');
            return false;
        }
        
    } catch (error) {
        console.error('💥 Error técnico:', error); // Este sí va en consola
        
        if (error.name === 'AbortError') {
            mostrarAlerta('❌ Tiempo de espera agotado. Verifica tu conexión', 'error');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            mostrarAlerta('❌ Error de conexión. Verifica tu internet o la URL de la API', 'error');
        } else {
            mostrarAlerta(`❌ ${error.message}`, 'error');
        }
        
        return false;
    }
}

// ===== VALIDACIONES =====
function validarFormulario(correo, contrasena) {
    // Validar campos vacíos
    if (!correo || !contrasena) {
        mostrarAlerta('❌ Por favor completa todos los campos', 'error');
        return false;
    }
    
    // Validar formato de correo
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(correo)) {
        mostrarAlerta('❌ Ingresa un correo válido', 'error');
        return false;
    }
    
    // Validar longitud mínima de contraseña
    if (contrasena.length < 3) {
        mostrarAlerta('❌ La contraseña debe tener al menos 3 caracteres', 'error');
        return false;
    }
    
    return true;
}

// ===== EVENT LISTENERS =====

// Evento del botón de login
btnLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const correo = correoInput.value.trim();
    const contrasena = contrasenaInput.value;
    
    // Validar formulario
    if (!validarFormulario(correo, contrasena)) {
        return;
    }
    
    // Deshabilitar botón durante el proceso
    deshabilitarBoton(true);
    
    try {
        await iniciarSesion(correo, contrasena);
    } finally {
        // Rehabilitar botón
        deshabilitarBoton(false);
    }
});

// Permitir login con Enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        btnLogin.click();
    }
});

// Ocultar alerta al hacer clic en ella
messageDiv.addEventListener('click', () => {
    ocultarAlerta();
});

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    mostrarMensajeDebug('🚀 Sistema de login cargado correctamente');
    
    // Verificar que los elementos existan
    if (!btnLogin) {
        mostrarAlerta('❌ Error: No se encontró el botón de login', 'error');
        return;
    }
    if (!correoInput) {
        mostrarAlerta('❌ Error: No se encontró el campo de correo', 'error');
        return;
    }
    if (!contrasenaInput) {
        mostrarAlerta('❌ Error: No se encontró el campo de contraseña', 'error');
        return;
    }
    
    // Mostrar configuración actual
    if (API_URL.includes('tu-api.com')) {
        mostrarAlerta('⚠️ Recuerda configurar la URL de tu API', 'info');
    } else {
        mostrarMensajeDebug(`🔗 API configurada: ${API_URL}`);
        
        // Test de conectividad
        mostrarMensajeDebug('🧪 Probando conexión con la API...');
        fetch(API_URL, { method: 'HEAD' })
            .then(() => mostrarMensajeDebug('✅ API accesible y funcionando'))
            .catch(() => mostrarMensajeDebug('⚠️ API no accesible o con problemas'));
    }
    
    // Enfocar el campo de correo al cargar
    if (correoInput) {
        correoInput.focus();
        correoInput.value = '';
    }
    
    // Limpiar formulario
    if (contrasenaInput) {
        contrasenaInput.value = '';
    }
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
        ocultarAlerta();
    }, 3000);
});

// ===== FUNCIONES ADICIONALES (OPCIONALES) =====

// Función para verificar si ya hay una sesión activa
function verificarSesionActiva() {
    // Si tienes localStorage:
    // const sesionActiva = localStorage.getItem('sesionActiva');
    // if (sesionActiva === 'true') {
    //     window.location.href = '/dashboard.html';
    // }
}

// Función para logout (para usar en otras páginas)
function cerrarSesion() {
    // localStorage.removeItem('usuario');
    // localStorage.removeItem('sesionActiva');
    window.location.href = '/login.html';
}

// Verificar sesión al cargar (opcional)
// verificarSesionActiva();
