// src/routes/petRoutes.js
const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { verifyToken } = require('../middleware/authMiddleware');

// 🟢 Obtener TODAS las mascotas (Admin)
router.get('/', verifyToken, petController.getAllPets);

// 🟢 Obtener MIS mascotas (Usuario logueado)
router.get('/user/me', verifyToken, petController.getPetsByUser);

// 🟢 Obtener una mascota por ID
router.get('/:id', verifyToken, petController.getPetById);

// 🟢 Crear mascota
router.post('/', verifyToken, petController.createPet);

// 🟢 Actualizar mascota
router.put('/:id', verifyToken, petController.updatePet);

// 🟢 Eliminar mascota
router.delete('/:id', verifyToken, petController.deletePet);

module.exports = router;