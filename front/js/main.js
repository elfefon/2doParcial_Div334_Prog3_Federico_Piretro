// Redireccion a inicio////////////////////
let nombreUsuario = sessionStorage.getItem("nombreUsuario");

// Redirige si no existe un nombre de usuario
if(!nombreUsuario){
	window.location.href = "index.html";
}

const searchToggle = document.getElementById("search-toggle");
const searchInput = document.getElementById("search-input");

searchToggle.addEventListener("click", () => {
    // Si tiene la clase hidden, se la sacamos (se muestra), si no, se la ponemos (se oculta)
    searchInput.classList.toggle("hidden");

    // Opcional: que el cursor se posicione solo en el input cuando se abre
    if (!searchInput.classList.contains("hidden")) {
        searchInput.focus();
    }
});

// Escuchamos clics en todo el documento
document.addEventListener("click", (event) => {
    const searchInput = document.getElementById("search-input");
    const searchToggle = document.getElementById("search-toggle");

    // Verificamos si el clic NO ocurrió dentro del input Y tampoco en el botón de la lupa
    if (!searchInput.contains(event.target) && !searchToggle.contains(event.target)) {
        // Si el buscador está visible, lo ocultamos
        if (!searchInput.classList.contains("hidden")) {
            searchInput.classList.add("hidden");
        }
    }
});

// Variables////////////////////////////////
let productos = []; // Agregamos la variable global productos
let cuadriculaProductos = document.querySelector(".product-grid");
let barraBusqueda = document.querySelector(".search-bar");

let contadorCarrito = document.getElementById("cart-count");

// El carrito vive en sessionStorage para compartirse entre productos.html y carrito.html
let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];




// Obtener productos////////////////////////////////////////////
const url = "http://localhost:3000/api/products"; // Guardamos en una variable la url de nuestro endpoint

async function obtenerProductos() {
    try {
        let respuesta = await fetch(url); // Hacemos una peticion a nuestro nuevo endpoint en http://localhost:3000/api/products

        let data = await respuesta.json();

        console.log(data); // Nuestros productos estan disponibles dentro de payload { payload: Array(19) }

        productos = data.payload; // Aca guardamos en la variable productos el array de productos que contiene "payload"

        mostrarProductos(productos);

    } catch(error) {
        console.error(error);
    }
}




// Mostrar productos////////////////////////////////
function mostrarProductos(array) {
    let cartaProducto = "";

    for(let i = 0; i < array.length; i++) {
        cartaProducto += `
            <div class="product-card">
                <img src="${array[i].image}" alt="${array[i].name}">
                <h3>${array[i].name}</h3>
                <p>$${array[i].price}</p>
                <button class="add-to-cart" onclick="agregarCarrito(${array[i].id})">Agregar a carrito</button>
            </div>
        `;
    }
    cuadriculaProductos.innerHTML = cartaProducto;
}




// Saludar usuario/////////////////////////////////
function saludarUsuario() {
    let saludoUsuario = document.getElementById("saludo-usuario");
    saludoUsuario.innerHTML = `Es tu oportunidad ${nombreUsuario}!`;
}




// Actualiza solo el contador del navbar (el detalle del carrito vive en carrito.html)
function actualizarContadorCarrito() {
    contadorCarrito.innerHTML = carrito.length;
}




// Filtrar productos////////////////////////////////
barraBusqueda.addEventListener("keyup", filtrarProductos);

function filtrarProductos() {
	let valorBusqueda = barraBusqueda.value;

	let productosFiltrados = productos.filter((producto) => {
		return producto.name.includes(valorBusqueda);
	});
	mostrarProductos(productosFiltrados);
}




// Agregar a carrito////////////////////////////////
function agregarCarrito(id) {
	let productoSeleccionado = productos.find(producto => producto.id === id);
	carrito.push(productoSeleccionado);

	// Persistimos el carrito para que carrito.html lo pueda leer
	sessionStorage.setItem("carrito", JSON.stringify(carrito));

	actualizarContadorCarrito();
}




// Funcion inicializadora
function init() {
    obtenerProductos();
    saludarUsuario();
    actualizarContadorCarrito();
}

init();