const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { verifyToken, isPetpal } = require('../middleware/authMiddleware');

// Público: Ver horarios de un paseador
router.get('/:petpalId', verifyToken, availabilityController.getAvailability);

// Privado: Paseador configura sus horarios
router.post('/', verifyToken, isPetpal, availabilityController.setAvailability);

router.get('/slots', verifyToken, availabilityController.getSlotsForDate);

module.exports = router;