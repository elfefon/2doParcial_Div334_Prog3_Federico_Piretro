/*===================================
    Controladores de autenticacion
===================================*/

import connection from "../database/db.js";
import bcrypt from "bcrypt";

/////////////////
// Vista Login
export const loginView = (req, res) => {
    res.render("login", {
        title: "Login",
        about: "Introduci tu email y password"
    })
}


/////////////////
// Obtener usuarios admin
export const getAdminUser = async (req, res) => {
    // TODO crear modelo de usuarios!!

    try {
        // Vamos a recibir los datos que me envia el form del login
        const { email, password } = req.body;

        // Evitamos consulta innecesaria
        if (!email || !password) {
            return res.render("login", {
                title: "Login",
                about: "Introduci tu email y password",
                error: "Todos los campos son obligatorios"
            });
        }

        // Previo al bcrypt
        /*
        const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
        const [rows] = await connection.query(sql, [email, password]);
        */

        // Bcrypt 1 -> Pedir solo el usuario que exista con ese email
        const sql = "SELECT * FROM users WHERE email = ?";
        const [rows] = await connection.query(sql, [email]);

        

        
        
        if (rows.length === 0) {
            return res.render("login", {
                title: "Login",
                about: "Introduci tu email y password",
                error: "Credenciales incorrectas"
            });
        }
        
        const user = rows[0];
        console.table(user);

        // Bcrypt 2 -> Traemos el password del req.body y comprobamos si su hasheo es el mismo que el de la BBDD
        const match = await bcrypt.compare(password, user.password);
        console.log(match);
        
        // Si los passwords hasheados coinciden, match es true y pasamos a crear la sesion y redirigir
        if (match) {
            // Guardamos una sesion
            req.session.user = {
                id: user.id,
                nombre: user.name,
                email: user.email
            }
    
            // Con la sesion creada, redirigimos, ahora si al dashboard
            res.redirect("/dashboard/index");

        } else {
            return res.render("login", {
                title: "Login",
                about: "Introduci tu email y password",
                error: "Contraseña incorrecta"
            })
        }

    } catch (error) {
        console.log("Error en el login:", error);
        // Le mandamos una respuesta al navegador para que no se quede cargando
        return res.status(500).send("Error interno del servidor al intentar iniciar sesión.");
    }
}


///////////////
// Destruir sesion
export const destroySession = (req, res) => {
    req.session.destroy((err) => {

        // Si hubiera algun error, mandamos un aviso por consola y retornamos un error 500
        if (err) {
            console.error("Error al destruir la sesion: ", err);

            return res.status(500).json({
                message: "Error al cerrar sesion"
            })
        }

        // Si no existiera ningun error, redirigimos a la pagina de login
        res.redirect("/login");
    })
}


///////////////
// Registrar nuevo usuario
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirm_password } = req.body;

        if (!name || !email || !password || !confirm_password) {
            return res.render("login", {
                title: "Login",
                about: "Introducí tu email y password",
                error: "Todos los campos son obligatorios",
                showRegister: true
            });
        }

        if (password !== confirm_password) {
            return res.render("login", {
                title: "Login",
                about: "Introducí tu email y password",
                error: "Las contraseñas no coinciden",
                showRegister: true
            });
        }

        if (password.length < 6) {
            return res.render("login", {
                title: "Login",
                about: "Introducí tu email y password",
                error: "La contraseña debe tener al menos 6 caracteres",
                showRegister: true
            });
        }

        // Verificar si el email ya existe
        const [existing] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.render("login", {
                title: "Login",
                about: "Introducí tu email y password",
                error: "El email ya está registrado",
                showRegister: true
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await connection.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name.trim(), email, hashedPassword]
        );

        // Iniciamos sesion automaticamente
        req.session.user = {
            id: result.insertId,
            nombre: name.trim(),
            email
        };

        res.redirect("/dashboard/index");

    } catch (error) {
        console.error("Error en registro:", error);
        return res.status(500).send("Error interno al registrar usuario.");
    }
}