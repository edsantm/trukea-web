document.getElementById('btnRegistrar').addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const lastName = document.getElementById('lastname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validación básica
    if (!name || !lastName || !email || !password || !confirmPassword) {
        showMessage("Por favor completa todos los campos.","warning", 4000, ['#name', '#lastname','#email','#password','#confirmPassword']);
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Las contraseñas no coinciden.","warning", 4000, ['#password','#confirmPassword']);
        return;
    }

    const nuevoUsuario = {
        name: name,
        lastName: lastName,
        email: email,
        password: password,
        confirmPassword : confirmPassword
    };

    try {
        const response = await fetch('http://54.87.124.61/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario)
        });

        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            throw new Error(data.message || 'Error en el registro');
        }
        showMessage("¡Registro exitoso! Ahora puedes iniciar sesión.","success", 4000, []);
        setTimeout(() => {
                    window.location.href = '../vistas/login.html';
                }, 2000); 
    } catch (error) {
        console.error("Error en el registro:", error);
        showMessage("Hubo un error al registrar el usuario. Verifica los datos o intenta más tarde.","error", 4000, []);
        
    }
});


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
