const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { verifyToken, isPetpal } = require('../middleware/authMiddleware');

console.log("🟢 Cargando rutas de availability...");

// 1️⃣ Ruta Específica (Debe ir primero)
// GET /api/availability/slots?petpalId=1&date=2023-10-25
router.get('/slots', verifyToken, availabilityController.getSlotsForDate);

// 2️⃣ Rutas Generales
// POST /api/availability (Configurar mis horarios - Solo PetPals)
router.post('/', verifyToken, isPetpal, availabilityController.setAvailability);

// 3️⃣ Ruta Dinámica (Debe ir al final para no "robarse" las otras)
// GET /api/availability/:petpalId (Ver configuración general de un paseador)
router.get('/:petpalId', verifyToken, availabilityController.getAvailability);

module.exports = router;