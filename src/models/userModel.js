// src/models/userModel.js
const db = require('../config/db');

const User = {
    getAll: (callback) => {
        db.query('SELECT * FROM users', callback);
    },

    getById: (id, callback) => {
        db.query('SELECT * FROM users WHERE id = ?', [id], callback);
    },

    getByEmail: (email, callback) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], callback);
    },

    create: (userData, callback) => {
        // ✅ AGREGADO: profile_picture
        const query = `
            INSERT INTO users (name, email, password, role, dni, direccion, barrio, telefono, latitude, longitude, profile_picture)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [
            userData.name,
            userData.email,
            userData.password,
            userData.role,
            userData.dni,
            userData.direccion,
            userData.barrio,
            userData.telefono,
            userData.latitude || null,   // Si no envían coordenadas, guarda NULL
            userData.longitude || null,  // Si no envían coordenadas, guarda NULL
            userData.profile_picture || null // Si no hay foto, NULL
        ], callback);
    },

    update: (id, userData, callback) => {
        // Construcción dinámica de la query para actualizar solo lo que se envía
        let fields = [];
        let params = [];

        if (userData.name) { fields.push('name = ?'); params.push(userData.name); }
        if (userData.email) { fields.push('email = ?'); params.push(userData.email); }
        if (userData.password) { fields.push('password = ?'); params.push(userData.password); }
        if (userData.dni) { fields.push('dni = ?'); params.push(userData.dni); }
        if (userData.direccion) { fields.push('direccion = ?'); params.push(userData.direccion); }
        if (userData.barrio) { fields.push('barrio = ?'); params.push(userData.barrio); }
        if (userData.telefono) { fields.push('telefono = ?'); params.push(userData.telefono); }
        if (userData.latitude) { fields.push('latitude = ?'); params.push(userData.latitude); }
        if (userData.longitude) { fields.push('longitude = ?'); params.push(userData.longitude); }
        
        // ✅ AGREGADO: Soporte para actualizar foto de perfil
        if (userData.profile_picture) { fields.push('profile_picture = ?'); params.push(userData.profile_picture); }

        // Si no hay campos para actualizar, retornamos error o éxito vacío
        if (fields.length === 0) {
            return callback(null, { message: "Nada que actualizar" });
        }

        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        params.push(id);

        db.query(query, params, callback);
    },

    delete: (id, callback) => {
        db.query('DELETE FROM users WHERE id = ?', [id], callback);
    }
};

module.exports = User;