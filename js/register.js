document.getElementById('btnRegistrar').addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const lastName = document.getElementById('last name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validación básica
    if (!name || !lastName || !email || !password || !confirmPassword) {
        alert("Por favor completa todos los campos.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
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
            throw new Error(data.message || 'Error en el registro');
        }

        alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
        window.location.href = './login.html';
    } catch (error) {
        console.error("Error en el registro:", error);
        alert("Hubo un error al registrar el usuario. Verifica los datos o intenta más tarde.");
    }
});
