// Redireccion a inicio////////////////////
let nombreUsuario = sessionStorage.getItem("nombreUsuario");

if(!nombreUsuario){
	window.location.href = "index.html";
}

// El carrito se lee desde sessionStorage (lo llena productos.html) y normalizamos items sin cantidad
let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
carrito = carrito.map(item => typeof item.cantidad === "number" ? item : { ...item, cantidad: 1 });

let objetosCarrito = document.getElementById("cart-items");
let precioCarrito = document.getElementById("total-price");
let contadorCarrito = document.getElementById("cart-count");
let boton_imprimir = document.getElementById("btn-imprimir");



// Guarda el carrito actualizado en sessionStorage
function guardarCarrito() {
    sessionStorage.setItem("carrito", JSON.stringify(carrito));
}



// Mostrar carrito agrupado con cantidades////////////////////////////////
function mostrarCarrito() {
    let carritoCompra = "";
    let precioTotal = 0;

    // Agrupamos por id
    const agrupados = [];
    const vistos = new Set();
    carrito.forEach(item => {
        if (vistos.has(item.id)) return;
        vistos.add(item.id);
        const cantidad = carrito
            .filter(i => i.id === item.id)
            .reduce((sum, i) => sum + (i.cantidad || 1), 0);
        agrupados.push({ ...item, cantidad });
    });

    agrupados.forEach(producto => {
        const subtotal = parseInt(producto.price) * producto.cantidad;
        precioTotal += subtotal;

        carritoCompra += `
            <li class="item-block">
                <p class="item-name">${producto.name} - $${producto.price} x ${producto.cantidad} = <strong>$${subtotal}</strong></p>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="disminuirCantidad(${producto.id})">-</button>
                    <span class="qty-value">${producto.cantidad}</span>
                    <button class="qty-btn" onclick="aumentarCantidad(${producto.id})">+</button>
                    <button class="delete-button" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                </div>
            </li>
        `;
    });

    objetosCarrito.innerHTML = carritoCompra;
    precioCarrito.innerHTML = `$${precioTotal}`;
    contadorCarrito.innerHTML = carrito.reduce((sum, i) => sum + (i.cantidad || 1), 0);

    if(agrupados.length > 0) {
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



// Aumentar cantidad de un producto////////////////////////////////
function aumentarCantidad(id) {
    const item = carrito.find(i => i.id === id);
    if (item) {
        item.cantidad = (item.cantidad || 1) + 1;
    }
    guardarCarrito();
    mostrarCarrito();
}



// Disminuir cantidad (si queda 1, elimina)////////////////////////////////
function disminuirCantidad(id) {
    const idx = carrito.findIndex(i => i.id === id);
    if (idx === -1) return;

    if ((carrito[idx].cantidad || 1) > 1) {
        carrito[idx].cantidad -= 1;
    } else {
        carrito.splice(idx, 1);
    }
    guardarCarrito();
    mostrarCarrito();
}



// Eliminar producto completamente////////////////////////////////
function eliminarProducto(id) {
    carrito = carrito.filter(i => i.id !== id);
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
    // Agrupamos para el ticket
    const agrupados = [];
    const vistos = new Set();
    carrito.forEach(item => {
        if (vistos.has(item.id)) return;
        vistos.add(item.id);
        const cantidad = carrito
            .filter(i => i.id === item.id)
            .reduce((sum, i) => sum + (i.cantidad || 1), 0);
        agrupados.push({ ...item, cantidad });
    });

    const idProductos = agrupados.map(p => p.id);
    const precioTotal = agrupados.reduce((total, p) => total + parseInt(p.price) * p.cantidad, 0);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;

    doc.setFontSize(18);
    doc.text("Ticket de compra:", 10, y);
    y += 10;

    doc.setFontSize(12);

    agrupados.forEach(producto => {
        doc.text(`${producto.name} x${producto.cantidad} / $${producto.price} c/u`, 20, y);
        y += 7;
    });

    y += 5;
    doc.text(`Total $${precioTotal}`, 10, y);

    doc.save("ticket.pdf");

    registrarVenta(precioTotal, idProductos);
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
        const data = {
            nombre_usuario: nombreUsuario,
            precio_total: precioTotal,
            ids_productos: idProductos
        }

        const response = await fetch("http://localhost:3000/api/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if(response.ok) {
            console.log("Venta registrada: ", result);
            alert("Compra registrada con exito!");

            carrito = [];
            sessionStorage.removeItem("carrito");
            mostrarCarrito();

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