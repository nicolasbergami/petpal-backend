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
  const clientId = req.user.id;
  console.log("🟢 Cliente logueado (ID):", clientId);

  const sql = `
    SELECT
      r.id,
      r.petpal_id,
      u_petpal.name   AS petpal_name,
      r.pet_id,
      p.name          AS pet_name,
      u_client.name   AS client_name,
      r.date_start,
      r.status
    FROM reservations r
    JOIN users u_client ON r.client_id = u_client.id
    JOIN users u_petpal ON r.petpal_id = u_petpal.id
    JOIN pets p         ON r.pet_id     = p.id
    WHERE r.client_id = ?
    ORDER BY r.date_start DESC
  `;

  db.query(sql, [clientId], (err, results) => {
    if (err) {
      console.error("❌ Error en la consulta SQL:", err.message);
      return res.status(500).json({ message: 'Error en la consulta de reservas' });
    }

    if (results.length === 0) {
      console.log("🟢 No se encontraron reservas para este cliente.");
      return res.status(404).json({ message: "No se encontraron reservas para este cliente." });
    }

    console.log("🟢 Reservas encontradas:", results);
    res.status(200).json({ message: "Reservas encontradas", data: results });
  });
};

const getReservationsForPetpal = (req, res) => {
  const petpalId = req.user.id;
  console.log("🟢 Petpal logueado (ID):", petpalId);

  const sql = `
    SELECT
      r.id,
      r.client_id,
      u_client.name AS client_name,
      r.pet_id,
      p.name       AS pet_name,
      u_petpal.name AS petpal_name,
      pp.experience AS petpal_experience,
      r.status,
      r.date_start
    FROM reservations r
    JOIN users u_client   ON r.client_id = u_client.id
    JOIN users u_petpal   ON r.petpal_id = u_petpal.id
    JOIN pets p           ON r.pet_id = p.id
    JOIN petpal_profiles pp ON r.petpal_id = pp.user_id
    WHERE r.petpal_id = ?
    ORDER BY r.date_start DESC
  `;

  db.query(sql, [petpalId], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener reservas para petpal:", err.message);
      return res.status(500).json({ message: 'Error al obtener reservas para petpal' });
    }
    if (results.length === 0) {
      console.log("🟢 No hay reservas asignadas a este petpal.");
      return res
        .status(404)
        .json({ message: "No se encontraron reservas para este petpal." });
    }
    console.log("🟢 Reservas para petpal encontradas:", results);
    res.status(200).json({ message: "Reservas encontradas", data: results });
  });
};

const getDetailedReservations = (req, res) => {
  const userId = req.user.id;
  const role   = req.user.role;

  // Filtramos según el rol
  const whereClause = role === 'client'
    ? 'r.client_id = ?'
    : 'r.petpal_id  = ?';

  const sql = `
    SELECT
      r.id,
      r.client_id,
      u_client.name AS client_name,
      r.petpal_id,
      u_petpal.name AS petpal_name,
      r.pet_id,
      p.name AS pet_name,
      pp.experience AS petpal_experience,
      r.status,
      r.date_start
    FROM reservations r
    JOIN users u_client   ON r.client_id = u_client.id
    JOIN users u_petpal   ON r.petpal_id = u_petpal.id
    JOIN pets p           ON r.pet_id = p.id
    JOIN petpal_profiles pp ON r.petpal_id = pp.user_id
    WHERE ${whereClause}
    ORDER BY r.date_start DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener reservas detalladas:', err);
      return res.status(500).json({ message: 'Error al obtener reservas detalladas' });
    }
    res.status(200).json(results);
  });
};




module.exports = {
    getAllReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    updateReservationStatus,
    getReservationsByClient,
    getDetailedReservations,
    getReservationsForPetpal
};
