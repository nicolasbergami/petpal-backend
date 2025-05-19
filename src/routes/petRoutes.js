// src/routes/petRoutes.js
const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { verifyToken, isClient } = require('../middleware/authMiddleware');

// Rutas CRUD protegidas
router.get('/', verifyToken, petController.getAllPets);
router.get('/:id', verifyToken, petController.getPetById);
router.post('/', verifyToken, isClient, petController.createPet); // 👈 Aquí está el error
router.put('/:id', verifyToken, isClient, petController.updatePet);
router.delete('/:id', verifyToken, isClient, petController.deletePet);

module.exports = router;
