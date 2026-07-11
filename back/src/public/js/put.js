const contenedorProductos = document.getElementById("contenedor-productos");
const getProductForm = document.getElementById("getProduct-form");
const contenedorForm = document.getElementById("contenedor-form");
const urlBase = "http://localhost:3000/api/products";

getProductForm.addEventListener("submit", async event => {
    event.preventDefault(); //Evitamos el envio por defecto HTML del formulario

    // Optimizacion 1: Saltamos el FormData + Object.fromEntries
    // Extraemos el id del producto
    const idProd = event.target.idProd.value.trim();

    // Optimizacion 2: Nos aseguramos de que se haya enviado un id valido
    if (!idProd) {
        mostrarError("Ingresá un id valido");
        return;
    }
    
    try {
        // Vamos a hacer el fetch a una URL personalizada
        const response = await fetch(`${urlBase}/${idProd}`);
        console.log(response);

        // Procesamos los datos que devuelve el servidor
        const datos = await response.json();

        // Optimizacion 4: Evaluamos si el servidor respondio correctamente (200 -> ok)
        if (!response.ok) { // Que hacer si la respuesta no es 200 (404 o 500)
            mostrarError(datos.message);
            return; // La sentencia return FINALIZA la restante ejecucion del codigo
        }


        const producto = datos.payload;

        console.log(producto); 
        /* {
            "id": 41,
            "name": "Fernet Cola Chabona",
            "image": "https://pointlaventanita.com/wp-content/uploads/2024/05/chabona.webp",
            "category": "drink",
            "price": "4300.00",
            "active": 1
        }*/

        renderizarProducto(producto);

    } catch (error) {
        console.error("Error al obtener el producto", error);
    }
});

// Imprimimos mensaje de error
function mostrarError(mensaje) {
    contenedorProductos.innerHTML = `
        <p class="mensaje mensaje-error">${mensaje}</p>
    `;
}

// Imprimimos mensaje de exito
function mostrarExito(mensaje) {
    contenedorProductos.innerHTML = `
        <p class="mensaje mensaje-exito">${mensaje}</p>
    `;
}

function renderizarProducto(producto) {
    const inactivo = producto.active == 0;
    let htmlProducto = `
    <ul>
        <li class="lista-producto${inactivo ? ' inactivo' : ''}">
            <img src="${producto.image}" alt="${producto.name}">
            <p>Id: ${producto.id} / Nombre: ${producto.name} / <strong>Precio: $${producto.price}</strong></p>
            ${inactivo ? '<p class="badge-inactivo">INACTIVO</p>' : ''}
            <input type="button" id="updateProduct-button" value="Actualizar Producto">
        </li>
    </ul>
    `;

    contenedorProductos.innerHTML = htmlProducto;

    // Le asignamos un evento click a nuestro boton "Eliminar producto"
    const updateProductButton = document.getElementById("updateProduct-button");

    updateProductButton.addEventListener("click", event => {
        event.stopPropagation(); // Evitamos la propagacion de eventos

        formularioPutProducto(event, producto);
    });
}


