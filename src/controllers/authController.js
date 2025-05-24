// src/controllers/authController.js
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const dotenv = require('dotenv');
dotenv.config();

const login = (req, res) => {
    console.log("Entrando al método login"); // 👈 Log para verificar
    const { email, password } = req.body;

    User.getByEmail(email, (err, results) => {
        if (err || results.length === 0) {
            console.log("Usuario no encontrado o error en la consulta"); // 👈 Log para verificar
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        console.log("Usuario encontrado", results); // 👈 Log para verificar
        const user = results[0];

        // Verificar contraseña
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            console.log("Contraseña incorrecta"); // 👈 Log para verificar
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Crear el token JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 horas
        });

        console.log("Token generado correctamente"); // 👈 Log para verificar
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, dni: user.dni,
                direccion: user.direccion,
                barrio: user.barrio,
                telefono: user.telefono
            }
        });
    });
};

// ✅ Método para registrar un usuario
const register = (req, res) => {
    console.log("🟢 Entrando al controlador de registro...");

    const { name, email, password, role, dni, direccion, barrio, telefono } = req.body;

    // 🔎 Verificación de datos obligatorios
    if (!name || !email || !password || !role || !dni || !direccion || !barrio || !telefono) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const query = `
        INSERT INTO users (name, email, password, role, dni, direccion, barrio, telefono) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [name, email, hashedPassword, role, dni, direccion, barrio, telefono], (err, result) => {
        if (err) {
            console.error("❌ Error al registrar el usuario:", err.message);
            return res.status(500).json({ message: 'Error al registrar el usuario' });
        }

        console.log("🟢 Usuario registrado correctamente:", result);

        const token = jwt.sign({ id: result.insertId, role }, process.env.JWT_SECRET, {
            expiresIn: 86400
        });

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token: token,
            user: {
                id: result.insertId,
                name,
                email,
                role,
                dni,
                direccion,
                barrio,
                telefono
            }
        });
    });
};

module.exports = {
    login,
    register
};
