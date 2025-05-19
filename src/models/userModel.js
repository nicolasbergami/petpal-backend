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
        const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        db.query(query, [userData.name, userData.email, userData.password, userData.role], callback);
    },

    update: (id, userData, callback) => {
        const query = 'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?';
        db.query(query, [userData.name, userData.email, userData.password, userData.role, id], callback);
    },

    delete: (id, callback) => {
        db.query('DELETE FROM users WHERE id = ?', [id], callback);
    }
};

module.exports = User;
