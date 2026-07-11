/*=========================
    Rutas producto
==========================*/

import { Router } from "express"; // Importamos el modulo Router
import { validateId, validateProduct } from "../middlewares/middlewares.js";
import { createProduct, getAllProducts, getProductById, modifyProduct, removeProduct } from "../controllers/product.controllers.js";
import upload from "../config/multer.js";


const router = Router(); // Inicializamos el modulo router


// GET all products
router.get("/", getAllProducts);


// GET product by id
router.get("/:id", validateId, getProductById);


// POST product - multer procesa el archivo ANTES del middleware de validacion
router.post("/", upload.single("image"), validateProduct, createProduct);


// UPDATE product - multer procesa el archivo (opcional en PUT, por si se sube una nueva imagen)
router.put("/", upload.single("image"), modifyProduct);


// DELETE product
router.delete("/:id", validateId, removeProduct);


export default router;