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
let productos = [];
let cuadriculaProductos = document.querySelector(".product-grid");
let barraBusqueda = document.querySelector(".search-bar");

let contadorCarrito = document.getElementById("cart-count");

// El carrito vive en sessionStorage para compartirse entre productos.html y carrito.html
// Normalizamos items viejos (sin cantidad) a formato con cantidad
let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
carrito = carrito.map(item => typeof item.cantidad === "number" ? item : { ...item, cantidad: 1 });
sessionStorage.setItem("carrito", JSON.stringify(carrito));

let categoriaActual = "todas";




// Obtener productos////////////////////////////////////////////
const url = "http://localhost:3000/api/products";

async function obtenerProductos() {
    try {
        let respuesta = await fetch(url);

        let data = await respuesta.json();

        console.log(data);

        productos = data.payload;

        productos.sort((a, b) => (b.active || 0) - (a.active || 0));

        mostrarProductos(productos);

    } catch(error) {
        console.error(error);
    }
}



// Mostrar productos////////////////////////////////
function mostrarProductos(array) {
    let cartaProducto = "";

    for(let i = 0; i < array.length; i++) {
        const inactivo = array[i].active == 0;
        cartaProducto += `
            <div class="product-card${inactivo ? ' disabled' : ''}">
                <img src="${array[i].image}" alt="${array[i].name}">
                <h3>${array[i].name}</h3>
                <p>$${array[i].price}</p>
                <p class="product-category">${array[i].category} | ${array[i].country}</p>
                ${inactivo
                    ? '<p class="badge-inactivo">INACTIVO</p>'
                    : `<button class="add-to-cart" onclick="agregarCarrito(${array[i].id})">Agregar a carrito</button>`
                }
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



// Actualiza contador del navbar con la suma de cantidades
function actualizarContadorCarrito() {
    let total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    contadorCarrito.innerHTML = total;
}



// Filtrar por nombre////////////////////////////////
barraBusqueda.addEventListener("keyup", filtrarProductos);

function filtrarProductos() {
	let valorBusqueda = barraBusqueda.value;

	let productosFiltrados = productos.filter((producto) => {
		return producto.name.toLowerCase().includes(valorBusqueda.toLowerCase());
	});
	mostrarProductos(productosFiltrados);
}



// Filtrar por categoria////////////////////////////////
function filtrarCategoria(categoria) {
    categoriaActual = categoria;

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.categoria === categoria);
    });

    let filtrados = categoria === "todas"
        ? productos
        : productos.filter(p => p.category === categoria);

    let valorBusqueda = barraBusqueda.value.toLowerCase();
    if (valorBusqueda) {
        filtrados = filtrados.filter(p => p.name.toLowerCase().includes(valorBusqueda));
    }

    mostrarProductos(filtrados);
}



// Agregar a carrito con cantidad////////////////////////////////
function agregarCarrito(id) {
	let existente = carrito.find(item => item.id === id);
    if (existente) {
        existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
        let producto = productos.find(p => p.id === id);
        carrito.push({ ...producto, cantidad: 1 });
    }

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