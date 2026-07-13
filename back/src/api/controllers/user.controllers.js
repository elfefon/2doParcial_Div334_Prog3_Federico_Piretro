/*===================================
    Controladores de usuario
===================================*/

import connection from "../database/db.js";
import bcrypt from "bcrypt";

export const createAdminUser = async (req, res) => {
    try {

        const { name, email, password, confirm_password } = req.body;

        if (!name || !email || !password || !confirm_password) {
            return res.status(400).json({
                message: "Datos invalidos, faltan campos"
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                message: "El nombre debe tener al menos 2 caracteres"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 6 caracteres"
            });
        }

        if (password !== confirm_password) {
            return res.status(400).json({
                message: "Las contraseñas no coinciden"
            });
        }

        const [existing] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({
                message: "Ya existe un usuario con ese email"
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        await connection.query(sql, [name.trim(), email.trim(), hashedPassword]);

        res.status(201).json({
            message: "Usuario admin creado con exito"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Error interno del servidor"
        })
    }
}
