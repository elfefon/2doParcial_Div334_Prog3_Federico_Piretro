/*===========================
    Rutas de autenticacion
============================*/

import { Router } from "express";
import { getAdminUser, loginView } from "../controllers/auth.controllers.js";
import { createAdminUser } from "../controllers/user.controllers.js";

const router = Router();

// Vista login
router.get("/", loginView);

// Obtener usuarios admin
router.post("/", getAdminUser);

// API: Crear usuario admin (JSON)
router.post("/api/register", createAdminUser);



export default router;