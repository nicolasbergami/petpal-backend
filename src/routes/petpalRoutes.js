// src/routes/petpalRoutes.js
const express = require('express');
const router = express.Router();
const petpalController = require('../controllers/petpalController');
const { verifyToken, isPetpal } = require('../middleware/authMiddleware');

// 🟢 Listar todos los anuncios
router.get('/', verifyToken, petpalController.getAllPetpals);

// 🟢 Mis anuncios (para el panel del paseador)
router.get('/my-ads', verifyToken, petpalController.getPetpalsByUser);

// 🟢 Búsqueda Inteligente (Geo + Mascota)
// Ejemplo: GET /petpals/search/match/3?lat=-31.4&lng=-64.1
router.get('/search/match/:id', verifyToken, petpalController.searchByPetId);

// 🟢 Ver detalle de un anuncio
router.get('/:id', verifyToken, petpalController.getPetpalById);

// 🟢 Crear anuncio (Solo Petpals)
router.post('/', verifyToken, isPetpal, petpalController.createPetpal);

// 🟢 Editar anuncio
router.put('/:id', verifyToken, isPetpal, petpalController.updatePetpal);

// 🟢 Eliminar anuncio
router.delete('/:id', verifyToken, isPetpal, petpalController.deletePetpal);

module.exports = router;