/*===========================
    Rutas de autenticacion
============================*/

import { Router } from "express";
import { getAdminUser, loginView, registerUser } from "../controllers/auth.controllers.js";

const router = Router();

// Vista login
router.get("/", loginView);

// Obtener usuarios admin
router.post("/", getAdminUser);

// Registrar nuevo usuario
router.post("/register", registerUser);



export default router;