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
    if (alertaMensaje && messageDiv) {
        alertaMensaje.textContent = mensaje;
        messageDiv.className = 'alerta';
        messageDiv.style.display = 'block';
        messageDiv.classList.remove('oculto');
        
        if (tipo === 'success') {
            messageDiv.classList.add('alerta-success');
        } else if (tipo === 'info' || tipo === 'cargando') {
            messageDiv.classList.add('alerta-info');
        } else {
            messageDiv.classList.add('alerta-error');
        }
        
        if (tipo !== 'info' && tipo !== 'cargando') {
            setTimeout(() => ocultarAlerta(), 5000);
        }
    }
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);
}

function ocultarAlerta() {
    if (messageDiv) {
        messageDiv.style.display = 'none';
        messageDiv.classList.add('oculto');
    }
}

function deshabilitarBoton(deshabilitar = true) {
    btnLogin.disabled = deshabilitar;
    btnLogin.textContent = deshabilitar ? 'Verificando...' : 'Iniciar Sesión';
}

// ===== FUNCIÓN PRINCIPAL DE LOGIN =====
async function iniciarSesion(correo, contrasena) {
    mostrarAlerta('🔄 Verificando credenciales...', 'info');
    
    try {
        if (API_URL.includes('tu-api.com')) {
            throw new Error('⚠️ Debes configurar la URL de tu API primero');
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(API_URL, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`❌ Error del servidor: ${response.status} - ${response.statusText}`);
        }
        
        const usuarios = await response.json();
        
        if (!Array.isArray(usuarios)) {
            throw new Error('❌ La API no devolvió un formato de usuarios esperado');
        }
        
        // Buscar usuario por correo
        const usuario = usuarios.find(u => {
            const emailUsuario = u.email || u.correo;
            return emailUsuario && emailUsuario.toLowerCase() === correo.toLowerCase();
        });
        
        if (!usuario) {
            mostrarAlerta('❌ Correo no encontrado', 'error');
            return false;
        }
        
            setTimeout(() => {
                // Cambia por tu página de destino
                window.location.href = '../vistas/ExplorarTrueque.html'; 
            }, 2000);
            
            return true;

    } catch (error) {
        console.error('💥 Error técnico en el login:', error);
        
        if (error.name === 'AbortError') {
            mostrarAlerta('❌ El servidor no responde. Intenta más tarde.', 'error');
        } else if (error.name === 'TypeError') {
            mostrarAlerta('❌ Error de conexión. Verifica tu internet o la URL de la API.', 'error');
        } else {
            mostrarAlerta(error.message, 'error');
        }
        
        return false;
    }
}

// ===== VALIDACIONES =====
function validarFormulario(correo, contrasena) {
    if (!correo || !contrasena) {
        mostrarAlerta('❌ Por favor completa todos los campos', 'error');
        return false;
    }
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(correo)) {
        mostrarAlerta('❌ Ingresa un formato de correo válido', 'error');
        return false;
    }
    if (contrasena.length < 3) {
        mostrarAlerta('❌ La contraseña es demasiado corta', 'error');
        return false;
    }
    return true;
}

// ===== EVENT LISTENERS =====
btnLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const correo = correoInput.value.trim();
    const contrasena = contrasenaInput.value;
    
    if (!validarFormulario(correo, contrasena)) {
        return;
    }
    
    deshabilitarBoton(true);
    try {
        await iniciarSesion(correo, contrasena);
    } finally {
        deshabilitarBoton(false);
    }
});

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Evita que el formulario se envíe dos veces
        btnLogin.click();
    }
});

messageDiv.addEventListener('click', () => {
    ocultarAlerta();
});

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Sistema de login cargado.');
    if (API_URL.includes('tu-api.com')) {
        mostrarAlerta('⚠️ ATENCIÓN: Debes configurar la URL de tu API en el archivo JS.', 'info');
    }
    if (correoInput) {
        correoInput.focus();
    }
});

// ===== FUNCIONES ADICIONALES (MODIFICADAS) =====

// Función para logout (ya no necesita limpiar localStorage)
function cerrarSesion() {
    console.log('Cerrando sesión y redirigiendo...');
    window.location.href = '/login.html'; // O la ruta a tu página de login
}

// La función verificarSesionActiva() ha sido eliminada.```