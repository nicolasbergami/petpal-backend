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
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Mascota no encontrada' });
        } else {
            res.status(200).json(results[0]);
        }
    });
};

const createPet = (req, res) => {
    const userId = req.user.id; // Viene del token

    const newPet = {
        ...req.body,
        user_id: userId
    };

    // Validaciones
    if (newPet.name || !newPet.pet_type) {
        return res.status(400).json({ message: 'Nombre y tipo de mascota son obligatorios' });
    }
    if (!['dog', 'cat'].includes(newPet.pet_type)) {
        return res.status(400).json({ message: 'El tipo de mascota debe ser dog o cat' });
    }

    Pet.create(newPet, (err, results) => {
        if (err) {
            console.error("Error creando mascota:", err);
            res.status(500).json({ message: 'Error al crear la mascota' });
        } else {
            res.status(201).json({ 
                message: 'Mascota creada correctamente', 
                id: results.insertId,
                ...newPet // Devolvemos los datos para que el front actualice la lista sin recargar
            });
        }
    });
};

const updatePet = (req, res) => {
    const petId = req.params.id;
    const userId = req.user.id;
    const petData = req.body;

    // 🔒 PASO 1: Verificar propiedad antes de editar
    Pet.getById(petId, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error interno' });
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Mascota no encontrada' });
        }

        // Si el usuario del token NO es el dueño de la mascota
        if (results[0].user_id !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para editar esta mascota' });
        }

        // 🔒 PASO 2: Si es el dueño, procedemos a actualizar
        Pet.update(petId, petData, (errUpdate) => {
            if (errUpdate) {
                res.status(500).json({ message: 'Error al actualizar la mascota' });
            } else {
                res.status(200).json({ message: 'Mascota actualizada correctamente' });
            }
        });
    });
};

const deletePet = (req, res) => {
    const petId = req.params.id;
    const userId = req.user.id;

    // Usamos el delete seguro del modelo que pide user_id
    Pet.delete(petId, userId, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al eliminar la mascota' });
        } else if (results.affectedRows === 0) {
            // Si affectedRows es 0, significa que no existía O no era el dueño
            res.status(404).json({ message: 'Mascota no encontrada o no tienes permisos para eliminarla' });
        } else {
            res.status(200).json({ message: 'Mascota eliminada correctamente' });
        }
    });
};

const getPetsByUser = (req, res) => {
    const userId = req.user.id;
    
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