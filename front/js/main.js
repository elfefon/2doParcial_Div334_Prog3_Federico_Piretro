// Redireccion a inicio////////////////////
let nombreUsuario = sessionStorage.getItem("nombreUsuario");

// Redirige si no existe un nombre de usuario
if(!nombreUsuario){
	window.location.href = "index.html";
}

const searchToggle = document.getElementById("search-toggle");
const searchInput = document.getElementById("search-input");

searchToggle.addEventListener("click", () => {
    searchToggle.style.opacity = "0";
    setTimeout(() => {
        searchToggle.style.display = "none";
        searchInput.classList.remove("hidden");
        searchInput.focus();
    }, 150);
});

function cerrarBusqueda() {
    if (!searchInput.classList.contains("hidden")) {
        searchInput.classList.add("hidden");
        searchToggle.style.display = "";
        setTimeout(() => {
            searchToggle.style.opacity = "1";
        }, 50);
    }
}

searchInput.addEventListener("blur", () => {
    setTimeout(cerrarBusqueda, 150);
});

document.addEventListener("click", (event) => {
    if (!searchInput.contains(event.target) && !searchToggle.contains(event.target)) {
        cerrarBusqueda();
    }
});

// Variables////////////////////////////////
let productos = [];
let cuadriculaProductos = document.querySelector(".product-grid");
let barraBusqueda = document.querySelector(".search-bar");
let paginationContainer = document.getElementById("pagination-controls");

let contadorCarrito = document.getElementById("cart-count");

// El carrito vive en sessionStorage para compartirse entre productos.html y carrito.html
// Normalizamos items viejos (sin cantidad) a formato con cantidad
let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
carrito = carrito.map(item => typeof item.cantidad === "number" ? item : { ...item, cantidad: 1 });
sessionStorage.setItem("carrito", JSON.stringify(carrito));

let categoriaActual = "todas";

// Paginación
let paginaActual = 1;
let totalPaginas = 1;
let productosPorPagina = 8;




// Obtener productos////////////////////////////////////////////
const url = "http://localhost:3000/api/products";
const API_URL = "http://localhost:3000";

function resolverUrlImagen(image) {
    if (!image) return "";
    return image.startsWith("/") ? API_URL + image : image;
}

async function obtenerProductos(page = 1) {
    try {
        let respuesta = await fetch(`${url}?page=${page}&limit=${productosPorPagina}`);

        let data = await respuesta.json();

        console.log(data);

        productos = data.payload;

        // Actualizar estado de paginación
        if (data.pagination) {
            paginaActual = data.pagination.page;
            totalPaginas = data.pagination.totalPages;
        }

        mostrarProductos(productos);
        renderizarPaginacion();

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
                <img src="${resolverUrlImagen(array[i].image)}" alt="${array[i].name}" onerror="this.onerror=null;this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22><rect fill=%22%23f0f0f0%22 width=%22300%22 height=%22200%22/><text fill=%22%23999%22 font-family=%22Arial%22 font-size=%2214%22 text-anchor=%22middle%22 x=%22150%22 y=%22105%22>'+encodeURIComponent(array[i].name)+'</text></svg>';">
                <h3>${array[i].name}</h3>
                <p>$${array[i].price}</p>
                <p class="product-category">${array[i].category} | ${array[i].country}</p>
                <button class="add-to-cart" onclick="agregarCarrito(${array[i].id})">Agregar a carrito</button>
            </div>
        `;
    }
    cuadriculaProductos.innerHTML = cartaProducto;
}

// Renderizar controles de paginación////////////////////////////////
function renderizarPaginacion() {
    if (totalPaginas <= 1) {
        paginationContainer.innerHTML = "";
        return;
    }

    let html = "";

    // Botón anterior
    html += `<button class="page-btn" ${paginaActual === 1 ? "disabled" : ""} onclick="irAPagina(${paginaActual - 1})">&laquo; Anterior</button>`;

    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        html += `<button class="page-btn${i === paginaActual ? " active" : ""}" onclick="irAPagina(${i})">${i}</button>`;
    }

    // Botón siguiente
    html += `<button class="page-btn" ${paginaActual === totalPaginas ? "disabled" : ""} onclick="irAPagina(${paginaActual + 1})">Siguiente &raquo;</button>`;

    paginationContainer.innerHTML = html;
}

// Navegar a una página////////////////////////////////
function irAPagina(page) {
    if (page < 1 || page > totalPaginas) return;
    obtenerProductos(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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