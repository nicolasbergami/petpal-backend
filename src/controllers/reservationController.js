// src/controllers/reservationController.js
const Reservation = require('../models/reservationModel');
const Petpal = require('../models/petpalModel'); // Necesario para consultar precios
const db = require('../config/db'); 

// ✅ OBTENER MIS RESERVAS (Automático según rol)
const getMyReservations = (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    Reservation.getByUser(userId, role, (err, results) => {
        if (err) {
            console.error("Error obteniendo reservas:", err);
            return res.status(500).json({ message: 'Error al obtener historial' });
        }
        res.status(200).json({ 
            message: "Historial recuperado", 
            count: results.length,
            role_detected: role,
            data: results 
        });
    });
};

const getReservationById = (req, res) => {
    const reservationId = req.params.id;
    Reservation.getById(reservationId, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener la reserva' });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Reserva no encontrada' });
        } else {
            res.status(200).json(results[0]);
        }
    });
};

// 💰 CREAR RESERVA CON CÁLCULO DE PRECIO AUTOMÁTICO
const createReservation = (req, res) => {
    const clientId = req.user.id;
    const { 
        petpal_id,    
        profile_id,   // ID del ANUNCIO específico (clave para el precio)
        pet_id, 
        service_type, 
        date_start, 
        date_end 
    } = req.body;

    // 1. Validaciones básicas
    if (!profile_id || !date_start || !date_end || !pet_id) {
        return res.status(400).json({ message: 'Faltan datos (Profile ID, Fechas o Mascota)' });
    }

    const start = new Date(date_start);
    const end = new Date(date_end);

    if (end <= start) {
        return res.status(400).json({ message: 'La fecha de fin debe ser posterior a la de inicio' });
    }

    // 2. Consultar el Anuncio para saber el PRECIO actual
    Petpal.getById(profile_id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'El servicio seleccionado no existe' });
        }

        const profile = results[0];
        
        // Verificar que el anuncio pertenezca al petpal indicado
        if (profile.user_id != petpal_id) {
            return res.status(400).json({ message: 'El anuncio no coincide con el cuidador' });
        }

        // 3. Calcular Precio Total
        // Diferencia en horas
        const diffHours = Math.abs(end - start) / 36e5; 
        
        let totalPrice = 0;
        
        // Si es cuidador y cobra por día
        if (service_type === 'caregiver' && profile.price_per_day) {
            const days = Math.max(1, Math.ceil(diffHours / 24)); 
            totalPrice = days * profile.price_per_day;
        } else {
            // Por defecto hora (dog walker)
            const hours = Math.max(1, Math.ceil(diffHours)); // Mínimo 1 hora
            totalPrice = hours * (profile.price_per_hour || 0);
        }

        console.log(`💰 Calculando precio: ${diffHours.toFixed(2)} horas -> Total: $${totalPrice}`);

        // 4. Crear objeto de reserva
        const newReservation = {
            client_id: clientId,
            petpal_id,
            profile_id,
            pet_id,
            service_type,
            date_start,
            date_end,
            total_price: totalPrice // Guardamos el precio pactado
        };

        // 5. Guardar en BD
        Reservation.create(newReservation, (errCreate, resCreate) => {
            if (errCreate) {
                console.error("Error creando reserva:", errCreate);
                return res.status(500).json({ message: 'Error al procesar la reserva' });
            }
            res.status(201).json({ 
                message: 'Solicitud de reserva enviada', 
                id: resCreate.insertId,
                total_price: totalPrice,
                status: 'pending'
            });
        });
    });
};

// ✅ ACEPTAR / RECHAZAR RESERVA (Solo Petpal)
const updateReservationStatus = (req, res) => {
    const reservationId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id; // El usuario que intenta aceptar/rechazar

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Estado no válido' });
    }

    // Primero verificamos que la reserva le pertenezca al Petpal
    Reservation.getById(reservationId, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Reserva no encontrada' });

        const reserva = results[0];

        // Seguridad: Solo el Petpal asignado puede aceptar/rechazar
        if (reserva.petpal_id !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para gestionar esta reserva' });
        }

        Reservation.updateStatus(reservationId, status, (errUpd) => {
            if (errUpd) return res.status(500).json({ message: 'Error al actualizar estado' });
            
            res.status(200).json({ message: `Reserva marcada como: ${status}` });
        });
    });
};

// ✅ ELIMINAR RESERVA (Solo si está pendiente)
const deleteReservation = (req, res) => {
    const reservationId = req.params.id;
    const userId = req.user.id;

    Reservation.getById(reservationId, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Reserva no encontrada' });
        
        const reserva = results[0];

        // Solo el dueño (cliente) o el petpal pueden borrar
        if (reserva.client_id !== userId && reserva.petpal_id !== userId) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Regla: No borrar si ya está aceptada (deberían cancelar, no borrar)
        if (reserva.status === 'accepted' && reserva.client_id === userId) {
             return res.status(400).json({ message: 'No puedes eliminar una reserva aceptada. Contacta soporte.' });
        }

        Reservation.delete(reservationId, (errDel) => {
            if (errDel) return res.status(500).json({ message: 'Error al eliminar' });
            res.status(200).json({ message: 'Reserva eliminada correctamente' });
        });
    });
};

// Rutas deprecadas que mantenemos por compatibilidad (pero apuntan al nuevo getMyReservations)
const getReservationsByClient = getMyReservations;
const getReservationsForPetpal = getMyReservations;
const getDetailedReservations = getMyReservations;
const getAllReservations = (req, res) => {
    // Solo admins deberían ver esto, pero lo dejamos por ahora
    Reservation.getAll((err, results) => {
        if (err) return res.status(500).json({message: 'Error'});
        res.json(results);
    });
};
const updateReservation = (req, res) => { res.status(400).json({message: "Use updateReservationStatus"}); };


module.exports = {
    getMyReservations, // <--- ¡ESTA ES LA QUE FALTABA!
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