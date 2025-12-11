// src/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { verifyToken, isClient, isPetpal } = require('../middleware/authMiddleware');

console.log("🟢 Cargando rutas de reservation...");

// ---------------------------------------------------------
// 🟢 RUTAS PRINCIPALES (RESTful Standard)
// ---------------------------------------------------------

// 1. Obtener MIS reservas (Sirve para Cliente y Petpal automáticamente)
// El controlador detecta el rol y filtra por el ID del token.
router.get('/history', verifyToken, reservationController.getMyReservations);

// 2. Ver detalle de una reserva específica
router.get('/:id', verifyToken, reservationController.getReservationById);

// 3. Crear una nueva reserva (Solo Clientes)
router.post('/', verifyToken, isClient, reservationController.createReservation);

// 4. Aceptar o Rechazar reserva (Solo Petpals)
// Body esperado: { "status": "accepted" } o { "status": "rejected" }
router.put('/:id/status', verifyToken, isPetpal, reservationController.updateReservationStatus);

// 5. Cancelar/Eliminar reserva (Solo si está pendiente)
router.delete('/:id', verifyToken, reservationController.deleteReservation);


// ---------------------------------------------------------
// 🟡 RUTAS LEGACY / COMPATIBILIDAD
// (Mantener si el frontend viejo las llama, pero apuntan a la lógica nueva)
// ---------------------------------------------------------

// Nota: El controlador ignorará el ':id' de la URL y usará el del Token por seguridad.
router.get('/client/:id', verifyToken, isClient, reservationController.getMyReservations);
router.get('/petpal/:id', verifyToken, isPetpal, reservationController.getMyReservations);

// Alias para crear (por si el frontend usa /create)
router.post('/create', verifyToken, isClient, reservationController.createReservation);

// ---------------------------------------------------------
// 🔴 RUTAS ADMIN / DEBUG
// ---------------------------------------------------------

// Ver TODAS las reservas del sistema (Cuidado: esto debería ser solo para admin)
router.get('/admin/all', verifyToken, reservationController.getAllReservations);

module.exports = router;