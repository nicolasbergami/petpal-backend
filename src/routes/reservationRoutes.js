// src/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const reservationController = require('../controllers/reservationController');
const { verifyToken, isClient, isPetpal } = require('../middleware/authMiddleware');

console.log("🟢 Cargando rutas de reservation...");

// ✅ Rutas CRUD protegidas
router.get('/', verifyToken, reservationController.getAllReservations);
router.get('/:id', verifyToken, reservationController.getReservationById);
router.post('/', verifyToken, isClient, reservationController.createReservation);
router.put('/:id', verifyToken, isPetpal, reservationController.updateReservation);
router.delete('/:id', verifyToken, isClient, reservationController.deleteReservation);
router.post('/create', verifyToken, isClient, reservationController.createReservation);
router.put('/:id/status', verifyToken, isPetpal, reservationController.updateReservationStatus);
router.get('/detailed', verifyToken, reservationController.getDetailedReservations);
router.get('/client/:id', verifyToken, isClient, reservationController.getReservationsByClient);
router.get('/petpal/:id', verifyToken, isPetpal, reservationController.getReservationsForPetpal);








module.exports = router;
