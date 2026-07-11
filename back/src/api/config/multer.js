/*=========================
    Configuracion Multer
==========================*/

import multer from "multer";
import { join, __dirname } from "../utils/index.js";
import { extensionesPermitidas, mensajeErrorExtension } from "../middlewares/middlewares.js";

// Directorio donde se guardaran las imagenes subidas
const uploadsDir = join(__dirname, "src/public/uploads/products");

// Configuracion del almacenamiento en disco
const storage = multer.diskStorage({

    // Definimos el directorio destino donde se guardaran los archivos
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },

    // Definimos el nombre con el que se guardara el archivo
    filename: (req, file, cb) => {
        // Obtenemos la extension original del archivo (ej: .jpg, .png)
        const extension = file.originalname.split(".").pop();

        // Generamos un nombre unico usando timestamp + numero random
        // Esto evita colisiones de nombres y sobreescribir archivos existentes
        const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;

        cb(null, nombreUnico);
    }
});

// Filtro de archivos: solo permitimos imagenes
const fileFilter = (req, file, cb) => {

    // Verificamos si la extension del archivo esta en la lista de permitidas
    if (extensionesPermitidas.includes(file.mimetype)) {
        cb(null, true); // Aceptamos el archivo
    } else {
        cb(new Error(mensajeErrorExtension), false); // Rechazamos el archivo
    }
};

// Configuracion principal de multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5 MB por archivo
    }
});

export default upload;
