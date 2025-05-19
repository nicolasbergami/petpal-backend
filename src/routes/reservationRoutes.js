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

// ✅ Ruta que ignora el ID y usa el del token
router.get('/client/:id', verifyToken, (req, res) => {
    console.log("🟢 Entrando en la ruta GET /client/:id");

    // 🔎 Ignoramos el parámetro ID y tomamos el del token
    const clientId = req.user.id;
    console.log("🟢 ID del cliente logueado desde el token:", clientId);

    const query = `SELECT * FROM reservations WHERE client_id = ?`;
    
    db.query(query, [clientId], (err, results) => {
        if (err) {
            console.error("❌ Error en la consulta SQL:", err.message);
            return res.status(500).json({ message: 'Error en la consulta SQL' });
        }

        console.log("🟢 Resultados obtenidos:", results);

        if (results.length > 0) {
            console.log("🟢 Enviando respuesta con datos...");
            return res.status(200).json({ message: "Reservas encontradas", data: results });
        } else {
            console.log("🟢 No se encontraron reservas para este cliente.");
            return res.status(404).json({ message: "No se encontraron reservas para este cliente." });
        }
    });

    console.log("🔴 Si llegaste aquí, hay un problema.");
});




console.log("🟢 Rutas de reservation cargadas correctamente.");

// ✅ Ruta de prueba
router.get('/client/test', (req, res) => {
    console.log("🟢 GET /api/reservations/client/test - Ruta de prueba funcionando correctamente.");
    res.status(200).json({ message: "Ruta de prueba funcionando correctamente" });
});

console.log("🟢 Rutas de reservation cargadas correctamente.");

module.exports = router;
