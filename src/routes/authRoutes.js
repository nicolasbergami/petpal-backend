// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas
router.post('/register', (req, res) => {
    console.log("POST /register recibido"); // 👈 Log para verificar
    authController.register(req, res);
});

router.post('/login', (req, res) => {
    console.log("POST /login recibido"); // 👈 Log para verificar
    authController.login(req, res);
});

module.exports = router;
