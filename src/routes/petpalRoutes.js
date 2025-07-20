// src/routes/petpalRoutes.js
const express = require('express');
const router = express.Router();
const petpalController = require('../controllers/petpalController');
const { verifyToken } = require('../middleware/authMiddleware');

// Rutas CRUD básicas
router.get('/', verifyToken, petpalController.getAllPetpals);
router.get('/user', verifyToken, petpalController.getPetpalsByUser);

// Rutas de búsqueda — deben ir antes de la genérica `/\:id`
router.post('/search', verifyToken, petpalController.searchPetpals);
router.get('/search/:id', verifyToken, petpalController.searchByPetId);

// Rutas de creación, edición y borrado
router.post('/', verifyToken, petpalController.createPetpal);
router.put('/:id', verifyToken, petpalController.updatePetpal);
router.delete('/:id', verifyToken, petpalController.deletePetpal);

// Finalmente la ruta genérica por ID
router.get('/:id', verifyToken, petpalController.getPetpalById);

module.exports = router;
