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
        [petData.user_id, petData.name, petData.breed, petData.age, petData.weight, petData.pet_type, petData.description],
        callback
    );
},


   update: (id, petData, callback) => {
    const query = `
        UPDATE pets 
        SET name = ?, breed = ?, age = ?, weight = ?, pet_type = ?, description = ?
        WHERE id = ?
    `;
    db.query(
        query,
        [
            petData.name,
            petData.breed,
            petData.age,
            petData.weight,
            petData.pet_type,
            petData.description,
            id
        ],
        callback
    );
},


    delete: (id, callback) => {
        db.query('DELETE FROM pets WHERE id = ?', [id], callback);
    }
};

module.exports = Pet;
