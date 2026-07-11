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

    // Verificamos si el producto llega correctamente
    console.log(producto);

    let htmlUpdateForm = `
        <h2>Actualizar producto</h2>
    
        <form id="updateProduct-form" class="form-alta" enctype="multipart/form-data">

            <input type="hidden" id="idProd" name="id" value="${producto.id}">
            <input type="hidden" name="currentImage" value="${producto.image}">

            <label for="nameProd">Nombre</label>
            <input type="text" name="name" id="nameProd" value="${producto.name}" required>

            <label for="imageProd">Imagen (dejar vacio para mantener la actual)</label>
            <input type="file" name="image" id="imageProd" accept="image/*">

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

    const updateProductForm = document.getElementById("updateProduct-form");

    updateProductForm.addEventListener("submit", event => {
        actualizarProducto(event); // Aca enviamos los datos del formulario al servidor
    });
}

// Envio de datos del formulario de actualizacion de producto
async function actualizarProducto(event) {
    event.preventDefault(); // Evitamos el envio por defecto del formulario

    const confirmacion = confirm("Querés actualizar este producto?");
    
    // En caso de que cancelemos, se termino la funcion
    if(!confirmacion) {
        alert("Actualización cancelada");
        return;
    }

    // Obtenemos el FormData directamente del formulario (incluye archivos si se seleccionaron)
    const formData = new FormData(event.target);
    
    // Validamos los campos obligatorios antes de enviar
    const data = Object.fromEntries(formData.entries());
    
    if (!data.name || !data.price) {
        alert("Todos los campos son obligatorios");
        return;
    }
    
    try {
        const response = await fetch(urlBase, {
            method: "PUT",
            body: formData // FormData se envia sin header Content-Type, el browser lo configura solo con el boundary
        });

        console.log(response);
        const result = await response.json();

        // Si respuesta es 200 OK
        if(response.ok) {
            // Vaciamos el formulario de actualizacion
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