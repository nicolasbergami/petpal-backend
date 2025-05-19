// src/models/reservationModel.js
const db = require('../config/db');

const Reservation = {
    getAll: (callback) => {
        db.query('SELECT * FROM reservations', callback);
    },

    getById: (id, callback) => {
        db.query('SELECT * FROM reservations WHERE id = ?', [id], callback);
    },

    create: (reservationData, callback) => {
        const query = `INSERT INTO reservations (client_id, petpal_id, pet_id, service_type, date_start, date_end, status) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.query(query, [
            reservationData.client_id,
            reservationData.petpal_id,
            reservationData.pet_id,
            reservationData.service_type,
            reservationData.date_start,
            reservationData.date_end,
            reservationData.status
        ], callback);
    },

    updateStatus: (id, status, callback) => {
        const query = `UPDATE reservations SET status = ? WHERE id = ?`;
        db.query(query, [status, id], callback);
    },


    update: (id, reservationData, callback) => {
        const query = 'UPDATE reservations SET status = ? WHERE id = ?';
        db.query(query, [reservationData.status, id], callback);
    },

    delete: (id, callback) => {
        db.query('DELETE FROM reservations WHERE id = ?', [id], callback);
    },

    getByClientId: (client_id, callback) => {
        console.log("🟢 Buscando reservas para el cliente:", client_id); // 👈 Log para debug

        const query = `SELECT * FROM reservations WHERE client_id = ?`;

        console.log("🟢 Consulta SQL generada:", query); // 👈 Log para revisar
        console.log("🟢 Parámetro enviado:", client_id); // 👈 Log para revisar

        db.query(query, [client_id], (err, results) => {
            if (err) {
                console.error("❌ Error en la consulta SQL:", err.message);
            } else {
                console.log("🟢 Resultados encontrados:", results); // 👈 Log para revisar
            }
            callback(err, results);
        });
    }
};

module.exports = Reservation;
