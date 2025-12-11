// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 🟢 Registro (Ahora guarda lat/lng si se envían)
router.post('/register', authController.register);

// 🟢 Login (Devuelve token y datos del usuario)
router.post('/login', authController.login);

module.exports = router;