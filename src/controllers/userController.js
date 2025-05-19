// src/controllers/userController.js
const User = require('../models/userModel');

const getAllUsers = (req, res) => {
    User.getAll((err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener los usuarios' });
        } else {
            // Eliminamos las contraseñas del resultado antes de enviar
            const users = results.map(user => {
                delete user.password;
                return user;
            });
            res.status(200).json(users);
        }
    });
};

const getUserById = (req, res) => {
    const userId = req.params.id;
    User.getById(userId, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener el usuario' });
        } else {
            const user = results[0];
            delete user.password;
            res.status(200).json(user);
        }
    });
};

const createUser = (req, res) => {
    const newUser = req.body;
    User.create(newUser, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al crear el usuario' });
        } else {
            res.status(201).json({ message: 'Usuario creado correctamente', id: results.insertId });
        }
    });
};

const updateUser = (req, res) => {
    const userId = req.params.id;
    const userData = req.body;
    User.update(userId, userData, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error al actualizar el usuario' });
        } else {
            res.status(200).json({ message: 'Usuario actualizado correctamente' });
        }
    });
};

const deleteUser = (req, res) => {
    const userId = req.params.id;
    User.delete(userId, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error al eliminar el usuario' });
        } else {
            res.status(200).json({ message: 'Usuario eliminado correctamente' });
        }
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
