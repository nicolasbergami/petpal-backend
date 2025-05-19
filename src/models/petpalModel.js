// src/models/petpalModel.js
const db = require('../config/db');

const Petpal = {
    getAll: (callback) => {
        db.query('SELECT * FROM petpal_profiles', callback);
    },

    getById: (id, callback) => {
        db.query('SELECT * FROM petpal_profiles WHERE id = ?', [id], callback);
    },

    create: (profileData, callback) => {
        const query = `INSERT INTO petpal_profiles (user_id, service_type, price_per_hour, price_per_day, experience, location, pet_type, size_accepted) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [
            profileData.user_id,
            profileData.service_type,
            profileData.price_per_hour,
            profileData.price_per_day,
            profileData.experience,
            profileData.location,
            profileData.pet_type,
            profileData.size_accepted
        ], callback);
    },

    update: (id, profileData, callback) => {
        const query = `UPDATE petpal_profiles 
                       SET service_type = ?, price_per_hour = ?, price_per_day = ?, experience = ?, 
                           location = ?, pet_type = ?, size_accepted = ?
                       WHERE id = ?`;
        db.query(query, [
            profileData.service_type,
            profileData.price_per_hour,
            profileData.price_per_day,
            profileData.experience,
            profileData.location,
            profileData.pet_type,
            profileData.size_accepted,
            id
        ], callback);
    },

    delete: (id, callback) => {
        db.query('DELETE FROM petpal_profiles WHERE id = ?', [id], callback);
    },
    search: (filters, callback) => {
        const { location, pet_type, size } = filters;

        let query = `SELECT * FROM petpal_profiles WHERE location = ? AND pet_type = ?`;
        const params = [location, pet_type];

        // Adaptar al tamaño aceptado
        if (size === 'small') {
            query += " AND (size_accepted = 'small' OR size_accepted = 'medium' OR size_accepted = 'large')";
        } else if (size === 'medium') {
            query += " AND (size_accepted = 'medium' OR size_accepted = 'large')";
        } else if (size === 'large') {
            query += " AND size_accepted = 'large'";
        }

        db.query(query, params, callback);
    }
};

module.exports = Petpal;