function formularioPutProducto(event, producto) {
    event.stopPropagation();

    console.log(producto);

    // Determinamos si la imagen actual es una URL externa o un archivo local
    const esUrlExterna = producto.image && (producto.image.startsWith("http://") || producto.image.startsWith("https://"));

    let htmlUpdateForm = `
        <h2>Actualizar producto</h2>
    
        <form id="updateProduct-form" class="form-alta" enctype="multipart/form-data">

            <input type="hidden" id="idProd" name="id" value="${producto.id}">
            <input type="hidden" name="currentImage" value="${producto.image}">

            <label for="nameProd">Nombre</label>
            <input type="text" name="name" id="nameProd" value="${producto.name}" required>

            <fieldset class="imagen-fieldset">
                <legend>Imagen del producto (dejar como está para mantener la actual)</legend>

                <div class="imagen-opciones">
                    <label class="radio-label">
                        <input type="radio" name="imagenTipo" value="url" ${esUrlExterna ? "checked" : ""}> URL de imagen
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="imagenTipo" value="archivo" ${!esUrlExterna ? "checked" : ""}> Subir archivo
                    </label>
                </div>

                <div id="input-url" class="imagen-input" style="${esUrlExterna ? "" : "display:none;"}">
                    <label for="imageUrl">URL de la imagen</label>
                    <input type="url" name="imageUrl" id="imageUrl" value="${esUrlExterna ? producto.image : ""}" placeholder="https://ejemplo.com/imagen.jpg">
                </div>

                <div id="input-archivo" class="imagen-input" style="${esUrlExterna ? "display:none;" : ""}">
                    <label for="imageFile">Seleccionar archivo</label>
                    <input type="file" name="imageFile" id="imageFile" accept="image/*">
                </div>
            </fieldset>

            <label for="categoryProd">Categoria</label>
            <select name="category" id="categoryProd" required>
                <option value="local" ${producto.category === "local" ? "selected" : ""}>Local</option>
                <option value="visitante" ${producto.category === "visitante" ? "selected" : ""}>Visitante</option>
            </select>

            <label for="countryProd">Pais</label>
            <input type="text" name="country" id="countryProd" value="${producto.country}" required>

            <label for="priceProd">Precio</label>
            <input type="number" name="price" id="priceProd" value="${producto.price}" required>

            <label for="activeProd">Activo</label>
            <select name="active" id="activeProd" required>
                <option value="1" ${producto.active == 1 ? "selected" : ""}>activo</option>
                <option value="0" ${producto.active == 0 ? "selected" : ""}>inactivo</option>
            </select>
            
            <div>
                <input type="submit" value="Actualizar producto">
            </div>
        </form>
    `;

    contenedorForm.innerHTML = htmlUpdateForm;

    // Toggle entre URL y archivo
    const radioUrl = document.querySelector('input[name="imagenTipo"][value="url"]');
    const radioArchivo = document.querySelector('input[name="imagenTipo"][value="archivo"]');
    const inputUrl = document.getElementById("input-url");
    const inputArchivo = document.getElementById("input-archivo");

    radioUrl.addEventListener("change", () => {
        inputUrl.style.display = "";
        inputArchivo.style.display = "none";
    });

    radioArchivo.addEventListener("change", () => {
        inputUrl.style.display = "none";
        inputArchivo.style.display = "";
    });

    const updateProductForm = document.getElementById("updateProduct-form");
    updateProductForm.addEventListener("submit", event => {
        actualizarProducto(event);
    });
}

// Envio de datos del formulario de actualizacion de producto
async function actualizarProducto(event) {
    event.preventDefault();

    const confirmacion = confirm("Querés actualizar este producto?");
    if(!confirmacion) {
        alert("Actualización cancelada");
        return;
    }

    const formData = new FormData(event.target);
    const tipoImagen = formData.get("imagenTipo");
    const currentImage = formData.get("currentImage");

    formData.delete("imagenTipo");

    if (tipoImagen === "url") {
        const urlValor = formData.get("imageUrl");
        formData.delete("imageUrl");
        formData.delete("imageFile");

        if (urlValor && urlValor.trim().length > 0) {
            formData.append("image", urlValor.trim());
        } else {
            // Si no puso URL, mantenemos la imagen actual
            formData.append("image", currentImage);
        }
    } else {
        const file = formData.get("imageFile");
        formData.delete("imageUrl");
        formData.delete("imageFile");

        if (file && file.size > 0) {
            const extensionesPermitidas = ["image/jpeg", "image/png", "image/webp", "image/gif"];
            if (!extensionesPermitidas.includes(file.type)) {
                mostrarError("Solo se permiten archivos de imagen (jpg, png, webp, gif)");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                mostrarError("La imagen no puede superar los 5 MB");
                return;
            }
            formData.append("image", file);
        } else {
            // Si no subió archivo, mantenemos la imagen actual
            formData.append("image", currentImage);
        }
    }

    formData.delete("currentImage");

    const data = Object.fromEntries(formData.entries());
    if (!data.name || !data.price) {
        alert("Todos los campos son obligatorios");
        return;
    }
    
    try {
        const response = await fetch(urlBase, {
            method: "PUT",
            body: formData
        });

        console.log(response);
        const result = await response.json();

        if(response.ok) {
            contenedorForm.innerHTML = "";
            console.log(result.message);
            mostrarExito(result.message);
        } else {
            console.error("Error:", result.message);
            mostrarError(result.message);
        }

    } catch (error) {
        console.error("Error al enviar los datos: ", error.message);
        mostrarError(error.message);
    }
    
}