// src/controllers/reservationController.js

const Reservation = require('../models/reservationModel');

const getAllReservations = (req, res) => {
    Reservation.getAll((err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener las reservas' });
        } else {
            res.status(200).json(results);
        }
    });
};

const getReservationById = (req, res) => {
    const reservationId = req.params.id;
    Reservation.getById(reservationId, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener la reserva' });
        } else {
            res.status(200).json(results[0]);
        }
    });
};


const updateReservation = (req, res) => {
    const reservationId = req.params.id;
    const reservationData = req.body;
    Reservation.update(reservationId, reservationData, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error al actualizar la reserva' });
        } else {
            res.status(200).json({ message: 'Reserva actualizada correctamente' });
        }
    });
};

const deleteReservation = (req, res) => {
    const reservationId = req.params.id;
    Reservation.delete(reservationId, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error al eliminar la reserva' });
        } else {
            res.status(200).json({ message: 'Reserva eliminada correctamente' });
        }
    });
};
const createReservation = (req, res) => {
    const { client_id, petpal_id, pet_id, service_type, date_start, date_end } = req.body;

    const newReservation = {
        client_id,
        petpal_id,
        pet_id,
        service_type,
        date_start,
        date_end,
        status: 'pending'
    };

    Reservation.create(newReservation, (err, results) => {
        if (err) {
            console.log(err.message);
            res.status(500).json({ message: 'Error al crear la reserva' });
        } else {
            res.status(201).json({ message: 'Reserva creada correctamente', id: results.insertId });
        }
    });
};

const updateReservationStatus = (req, res) => {
    const reservationId = req.params.id;
    const { status } = req.body;

    if (status !== 'accepted' && status !== 'rejected') {
        return res.status(400).json({ message: 'Estado no válido' });
    }

    Reservation.updateStatus(reservationId, status, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al actualizar la reserva' });
        } else {
            res.status(200).json({ message: `Reserva ${status} correctamente` });
        }
    });
};
const db = require('../config/db');

const getReservationsByClient = (req, res) => {
    console.log("🟢 Entrando al controlador de reservas del cliente...");

    const clientId = req.user.id;
    console.log("🟢 Cliente logueado (ID):", clientId);

    // 🚀 Probar un SELECT muy simple
    try {
        console.log("🟢 Ejecutando SELECT de prueba...");
        db.query('SELECT 1 + 1 AS solution', (err, results) => {
            if (err) {
                console.error("❌ Error en la consulta de prueba:", err.message);
                res.status(500).json({ message: 'Error en la consulta de prueba' });
            } else {
                console.log("🟢 Resultados del SELECT de prueba:", results);
                res.status(200).json({ message: "Consulta exitosa", data: results });
            }
        });
    } catch (error) {
        console.error("❌ Error crítico en el controlador:", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};



module.exports = {
    getAllReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    updateReservationStatus,
    getReservationsByClient
};
