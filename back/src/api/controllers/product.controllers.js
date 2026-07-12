/*===============================
    Controladores productos
================================*/

// Importamos el modelo de los productos para poder comunicarlos con la BBDD
import ProductModels from "../models/product.models.js"

//////////////////////
// GET all products
export const getAllProducts = async (req, res) => {
    try {
        const { page, limit } = req.query;

        // Si se envían parámetros de paginación, devolvemos solo esa página
        if (page || limit) {
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 8));
            const offset = (pageNum - 1) * limitNum;

            const [rows] = await ProductModels.selectProductsPaginated(limitNum, offset);
            const [countResult] = await ProductModels.countActiveProducts();
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limitNum);

            return res.status(200).json({
                payload: rows,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages
                }
            });
        }

        // Sin paginación: devolver todos (comportamiento original)
        const [rows] = await ProductModels.selectAllProducts();

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No se encontraron productos"
            })
        }
        
        res.status(200).json({
            total: rows.length,
            payload: rows
        });

    } catch (error) {
        console.log("Error obteniendo productos: ", error.message);

        res.status(500).json({
            message: "Error interno al obtener productos"
        })
    }
}



//////////////////////
// GET product by id
export const getProductById = async (req, res) => {
    try {
        /*//////////////////////
        // Optimizacion 1:  Ahora el id ya lo obtiene el middleware validateId
        // Gracias al destructuring, agarramos el valor id de req.params
        const { id } = req.params;
        // const id = req.params.id -> misma solucion
        */

        const [rows] = await ProductModels.selectProductById(req.id);
        // console.log(rows);

        //////////////////////
        // Optimizacion 3: Si no encontramos un producto con ese id, devolvemos 404
        if(rows.length === 0) {
            return res.status(404).json({
                message: `No se encontro producto con id ${req.id}`
            });
        }

        res.status(200).json({
            payload: rows[0]
        });

    } catch (error) {
        console.log("Error obteniendo producto con id: ", error.message);

        ///////////////////
        // Optimizacion 4: Le devolvemos un status 500 al cliente
        res.status(500).json({
            message: `Error interno al obtener un producto con id ${req.id}`
        });
    }
}



//////////////////
// POST product
export const createProduct = async (req, res) => {

    try {
        const { name, category, country, price } = req.body;

        if (!name || !category || !country || !price) {
            return res.status(400).json({
                message: "Datos invalidos, asegurate de incluir todas las categorias"
            });
        }

        const cleanName = name.trim();

        // Determinamos la imagen: si se subio archivo usamos la ruta local, si no usamos la URL
        let image = "";
        if (req.file) {
            image = `/uploads/products/${req.file.filename}`;
        } else if (req.body.image) {
            image = req.body.image.trim();
        }

        const [rows] = await ProductModels.insertProduct(cleanName, image, category, country, price);

        res.status(201).json({
            message: `Producto creado con exito con id ${rows.insertId}`,
            productId: rows.insertId
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error interno del servidor"
        })
    }
}



//////////////////
// PUT product
export const modifyProduct = async (req, res) => {

    try {
        const { id, name, category, country, price, active } = req.body;

        if (!name || !price || !category || !country) {
            return res.status(400).json({
                message: "Todos los campos son requeridos (name, price, category, country)"
            });
        }

        // Determinamos la imagen: archivo nuevo, URL nueva, o mantener la actual
        let image = req.body.currentImage || "";
        if (req.file) {
            image = `/uploads/products/${req.file.filename}`;
        } else if (req.body.image) {
            image = req.body.image.trim();
        }
       
        const [result] = await ProductModels.updateProduct(name, image, category, country, price, active, id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "No se actualizó el producto"
            });
        }

        return res.status(200).json({
            message: `Producto con id ${id} actualizado correctamente`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error interno al actualizar el producto"
        })
    }
}


// DELETE product
export const removeProduct = async (req, res) => {
    // Optimizacion 1: El middleware validateId ya limpia e incorpora el id en la req.id (no hace falta extraerlo)
    // const { id } = req.params;

    // Optimizacion 2: Manejar errores con un bloque try...catch
    try {
       
        await ProductModels.deleteProduct(req.id);
    
        res.status(200).json({
            message: `Producto con id ${req.id} eliminado exitosamente`
        });

        // OPCION 2: 204: Para un DELETE exitoso, la convencion REST es devolver 204 No Content sin body

    } catch (error) {
        console.log("Error en peticion DELETE: ", error);

        // Optimizacion 3: Devolvemos un codigo de estado 500 y le enviamos un mensaje generico (no enviamos el error crudo al cliente)
        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}