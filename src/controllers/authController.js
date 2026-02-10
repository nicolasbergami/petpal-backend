// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const dotenv = require('dotenv');
dotenv.config();

const login = (req, res) => {
    console.log("Entrando al método login"); 
    const { email, password } = req.body;
    // ✅ NUEVA VALIDACIÓN: Si no hay datos, cortamos aquí con un 400.
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    User.getByEmail(email, (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length === 0) {
            console.log("Usuario no encontrado"); 
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        console.log("Usuario encontrado", results[0].email); 
        const user = results[0];

        // Verificar contraseña
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            console.log("Contraseña incorrecta"); 
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Crear el token JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 horas
        });

        console.log("Token generado correctamente"); 
        
        // Devolvemos el usuario COMPLETO (incluyendo lat/lng para el mapa)
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, 
                dni: user.dni,
                direccion: user.direccion,
                barrio: user.barrio,
                telefono: user.telefono,
                latitude: user.latitude,   // Nuevo campo
                longitude: user.longitude, // Nuevo campo
                profile_picture: user.profile_picture
            }
        });
    });
};

// ✅ Método para registrar un usuario (Refactorizado para usar el Modelo)
const register = (req, res) => {
    console.log("🟢 Entrando al controlador de registro...");

    const { name, email, password, role, dni, direccion, barrio, telefono, latitude, longitude } = req.body;

    // 🔎 Verificación de datos obligatorios
    // Latitud y Longitud pueden ser opcionales si el frontend aún no los manda
    if (!name || !email || !password || !role || !dni || !direccion || !barrio || !telefono) {
        return res.status(400).json({ message: 'Todos los campos obligatorios deben completarse' });
    }

    // Hasheamos la contraseña
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Preparamos el objeto para el modelo
    const newUser = {
        name,
        email,
        password: hashedPassword,
        role,
        dni,
        direccion,
        barrio,
        telefono,
        latitude,  // Se guardará como NULL si viene undefined
        longitude
    };

    // Llamamos al MODELO (User.create) en vez de escribir SQL aquí
    User.create(newUser, (err, result) => {
        if (err) {
            console.error("❌ Error al registrar el usuario:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'El email ya está registrado' });
            }
            return res.status(500).json({ message: 'Error al registrar el usuario' });
        }

        console.log("🟢 Usuario registrado correctamente ID:", result.insertId);

        // Generamos Token automático tras registro
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
                telefono,
                latitude,
                longitude
            }
        });
    });
};

module.exports = {
    login,
    register
};