// src/models/petModel.js
const db = require('../config/db');

const Pet = {
    getAll: (callback) => {
        db.query('SELECT * FROM pets', callback);
    },

    getById: (id, callback) => {
        db.query('SELECT * FROM pets WHERE id = ?', [id], callback);
    },

    getByUserId: (userId, callback) => {
        db.query('SELECT * FROM pets WHERE user_id = ?', [userId], callback);
    },

    create: (petData, callback) => {
        const query = `
            INSERT INTO pets (user_id, name, breed, age, weight, pet_type, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
            query,
            [
                petData.user_id, 
                petData.name, 
                petData.breed, 
                petData.age, 
                petData.weight, 
                petData.pet_type, 
                petData.description
            ],
            callback
        );
    },

    // ✅ UPDATE DINÁMICO (Permite actualizar campos sueltos)
    update: (id, petData, callback) => {
        let fields = [];
        let params = [];

        if (petData.name) { fields.push('name = ?'); params.push(petData.name); }
        if (petData.breed) { fields.push('breed = ?'); params.push(petData.breed); }
        if (petData.age) { fields.push('age = ?'); params.push(petData.age); }
        if (petData.weight) { fields.push('weight = ?'); params.push(petData.weight); }
        if (petData.pet_type) { fields.push('pet_type = ?'); params.push(petData.pet_type); }
        if (petData.description) { fields.push('description = ?'); params.push(petData.description); }

        if (fields.length === 0) {
            return callback(null, { message: "Nada que actualizar" });
        }

        // Agregamos el ID al final de los parámetros
        params.push(id);

        const query = `UPDATE pets SET ${fields.join(', ')} WHERE id = ?`;
        
        db.query(query, params, callback);
    },

    // ✅ DELETE SEGURO: Requiere el user_id para asegurar que sea el dueño
    delete: (id, userId, callback) => {
        const query = 'DELETE FROM pets WHERE id = ? AND user_id = ?';
        db.query(query, [id, userId], callback);
    }
};

module.exports = Pet;