// src/routes/petpalRoutes.js
const express = require('express');
const router = express.Router();
const petpalController = require('../controllers/petpalController');
const { verifyToken } = require('../middleware/authMiddleware');

// 1) Rutas CRUD básicas
router.get(   '/',      verifyToken, petpalController.getAllPetpals);
router.get(   '/user',  verifyToken, petpalController.getPetpalsByUser);

// 2) Rutas de búsqueda — ¡IMPORTANTE! deben ir antes de `/\:id`
router.post(  '/search',      verifyToken, petpalController.searchPetpals);
router.get(   '/search/:id',  verifyToken, petpalController.searchByPetId);

// 3) Rutas de creación, edición y borrado
router.post(  '/',         verifyToken, petpalController.createPetpal);
router.put(   '/:id',      verifyToken, petpalController.updatePetpal);
router.delete('/:id',      verifyToken, petpalController.deletePetpal);

// 4) Finalmente la ruta genérica por ID
router.get(   '/:id',      verifyToken, petpalController.getPetpalById);

module.exports = router;

