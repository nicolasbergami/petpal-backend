const Reservation = require('../models/reservationModel');
const Petpal = require('../models/petpalModel');
const db = require('../config/db');

// ... (getMyReservations y getReservationById quedan igual) ...
const getMyReservations = (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;
    Reservation.getByUser(userId, role, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener historial' });
        res.status(200).json({ message: "Historial recuperado", count: results.length, role_detected: role, data: results });
    });
};

const getReservationById = (req, res) => {
    const reservationId = req.params.id;
    Reservation.getById(reservationId, (err, results) => {
        if (err) res.status(500).json({ message: 'Error al obtener la reserva' });
        else if (results.length === 0) res.status(404).json({ message: 'Reserva no encontrada' });
        else res.status(200).json(results[0]);
    });
};

// 🛡️ CREAR RESERVA CON PROTECCIÓN DE OVERBOOKING
const createReservation = (req, res) => {
    const clientId = req.user.id;
    const { petpal_id, profile_id, pet_id, service_type, date_start, date_end } = req.body;

    if (!profile_id || !date_start || !date_end || !pet_id) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const start = new Date(date_start);
    const end = new Date(date_end);

    if (end <= start) {
        return res.status(400).json({ message: 'La hora de fin debe ser posterior al inicio' });
    }

    // 1️⃣ VALIDACIÓN DE CONFLICTOS (La parte nueva)
    // Buscamos si existe alguna reserva (pendiente o aceptada) que se solape con el horario pedido
    const checkQuery = `
        SELECT id FROM reservations 
        WHERE petpal_id = ? 
        AND status IN ('pending', 'accepted') -- ⚠️ Bloqueamos si está pendiente o aceptada
        AND (
            (date_start < ? AND date_end > ?) -- Lógica de superposición de rangos
        )
        LIMIT 1
    `;

    db.query(checkQuery, [petpal_id, date_end, date_start], (errCheck, resultsCheck) => {
        if (errCheck) {
            console.error("Error verificando disponibilidad:", errCheck);
            return res.status(500).json({ message: 'Error al verificar disponibilidad' });
        }

        if (resultsCheck.length > 0) {
            // 🚫 ¡ALERTA! Ya está ocupado
            return res.status(409).json({ message: 'El paseador ya tiene una reserva en ese horario.' });
        }

        // 2️⃣ Si está libre, procedemos con el cálculo de precio y guardado (Lógica original)
        Petpal.getById(profile_id, (err, results) => {
            if (err || results.length === 0) return res.status(404).json({ message: 'Servicio no encontrado' });

            const profile = results[0];
            if (profile.user_id != petpal_id) return res.status(400).json({ message: 'Datos inconsistentes' });

            const diffHours = Math.abs(end - start) / 36e5;
            let totalPrice = 0;
            if (service_type === 'caregiver' && profile.price_per_day) {
                const days = Math.max(1, Math.ceil(diffHours / 24));
                totalPrice = days * profile.price_per_day;
            } else {
                const hours = Math.max(1, Math.ceil(diffHours));
                totalPrice = hours * (profile.price_per_hour || 0);
            }

            const newReservation = {
                client_id: clientId,
                petpal_id,
                profile_id,
                pet_id,
                service_type,
                date_start,
                date_end,
                total_price: totalPrice
            };

            Reservation.create(newReservation, (errCreate, resCreate) => {
                if (errCreate) return res.status(500).json({ message: 'Error al crear la reserva' });
                res.status(201).json({ 
                    message: 'Solicitud enviada', 
                    id: resCreate.insertId, 
                    total_price: totalPrice, 
                    status: 'pending' 
                });
            });
        });
    });
};

// ... (Resto de funciones updateReservationStatus, deleteReservation... igual que antes)
const updateReservationStatus = (req, res) => {
    const reservationId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['accepted', 'rejected', 'completed'].includes(status)) return res.status(400).json({ message: 'Estado inválido' });

    Reservation.getById(reservationId, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Reserva no encontrada' });
        if (results[0].petpal_id !== userId) return res.status(403).json({ message: 'No autorizado' });

        Reservation.updateStatus(reservationId, status, (errUpd) => {
            if (errUpd) return res.status(500).json({ message: 'Error actualizando estado' });
            res.status(200).json({ message: `Reserva ${status}` });
        });
    });
};

const deleteReservation = (req, res) => {
    const reservationId = req.params.id;
    const userId = req.user.id;

    Reservation.getById(reservationId, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'No encontrada' });
        const r = results[0];
        if (r.client_id !== userId && r.petpal_id !== userId) return res.status(403).json({ message: 'No autorizado' });
        if (r.status === 'accepted' && r.client_id === userId) return res.status(400).json({ message: 'No puedes eliminar una reserva aceptada' });

        Reservation.delete(reservationId, (errDel) => {
            if (errDel) return res.status(500).json({ message: 'Error al eliminar' });
            res.status(200).json({ message: 'Eliminada correctamente' });
        });
    });
};

// Exports
const getReservationsByClient = getMyReservations;
const getReservationsForPetpal = getMyReservations;
const getDetailedReservations = getMyReservations;
const getAllReservations = (req, res) => { Reservation.getAll((e,r) => e ? res.status(500).json({m:'Error'}) : res.json(r)) };
const updateReservation = (req, res) => res.status(400).json({m: "Use updateReservationStatus"});

module.exports = {
    getMyReservations,
    getReservationById,
    createReservation,
    updateReservationStatus,
    deleteReservation,
    getAllReservations,
    updateReservation,
    getReservationsByClient,
    getDetailedReservations,
    getReservationsForPetpal
};