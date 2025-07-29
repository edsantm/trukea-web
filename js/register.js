document.getElementById('btnRegistrar').addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const lastName = document.getElementById('lastname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validación básica
    if (!name || !lastName || !email || !password || !confirmPassword) {
        showMessage("Por favor completa todos los campos.","warning");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Las contraseñas no coinciden.","warning");
        return;
    }

    const nuevoUsuario = {
        nombre: name,
        apellido: lastName,
        email: email,
        password: password,
        confirmPassword : confirmPassword
    };

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario)
        });

        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            throw new showMessage(data.message || 'Error en el registro',"error");
        }

        showMessage('¡Registro exitoso! Ahora puedes iniciar sesión.',"success");

                setTimeout(() => {
                    window.location.href = './login.html';
                }, 2000); 
    } catch (error) {
        console.error("Error en el registro:", error);
        showMessage("Hubo un error al registrar el usuario. Verifica los datos o intenta más tarde.","error");
    }
});

function showMessage(message, tipo = 'info') {
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');

    messageDiv.className= 'message';

    switch (tipo) {
        case 'success':
            messageDiv.classList.add('message-success');
            break;
        case 'error':
            messageDiv.classList.add('message-error');
            break;
        case 'warning':
            messageDiv.classList.add('message-warning');
            break;
        default:
            messageDiv.classList.add('message-info');
    }
    
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (messageDiv) {
        messageDiv.style.display = 'block';
        messageDiv.textContent = message;
    }
}
