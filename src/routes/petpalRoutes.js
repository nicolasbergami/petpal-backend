// src/routes/petpalRoutes.js
const express = require('express');
const router = express.Router();
const petpalController = require('../controllers/petpalController');
const { verifyToken } = require('../middleware/authMiddleware');

// Rutas CRUD

router.get('/', verifyToken, petpalController.getAllPetpals);
router.get('/user', verifyToken, petpalController.getPetpalsByUser);
router.get('/:id', verifyToken, petpalController.getPetpalById);
router.post('/', verifyToken, petpalController.createPetpal);
router.put('/:id', verifyToken, petpalController.updatePetpal);
router.delete('/:id', verifyToken, petpalController.deletePetpal);




// Ruta de búsqueda con filtros
router.post('/search', verifyToken, petpalController.searchPetpals);
router.get('/search/:id', verifyToken, petpalController.searchByPetId);


module.exports = router;
