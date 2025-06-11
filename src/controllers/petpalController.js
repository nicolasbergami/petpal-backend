// src/controllers/petpalController.js
const Petpal = require('../models/petpalModel');
const db = require('../config/db');


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
    const userId = req.user.id; // ✅ Viene del token

    const {
        service_type,
        price_per_hour,
        price_per_day,
        experience,
        location,
        pet_type,
        size_accepted
    } = req.body;

    // Validación básica
    if (!service_type || !experience || !location || !pet_type || !size_accepted) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para crear el perfil' });
    }

    const newPetpal = {
        user_id: userId,
        service_type,
        price_per_hour,
        price_per_day,
        experience,
        location,
        pet_type,
        size_accepted
    };

    Petpal.create(newPetpal, (err, results) => {
        if (err) {
            console.error("❌ Error al crear el perfil de Petpal:", err.message);
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

const searchByPetId = (req, res) => {
    const petId = req.params.id;
    const userId = req.user.id;
    const { location, service_type } = req.query;

    console.log("🔍 Buscando mascota ID:", petId, "para el usuario:", req.user.id);

    // 🔒 Verificamos que la mascota le pertenezca al usuario
    const query = `SELECT pet_type, weight FROM pets WHERE id = ? AND user_id = ?`;
    db.query(query, [petId, req.user.id], (err, results) => {
        if (err) {
            console.error("❌ Error en la consulta de mascota:", err.message);
            return res.status(500).json({ message: 'Error consultando la mascota' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Mascota no encontrada o no pertenece al usuario' });
        }

        const { pet_type, weight: pet_weight } = results[0];

        let size = 'small';
        if (pet_weight > 8 && pet_weight <= 15) size = 'medium';
        if (pet_weight > 15) size = 'large';

        const matchQuery = `
            SELECT * FROM petpal_profiles
            WHERE location = ?
            AND service_type = ?
            AND pet_type = ?
            AND (size_accepted = ? OR size_accepted = 'all')
        `;

        db.query(matchQuery, [location, service_type, pet_type, size], (err, results) => {
            if (err) {
                console.error("❌ Error en la búsqueda de Petpals:", err.message);
                return res.status(500).json({ message: 'Error en la búsqueda de Petpals' });
            }

            return res.status(200).json({ message: "Resultados encontrados", data: results });
        });
    });
};



module.exports = {
    getAllPetpals,
    getPetpalById,
    createPetpal,
    updatePetpal,
    deletePetpal,
    searchPetpals,
    searchByPetId
};
