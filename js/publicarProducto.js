document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-producto');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Obtener usuario desde sesión/localStorage
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'));

    if (!usuarioLogueado || !usuarioLogueado.id) {
      alert('⚠️ No se encontró el usuario logueado. Inicia sesión nuevamente.');
      return;
    }

    const usuario_id = usuarioLogueado.id;

    // Obtener valores del formulario
    const nombre = document.getElementById('nombreProducto').value.trim();
    const categoria = parseInt(document.getElementById('categoria').value);
    const valor = parseFloat(document.getElementById('valorEstimado').value);
    const descripcion = document.getElementById('descripcionProducto').value.trim();
    const calidadRadio = document.querySelector('input[name="idCalidad"]:checked');

    if (!nombre || !categoria || !valor || !descripcion || !calidadRadio) {
      alert('Por favor llena todos los campos requeridos.');
      return;
    }

    const calidad = parseInt(calidadRadio.value);

    const producto = {
      nombre,
      idCategoria: categoria,
      valor_estimado: valor,
      descripcion,
      idCalidad: calidad,
      usuario_id
    };

    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al publicar el producto');
      }

      alert('✅ Producto publicado exitosamente');
      form.reset(); // Limpiar formulario

    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Ocurrió un error al publicar el producto');
    }
  });
});
