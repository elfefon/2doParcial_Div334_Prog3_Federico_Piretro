/*===============================
    Modelos de productos
================================*/

import connection from "../database/db.js";

///////////////////////////////
// Traer todos los productos
const selectAllProducts = () => {
    const sql = "SELECT id, name, price, image, category, country, active FROM products";
    return connection.query(sql);
}

///////////////////////////////
// Contar todos los productos (para el dashboard)
const countAllProducts = () => {
    const sql = "SELECT COUNT(*) AS total FROM products";
    return connection.query(sql);
}

///////////////////////////////
// Traer productos paginados (todos, incluye inactivos, para el dashboard)
const selectAllProductsPaginated = (limit, offset) => {
    const sql = "SELECT id, name, price, image, category, country, active FROM products ORDER BY active DESC, id ASC LIMIT ? OFFSET ?";
    return connection.query(sql, [limit, offset]);
}

///////////////////////////////
// Contar productos con filtros
const countAllProductsFiltered = (categoria, estado) => {
    let sql = "SELECT COUNT(*) AS total FROM products WHERE 1=1";
    const params = [];
    if (categoria && categoria !== "todas") {
        sql += " AND category = ?";
        params.push(categoria);
    }
    if (estado === "activos") {
        sql += " AND active = 1";
    } else if (estado === "inactivos") {
        sql += " AND active = 0";
    }
    return connection.query(sql, params);
}

///////////////////////////////
// Traer productos paginados con filtros
const selectAllProductsPaginatedFiltered = (limit, offset, categoria, estado) => {
    let sql = "SELECT id, name, price, image, category, country, active FROM products WHERE 1=1";
    const params = [];
    if (categoria && categoria !== "todas") {
        sql += " AND category = ?";
        params.push(categoria);
    }
    if (estado === "activos") {
        sql += " AND active = 1";
    } else if (estado === "inactivos") {
        sql += " AND active = 0";
    }
    sql += " ORDER BY active DESC, id ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    return connection.query(sql, params);
}

///////////////////////////////
// Traer productos paginados (solo activos, para el cliente)
const selectProductsPaginated = (limit, offset) => {
    const sql = "SELECT id, name, price, image, category, country, active FROM products WHERE active = 1 ORDER BY id ASC LIMIT ? OFFSET ?";
    return connection.query(sql, [limit, offset]);
}

///////////////////////////////
// Contar total de productos activos
const countActiveProducts = () => {
    const sql = "SELECT COUNT(*) AS total FROM products WHERE active = 1";
    return connection.query(sql);
}

const selectProductById = (id) => {
    const sql = "SELECT id, name, price, image, category, country, active FROM products where products.id = ?";
    return connection.query(sql, [id]);
}



///////////////////////////////
// Crear nuevo producto
const insertProduct = (name, image, category, country, price) => {

    const sql = "INSERT INTO products (name, image, category, country, price) VALUES (?, ?, ?, ?, ?)";

    // Optimizacion 4: Guardamos la respuesta en rows, para obtener el id rows.insertId
    return connection.query(sql, [name, image, category, country, price]);
}



///////////////////////////////
// Modificar producto
const updateProduct = (name, image, category, country, price, active, id) => {
    const sql = "UPDATE products SET name = ?, image = ?, category = ?, country = ?, price = ?, active = ? WHERE id = ?";

    return connection.query(sql, [name, image, category, country, price, active, id]);
}


///////////////////////////////
// Eliminar producto
const deleteProduct = (id) => {
    const sql = "DELETE FROM products WHERE id = ?";
    return connection.query(sql, [id]);
}


// Gracias a la palabra clave default, podre ponerle otro nombre cuando importe
// Si no pongo default, tendre que importar con el mismo nombre
export default {
    selectAllProducts,
    countAllProducts,
    selectAllProductsPaginated,
    countAllProductsFiltered,
    selectAllProductsPaginatedFiltered,
    selectProductsPaginated,
    countActiveProducts,
    selectProductById,
    insertProduct,
    updateProduct,
    deleteProduct
}