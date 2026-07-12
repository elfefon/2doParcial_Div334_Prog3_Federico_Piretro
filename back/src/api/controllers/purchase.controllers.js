import PurchaseModels from "../models/purchase.models.js";
import ExcelJS from "exceljs";

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

export const downloadPurchasesExcel = async (req, res) => {
    try {
        const [rows] = await PurchaseModels.selectPurchasesWithProducts();

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No se encontraron compras para exportar"
            });
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Autoservicio Remeras Deportivas";
        workbook.created = new Date();

        const sheet = workbook.addWorksheet("Ventas", {
            views: [{ state: "frozen", ySplit: 1 }]
        });

        // Definir columnas
        sheet.columns = [
            { header: "ID Venta", key: "id", width: 10 },
            { header: "Cliente", key: "nombre_usuario", width: 25 },
            { header: "Fecha", key: "fecha", width: 22 },
            { header: "Precio Total", key: "precio_total", width: 15 },
            { header: "Productos", key: "productos", width: 50 }
        ];

        // Estilo del header
        sheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF333333" }
            };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                bottom: { style: "thin", color: { argb: "FF000000" } }
            };
        });

        // Agregar datos
        rows.forEach(row => {
            const fecha = row.fecha instanceof Date
                ? row.fecha.toLocaleString("es-AR")
                : new Date(row.fecha).toLocaleString("es-AR");

            sheet.addRow({
                id: row.id,
                nombre_usuario: row.nombre_usuario,
                fecha: fecha,
                precio_total: `$${Number(row.precio_total).toLocaleString("es-AR")}`,
                productos: row.productos || "Sin productos asociados"
            });
        });

        // Bordes y estilo filas de datos
        for (let i = 2; i <= rows.length + 1; i++) {
            sheet.getRow(i).eachCell((cell) => {
                cell.border = {
                    bottom: { style: "hair", color: { argb: "FFCCCCCC" } }
                };
                cell.alignment = { vertical: "middle" };
            });
        }

        // Auto-filtro
        sheet.autoFilter = {
            from: "A1",
            to: "E1"
        };

        // Generar buffer y enviar
        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=ventas.xlsx");
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.log("Error generando Excel: ", error.message);
        res.status(500).json({
            message: "Error interno al generar el archivo Excel"
        });
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
