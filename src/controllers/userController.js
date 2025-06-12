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

const bcrypt = require('bcryptjs');

const updateUser = (req, res) => {
  // 1️⃣ Tomamos el userId directamente del token
  const userId = req.user.id;

  // 2️⃣ Extraemos solo los campos que permitimos actualizar
  const { name, email, password, dni, direccion, barrio, telefono } = req.body;

  // 3️⃣ Validamos que nos esté llegando algo
  if (!name || !email || !dni || !direccion || !barrio || !telefono) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  // 4️⃣ Si enviaron password, lo hasheamos; si no, lo dejamos undefined
  const hashed = password ? bcrypt.hashSync(password, 8) : undefined;

  const userData = {
    name,
    email,
    password: hashed,
    dni,
    direccion,
    barrio,
    telefono
  };

  // 5️⃣ Llamamos al modelo
  User.update(userId, userData, (err) => {
    if (err) {
      console.error('❌ Error al actualizar el usuario:', err.message);
      return res.status(500).json({ message: 'Error al actualizar el usuario' });
    }
    res.status(200).json({ message: 'Usuario actualizado correctamente' });
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
