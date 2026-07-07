import PurchaseModels from "../models/purchase.models.js";

export const getAllPurchases = async (req, res) => {
    try {
        const [rows] = await PurchaseModels.selectAllPurchases();

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No se encontraron compras"
            })
        }

        res.status(200).json({
            total: rows.length,
            payload: rows
        });
    } catch (error) {
        console.log("Error obteniendo compras: ", error.message);
        res.status(500).json({
            message: "Error interno al obtener compras"
        })
    }
}

export const createPurchase = async (req, res) => {
    try {
        const { nombre_usuario, precio_total, ids_productos } = req.body;

        if (!nombre_usuario || !precio_total) {
            return res.status(400).json({
                message: "Faltan datos: nombre_usuario y precio_total son obligatorios"
            });
        }

        if (isNaN(precio_total) || Number(precio_total) <= 0) {
            return res.status(400).json({
                message: "El precio total debe ser un numero mayor a 0"
            });
        }

        if (!ids_productos || !Array.isArray(ids_productos) || ids_productos.length === 0) {
            return res.status(400).json({
                message: "Debe incluir al menos un producto en la compra"
            });
        }

        const [rows] = await PurchaseModels.insertPurchase(nombre_usuario.trim(), Number(precio_total));
        const purchaseId = rows.insertId;

        await PurchaseModels.insertPurchaseProducts(purchaseId, ids_productos);

        res.status(201).json({
            message: `Compra registrada con exito con id ${purchaseId}`,
            purchaseId
        });
    } catch (error) {
        console.log("Error creando compra: ", error.message);
        res.status(500).json({
            message: "Error interno al registrar la compra"
        })
    }
}
