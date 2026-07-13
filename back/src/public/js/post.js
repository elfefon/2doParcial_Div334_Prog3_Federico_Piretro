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


let isSubmitting = false;

postProductForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (isSubmitting) return;
    isSubmitting = true;

    const submitBtn = postProductForm.querySelector('input[type="submit"]');
    submitBtn.disabled = true;

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
                isSubmitting = false;
                submitBtn.disabled = false;
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
        isSubmitting = false;
        submitBtn.disabled = false;
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
            isSubmitting = false;
            submitBtn.disabled = false;
            return;
        }

        console.log(result.message);
        mostrarMensaje("exito", result.message);
        postProductForm.reset();

    } catch (error) {
        console.error("Error al enviar los datos: ", error);
        mostrarMensaje("error", "Error al procesar la solicitud");
    }

    isSubmitting = false;
    submitBtn.disabled = false;
});

//////////////////
// Formulario de crear usuario admin
const postUserForm = document.getElementById("postUser-form");

postUserForm.addEventListener("submit", async event => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (!data.name || data.name.trim().length < 2) {
        mostrarMensaje("error", "El nombre debe tener al menos 2 caracteres");
        return;
    }

    if (!data.email || !data.email.includes("@")) {
        mostrarMensaje("error", "Ingrese un email valido");
        return;
    }

    if (!data.password || data.password.length < 6) {
        mostrarMensaje("error", "La contraseña debe tener al menos 6 caracteres");
        return;
    }

    if (data.password !== data.confirm_password) {
        mostrarMensaje("error", "Las contraseñas no coinciden");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/login/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            mostrarMensaje("error", result.message);
            return;
        }

        mostrarMensaje("exito", result.message);
        postUserForm.reset();

    } catch (error) {
        console.error("Error al crear usuario: ", error);
        mostrarMensaje("error", "Error al procesar la solicitud");
    }
});
