// Redireccion a inicio////////////////////
let nombreUsuario = sessionStorage.getItem("nombreUsuario");

if(!nombreUsuario){
	window.location.href = "index.html";
}

// El carrito se lee desde sessionStorage (lo llena productos.html)
let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

let objetosCarrito = document.getElementById("cart-items");
let precioCarrito = document.getElementById("total-price");
let contadorCarrito = document.getElementById("cart-count");
let boton_imprimir = document.getElementById("btn-imprimir");




// Guarda el carrito actualizado en sessionStorage
function guardarCarrito() {
    sessionStorage.setItem("carrito", JSON.stringify(carrito));
}




// Mostrar carrito////////////////////////////////
function mostrarCarrito() {
    let carritoCompra = "";
    let precioTotal = 0;

    carrito.forEach((producto, indice) => {
        carritoCompra += `
            <li class="item-block">
                <p class="item-name">${producto.name} - $${producto.price}</p>
                <button class="delete-button" onclick="eliminarProducto(${indice})">Eliminar</button>
            </li>
            `;

        precioTotal += parseInt(producto.price, 10);
    });

    objetosCarrito.innerHTML = carritoCompra;
    precioCarrito.innerHTML = `$${precioTotal}`;
    contadorCarrito.innerHTML = carrito.length;

    if(carrito.length > 0) {
        document.getElementById("empty-cart").classList.remove("hidden");
        document.getElementById("empty-cart").classList.add("visible");

        boton_imprimir.classList.remove("hidden");
        boton_imprimir.classList.add("visible");
    } else {
        document.getElementById("empty-cart").classList.remove("visible");
        document.getElementById("empty-cart").classList.add("hidden");
        boton_imprimir.classList.remove("visible");
        boton_imprimir.classList.add("hidden");

        objetosCarrito.innerHTML = `<p class="info-carrito">No hay productos en el carrito.</p>`;
    }
}




function eliminarProducto(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    mostrarCarrito();
}




function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    mostrarCarrito();
}




// Imprimir tickets pdf ////////////////////////////////
boton_imprimir.addEventListener("click", imprimirTicket);

function imprimirTicket() {
    console.table(carrito);

    const idProductos = [];

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;

    doc.setFontSize(18);
    doc.text("Llama-ticket de compra:", 10, y);
    y += 10;

    doc.setFontSize(12);

    carrito.forEach(producto => {
        idProductos.push(producto.id);
        doc.text(`${producto.name} / ${producto.price}`, 20, y);
        y += 7;
    });

    const precioTotal = carrito.reduce((total, producto) => total + parseInt(producto.price), 0);

    y += 5;
    doc.text(`Total $${precioTotal}`, 10, y);

    doc.save("ticket.pdf");

    registrarVenta(precioTotal, idProductos);
}




// Creando ventas //////////////////////////////////////
async function registrarVenta(precioTotal, idProductos) {
    try {
        const fecha = new Date();
        const fechaFormato = fecha.toISOString().slice(0, 19).replace("T", " "); // Formato MySQL

        const data = {
            nombreUsuario: nombreUsuario,
            precioTotal: precioTotal,
            fechaEmision: fechaFormato,
            productos: idProductos
        }

        const response = await fetch("http://localhost:3000/api/sales", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if(response.ok) {
            console.log("Venta registrada: ", result);
            alert(result.message);

            sessionStorage.removeItem("nombreUsuario");
            sessionStorage.removeItem("carrito");
            window.location.href = "index.html";

        } else {
            console.error(result);
            alert("Error en la venta: " + result.message);
        }

    } catch (error) {
        console.error("Error al enviar los datos", error);
        alert("Error al registrar la venta");
    }
}




// Funcion inicializadora
function init() {
    mostrarCarrito();
}

init();