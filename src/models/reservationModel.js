// src/models/reservationModel.js
const db = require('../config/db');

const Reservation = {
    // 🔹 ADMIN: Ver todas las reservas (con nombres para entenderlas)
    getAll: (callback) => {
        const query = `
            SELECT r.*, 
                   u_client.name as client_name, 
                   u_petpal.name as petpal_name, 
                   p.name as pet_name
            FROM reservations r
            JOIN users u_client ON r.client_id = u_client.id
            JOIN users u_petpal ON r.petpal_id = u_petpal.id
            JOIN pets p ON r.pet_id = p.id
            ORDER BY r.date_start DESC
        `;
        db.query(query, callback);
    },

    // 🔹 DETALLE: Ver una reserva específica con TODOS los datos (Contacto, Título del servicio, Precio)
    getById: (id, callback) => {
        const query = `
            SELECT r.*, 
                   u_client.name as client_name, u_client.email as client_email, u_client.telefono as client_phone,
                   u_petpal.name as petpal_name, u_petpal.email as petpal_email, u_petpal.telefono as petpal_phone,
                   p.name as pet_name, p.pet_type, p.breed,
                   prof.title as service_title, prof.location as service_location
            FROM reservations r
            JOIN users u_client ON r.client_id = u_client.id
            JOIN users u_petpal ON r.petpal_id = u_petpal.id
            JOIN pets p ON r.pet_id = p.id
            LEFT JOIN petpal_profiles prof ON r.profile_id = prof.id
            WHERE r.id = ?
        `;
        db.query(query, [id], callback);
    },

    // 🔹 CREAR: Ahora incluye profile_id, total_price y payment_status
    create: (data, callback) => {
        const query = `
            INSERT INTO reservations 
            (client_id, petpal_id, profile_id, pet_id, service_type, date_start, date_end, total_price, status, payment_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;

        db.query(query, [
            data.client_id,
            data.petpal_id,
            data.profile_id,  // ID del anuncio específico
            data.pet_id,
            data.service_type,
            data.date_start,
            data.date_end,
            data.total_price, // Precio calculado
            data.status || 'pending'
        ], callback);
    },

    // 🔹 ACTUALIZAR ESTADO (Aceptar/Rechazar/Completar)
    updateStatus: (id, status, callback) => {
        const query = `UPDATE reservations SET status = ? WHERE id = ?`;
        db.query(query, [status, id], callback);
    },

    // 🔹 ACTUALIZAR PAGO (Para futura integración con MercadoPago)
    updatePaymentStatus: (id, status, callback) => {
        const query = `UPDATE reservations SET payment_status = ? WHERE id = ?`;
        db.query(query, [status, id], callback);
    },

    delete: (id, callback) => {
        db.query('DELETE FROM reservations WHERE id = ?', [id], callback);
    },

    // 🔹 HISTORIAL INTELIGENTE (Sirve para Cliente y Petpal)
    // Reemplaza a getByClientId y lo hace dinámico
    getByUser: (userId, role, callback) => {
        console.log(`🟢 Buscando reservas para ${role} ID: ${userId}`);

        // Si es cliente filtro por client_id, si es petpal filtro por petpal_id
        const whereField = role === 'client' ? 'r.client_id' : 'r.petpal_id';

        const query = `
            SELECT 
                r.id, r.date_start, r.date_end, r.status, r.total_price, r.payment_status, r.service_type,
                u_client.name as client_name, u_client.profile_picture as client_foto,
                u_petpal.name as petpal_name, u_petpal.profile_picture as petpal_foto,
                p.name as pet_name,
                prof.title as service_title
            FROM reservations r
            JOIN users u_client ON r.client_id = u_client.id
            JOIN users u_petpal ON r.petpal_id = u_petpal.id
            JOIN pets p ON r.pet_id = p.id
            LEFT JOIN petpal_profiles prof ON r.profile_id = prof.id
            WHERE ${whereField} = ?
            ORDER BY r.date_start DESC
        `;

        db.query(query, [userId], callback);
    }
};

module.exports = Reservation;