/*===============================
    Controladores  de vistas
================================*/

// Importamos el modelo de los productos para poder comunicarlos con la BBDD
import ProductModels from "../models/product.models.js"

// Vista index (con paginación y filtros)
export const indexView = async (req, res) => {

    try {
        const pageNum = Math.max(1, parseInt(req.query.page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit) || 8));
        const offset = (pageNum - 1) * limitNum;
        const categoria = req.query.categoria || "todas";
        const estado = req.query.estado || "todos";

        const [rows] = await ProductModels.selectAllProductsPaginatedFiltered(limitNum, offset, categoria, estado);
        const [countResult] = await ProductModels.countAllProductsFiltered(categoria, estado);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limitNum) || 1;

        res.render("index", {
            title: "Inicio",
            about: "Nuestros productos",
            productsArray: rows,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages
            },
            filtros: {
                categoria,
                estado
            }
        });

    } catch (error) {
        console.log(error);
    }
}

// Vista GET
export const getView = (req, res) => {
    res.render("get", {
        title: "Consultar",
        about: "Consultar producto por id:"
    });
}

// Vista POST
export const createView = (req, res) => {
    res.render("post", {
        title: "Crear",
        about: "Crear producto"
    });
}

// Vista PUT
export const updateView = (req, res) => {
    res.render("put", {
        title: "Modificar",
        about: "Consultar producto por id:"
    });
}

// Vista DELETE
export const deleteView = (req, res) => {
    res.render("delete", {
        title: "Eliminar",
        about: "Consultar producto por id:"
    });
}