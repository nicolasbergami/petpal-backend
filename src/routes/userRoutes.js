const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// 🟢 Obtener MI perfil (Usuario logueado) - ¡NUEVA RUTA IMPORTANTE!
router.get('/me', verifyToken, userController.getMe);

// 🟢 Obtener todos (Admin o Debug)
router.get('/', verifyToken, userController.getAllUsers);

// 🟢 Ver perfil público de otro usuario (por ID)
router.get('/:id', verifyToken, userController.getUserById);

// 🟢 Actualizar MI perfil (usa el ID del token)
router.put('/me', verifyToken, userController.updateUser);
// También mantenemos la versión con ID por si acaso, pero la protegemos igual
router.put('/:id', verifyToken, userController.updateUser);

// 🟢 Eliminar usuario (Protegido en el controller)
router.delete('/:id', verifyToken, userController.deleteUser);

module.exports = router;