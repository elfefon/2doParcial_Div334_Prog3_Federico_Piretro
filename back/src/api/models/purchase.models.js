import connection from "../database/db.js";

const selectAllPurchases = () => {
    const sql = "SELECT id, nombre_usuario, fecha, precio_total FROM ventas ORDER BY fecha DESC";
    return connection.query(sql);
}

const selectPurchasesWithProducts = () => {
    const sql = `
        SELECT v.id, v.nombre_usuario, v.fecha, v.precio_total,
               GROUP_CONCAT(p.name SEPARATOR ', ') AS productos
        FROM ventas v
        LEFT JOIN ventas_productos vp ON v.id = vp.id_venta
        LEFT JOIN products p ON vp.id_producto = p.id
        GROUP BY v.id
        ORDER BY v.fecha DESC
    `;
    return connection.query(sql);
}

const insertPurchase = (nombre_usuario, precio_total, ids_productos) => {
    const sql = "INSERT INTO ventas (nombre_usuario, fecha, precio_total) VALUES (?, NOW(), ?)";
    return connection.query(sql, [nombre_usuario, precio_total]);
}

const insertPurchaseProducts = (id_venta, ids_productos) => {
    if (!ids_productos || ids_productos.length === 0) return;

    const values = ids_productos.map(id => [id_venta, id]);
    const sql = "INSERT INTO ventas_productos (id_venta, id_producto) VALUES ?";
    return connection.query(sql, [values]);
}

export default {
    selectAllPurchases,
    selectPurchasesWithProducts,
    insertPurchase,
    insertPurchaseProducts
}
