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
    selectProductsPaginated,
    countActiveProducts,
    selectProductById,
    insertProduct,
    updateProduct,
    deleteProduct
}