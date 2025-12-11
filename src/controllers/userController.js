const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// 🟢 ADMIN: Obtener todos los usuarios
const getAllUsers = (req, res) => {
    User.getAll((err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener los usuarios' });
        } else {
            // Eliminamos las contraseñas del resultado por seguridad
            const users = results.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
            res.status(200).json(users);
        }
    });
};

// 🟢 PÚBLICO: Ver perfil de otro usuario (ej: ver al paseador)
const getUserById = (req, res) => {
    const userId = req.params.id;
    User.getById(userId, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener el usuario' });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Usuario no encontrado' });
        } else {
            const user = results[0];
            // Quitamos password antes de enviar
            const { password, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        }
    });
};

// 🟢 PRIVADO: Obtener MI propio perfil (usando el token)
// Ideal para cuando la app inicia y necesita cargar los datos del usuario logueado
const getMe = (req, res) => {
    const userId = req.user.id; // Viene del token
    User.getById(userId, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const user = results[0];
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    });
};

// 🟢 ACTUALIZAR PERFIL (Flexible y con Geo)
const updateUser = (req, res) => {
    const userId = req.user.id; // ✅ Usamos el ID del token por seguridad

    // Extraemos campos permitidos (incluyendo lat/lng y foto)
    const { 
        name, email, password, dni, direccion, barrio, telefono, 
        latitude, longitude, profile_picture 
    } = req.body;

    // Si envían password, lo hasheamos. Si no, undefined.
    const hashed = password ? bcrypt.hashSync(password, 8) : undefined;

    const userData = {
        name,
        email,
        password: hashed,
        dni,
        direccion,
        barrio,
        telefono,
        latitude,       // 📍 Nuevo
        longitude,      // 📍 Nuevo
        profile_picture // 📷 Nuevo
    };

    // Llamamos al modelo (que ya sabe ignorar los campos undefined)
    User.update(userId, userData, (err) => {
        if (err) {
            console.error('❌ Error al actualizar usuario:', err.message);
            return res.status(500).json({ message: 'Error al actualizar el usuario' });
        }
        res.status(200).json({ message: 'Usuario actualizado correctamente' });
    });
};

// 🟢 ELIMINAR USUARIO (Blindado 🛡️)
const deleteUser = (req, res) => {
    const idToDelete = req.params.id; // El ID que viene en la URL
    const requestingUserId = req.user.id; // Quien hace la petición
    const requestingUserRole = req.user.role; // Rol del que hace la petición

    // 🔒 REGLA DE SEGURIDAD:
    // Solo puedes borrarte a ti mismo, a menos que seas 'admin'
    if (parseInt(idToDelete) !== requestingUserId && requestingUserRole !== 'admin') {
        return res.status(403).json({ message: 'No tienes permiso para eliminar a este usuario' });
    }

    User.delete(idToDelete, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error al eliminar el usuario' });
        } else {
            res.status(200).json({ message: 'Usuario eliminado correctamente' });
        }
    });
};

// Nota: Eliminé 'createUser' porque esa función ya la cumple 'register' en authController.
// Tener dos formas de crear usuarios (una con token y otra sin) suele causar errores.

module.exports = {
    getAllUsers,
    getUserById,
    getMe, // Nuevo endpoint útil
    updateUser,
    deleteUser
};