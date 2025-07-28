document.getElementById('btnLogin').addEventListener('click', async () => {
  const email = document.getElementById('correo').value.trim();
  const password = document.getElementById('contrasena').value.trim();

  // Validación básica
  if (!email || !password) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
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
      alert(data.message || 'Error al iniciar sesión');
      return;
    }

    const user = data.data.user;

    // ⚠️ Tu API no devuelve token aún, así que guardamos datos mínimos
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userNombre', user.nombre);
    localStorage.setItem('userEmail', user.email);

    alert('Inicio de sesión exitoso');

    // Redireccionar a alguna página
    window.location.href = '../vistas/ExplorarTrueque.html';

  } catch (error) {
    console.error('Error en login:', error);
    alert('Hubo un problema al iniciar sesión. Intenta más tarde.');
  }
});



