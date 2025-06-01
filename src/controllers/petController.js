// src/controllers/petController.js
const Pet = require('../models/petModel');

const getAllPets = (req, res) => {
    Pet.getAll((err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener las mascotas' });
        } else {
            res.status(200).json(results);
        }
    });
};

const getPetById = (req, res) => {
    const petId = req.params.id;
    Pet.getById(petId, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener la mascota' });
        } else {
            res.status(200).json(results[0]);
        }
    });
};

const createPet = (req, res) => {
    const newPet = {
        ...req.body,
        user_id: req.user.id
    };


    // Validación rápida opcional
    if (!newPet.name || !newPet.breed || !newPet.age || !newPet.user_id) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    Pet.create(newPet, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al crear la mascota' });
        } else {
            res.status(201).json({ message: 'Mascota creada correctamente', id: results.insertId });
        }
    });
};


const updatePet = (req, res) => {
    const petId = req.params.id;
    const petData = req.body;
    Pet.update(petId, petData, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error al actualizar la mascota' });
        } else {
            res.status(200).json({ message: 'Mascota actualizada correctamente' });
        }
    });
};

const deletePet = (req, res) => {
    const petId = req.params.id;
    Pet.delete(petId, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error al eliminar la mascota' });
        } else {
            res.status(200).json({ message: 'Mascota eliminada correctamente' });
        }
    });
};

const getPetsByUser = (req, res) => {
    const userId = req.user.id;
    console.log("🔎 Buscando mascotas del usuario ID:", userId);

    Pet.getByUserId(userId, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener las mascotas del usuario' });
        }
        res.status(200).json(results);
    });
};






module.exports = {
    getAllPets,
    getPetById,
    createPet,
    updatePet,
    deletePet,
    getPetsByUser

};
