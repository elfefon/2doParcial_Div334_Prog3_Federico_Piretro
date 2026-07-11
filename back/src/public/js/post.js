const contenedorProductos = document.getElementById("contenedor-productos");
const postProductForm = document.getElementById("postProduct-form");

// Elementos para alternar entre URL y archivo
const radioUrl = document.querySelector('input[name="imagenTipo"][value="url"]');
const radioArchivo = document.querySelector('input[name="imagenTipo"][value="archivo"]');
const inputUrl = document.getElementById("input-url");
const inputArchivo = document.getElementById("input-archivo");

// Toggle entre URL y archivo
radioUrl.addEventListener("change", () => {
    inputUrl.style.display = "";
    inputArchivo.style.display = "none";
});

radioArchivo.addEventListener("change", () => {
    inputUrl.style.display = "none";
    inputArchivo.style.display = "";
});

//////////////////
// Validacion previa de los datos en el cliente
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

    if (!file || file.size === 0) {
        return "Debe seleccionar un archivo de imagen";
    }

    if (!extensionesPermitidas.includes(file.type)) {
        return "Solo se permiten archivos de imagen (jpg, png, webp, gif)";
    }

    if (file.size > maxSize) {
        return "La imagen no puede superar los 5 MB";
    }

    return null; // Sin errores
}

function mostrarMensaje(tipo, mensaje) {
    contenedorProductos.innerHTML = `
        <p class="mensaje mensaje-${tipo}">${mensaje}</p>
    `;
}


postProductForm.addEventListener("submit", async event => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const tipoImagen = formData.get("imagenTipo");

    // Eliminamos campos que no se usan para que no viajen de más
    formData.delete("imagenTipo");

    if (tipoImagen === "url") {
        // Si eligió URL, la mandamos como campo "image" en el body
        const urlValor = formData.get("imageUrl");
        formData.delete("imageUrl");
        formData.delete("imageFile");

        if (urlValor && urlValor.trim().length > 0) {
            formData.append("image", urlValor.trim());
        }
    } else {
        // Si eligió archivo, lo mandamos como "image" (multer lo procesa)
        const file = formData.get("imageFile");
        formData.delete("imageUrl");
        formData.delete("imageFile");

        if (file && file.size > 0) {
            const errorImagen = validarImagen(file);
            if (errorImagen) {
                mostrarMensaje("error", errorImagen);
                return;
            }
            formData.append("image", file);
        }
    }

    // Validamos los demas campos del formulario
    const data = Object.fromEntries(formData.entries());
    data.price = Number(data.price);

    const errores = validarFormulario(data);
    if (errores.length > 0) {
        mostrarMensaje("error", errores.join("\n"));
        return;
    }

    try {
        const urlBase = "http://localhost:3000/api/products/"
        const response = await fetch(urlBase, {
            method: "POST",
            body: formData
        });

        console.log(response);
        const result = await response.json();

        if (!response.ok) {
            mostrarMensaje("error", result.errores ? result.errores.join("\n") : result.message);
            return;
        }

        console.log(result.message);
        mostrarMensaje("exito", result.message);

    } catch (error) {
        console.error("Error al enviar los datos: ", error);
        mostrarMensaje("error", "Error al procesar la solicitud");
    }
});
