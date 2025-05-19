// src/controllers/petpalController.js
const Petpal = require('../models/petpalModel');

const getAllPetpals = (req, res) => {
    Petpal.getAll((err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener los perfiles de Petpal' });
        } else {
            res.status(200).json(results);
        }
    });
};

const getPetpalById = (req, res) => {
    const petpalId = req.params.id;
    Petpal.getById(petpalId, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener el perfil de Petpal' });
        } else {
            res.status(200).json(results[0]);
        }
    });
};

const createPetpal = (req, res) => {
    const newPetpal = req.body;
    Petpal.create(newPetpal, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al crear el perfil de Petpal' });
        } else {
            res.status(201).json({ message: 'Perfil de Petpal creado correctamente', id: results.insertId });
        }
    });
};

const updatePetpal = (req, res) => {
    const petpalId = req.params.id;
    const petpalData = req.body;
    Petpal.update(petpalId, petpalData, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error al actualizar el perfil de Petpal' });
        } else {
            res.status(200).json({ message: 'Perfil de Petpal actualizado correctamente' });
        }
    });
};

const deletePetpal = (req, res) => {
    const petpalId = req.params.id;
    Petpal.delete(petpalId, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error al eliminar el perfil de Petpal' });
        } else {
            res.status(200).json({ message: 'Perfil de Petpal eliminado correctamente' });
        }
    });
};

const searchPetpals = (req, res) => {
    const { location, pet_type, pet_weight } = req.body;

    // Definimos el tamaño en base al peso
    let size = 'small';
    if (pet_weight > 8 && pet_weight <= 15) size = 'medium';
    if (pet_weight > 15) size = 'large';

    const filters = {
        location,
        pet_type,
        size
    };

    Petpal.search(filters, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error en la búsqueda de Petpals' });
        } else {
            res.status(200).json(results);
        }
    });
};


module.exports = {
    getAllPetpals,
    getPetpalById,
    createPetpal,
    updatePetpal,
    deletePetpal,
    searchPetpals
};
