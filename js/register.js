document.addEventListener('DOMContentLoaded', function() {

    const registerForm = document.getElementById('registerForm');

    const continueBtn = document.getElementById('continueBtn') || document.querySelector('.btn-primary');



    if (registerForm && continueBtn) {

        continueBtn.addEventListener('click', async function(e) {

            e.preventDefault();

            

            // Obtener datos del formulario

            const formData = new FormData(registerForm);

            const registerData = {

                name: formData.get('nombre') || formData.get('name'),

                lastName: formData.get('apellido') || formData.get('lastName'), 

                email: formData.get('email'),

                password: formData.get('password') || formData.get('contrasena'),

                confirmPassword: formData.get('confirmPassword') || formData.get('confirmarContrasena')

            };



            // Validaciones básicas

            if (!registerData.name || !registerData.lastName || !registerData.email || !registerData.password) {

                alert('Todos los campos son obligatorios');

                return;

            }



            if (registerData.password !== registerData.confirmPassword) {

                alert('Las contraseñas no coinciden');

                return;

            }



            // Mostrar loading

            continueBtn.disabled = true;

            continueBtn.textContent = 'Registrando...';



            try {

                const response = await fetch('/api/auth/register', {

                    method: 'POST',

                    headers: {

                        'Content-Type': 'application/json'

                    },

                    body: JSON.stringify(registerData)

                });



                const result = await response.json();



                if (result.success) {

                    alert('Usuario registrado exitosamente');

                    // Redirigir a login o dashboard

                    window.location.href = 'login.html';

                } else {

                    alert(result.message || 'Error al registrar usuario');

                }

            } catch (error) {

                console.error('Error:', error);

                alert('Error de conexión. Intenta nuevamente.');

            } finally {

                // Restaurar botón

                continueBtn.disabled = false;

                continueBtn.textContent = 'Continuar';

            }

        });

    }

});
