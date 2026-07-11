const contenedorProductos = document.getElementById("contenedor-productos");
const postProductForm = document.getElementById("postProduct-form");

//////////////////
// Optimizacion 3: Validacion previa de los datos en el cliente
function validarFormulario(data) {

    const errores = [];

    if (!data.name || data.name.trim().length < 2) {
        errores.push("El nombre debe tener al menos 2 caracteres");
    }

    if (!data.price || isNaN(data.price) || Number(data.price) < 0) {
        errores.push("El precio debe ser un numero mayor a 0");
    }

    if (!data.category) {
        errores.push("Debe seleccionar una categoria");
    }

    if (!data.country || data.country.trim().length < 2) {
        errores.push("El pais debe tener al menos 2 caracteres");
    }

    return errores;
}

// Validacion del archivo de imagen en el cliente
function validarImagen(file) {
    const extensionesPermitidas = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!file) {
        return "Debe seleccionar una imagen";
    }

    if (!extensionesPermitidas.includes(file.type)) {
        return "Solo se permiten archivos de imagen (jpg, png, webp, gif)";
    }

    if (file.size > maxSize) {
        return "La imagen no puede superar los 5 MB";
    }

    return null; // Sin errores
}

// Optimizacion 4: Creamos una funcion para mostrar posibles mensajes al crear un producto
function mostrarMensaje(tipo, mensaje) {
    contenedorProductos.innerHTML = `
        <p class="mensaje mensaje-${tipo}">${mensaje}</p>
    `;
}



postProductForm.addEventListener("submit", async event => {
    event.preventDefault(); // Detenemos el envio por defecto del formulario

    // Obtenemos la info del formulario como FormData (incluye el archivo)
    const formData = new FormData(event.target);
    console.log(formData);

    // Validamos el archivo de imagen antes de enviar
    const file = formData.get("image");
    const errorImagen = validarImagen(file);
    if (errorImagen) {
        mostrarMensaje("error", errorImagen);
        return;
    }

    // Validamos los demas campos del formulario
    const data = Object.fromEntries(formData.entries());
    data.price = Number(data.price);

    const errores = validarFormulario(data);
    if (errores.length > 0) {
        mostrarMensaje("error", errores.join("\n"));
        return;
    }

    // Enviamos FormData directamente (multipart/form-data, NO application/json)
    try {
        const urlBase = "http://localhost:3000/api/products/"
        const response = await fetch(urlBase, {
            method: "POST",
            body: formData // FormData se envia sin header Content-Type, el browser lo configura solo con el boundary
        });

        console.log(response);
        const result = await response.json();

        // Optimizacion 5: Manejamos respuestas no ok del servidor
        if (!response.ok) {
            mostrarMensaje("error", result.message);
            return;
        }

        console.log(result.message);

        // Optimizacion 4: Reutilizamos la funcion de mostrarMensaje
        mostrarMensaje("exito", result.message);

    } catch (error) {
        console.error("Error al enviar los datos: ", error);
        mostrarMensaje("error", "Error al procesar la solcitud")
    }
});