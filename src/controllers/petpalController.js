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

const getPetpalsByUser = (req, res) => {
    const userId = req.user.id;

    Petpal.getByUserId(userId, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener los perfiles de Petpal del usuario' });
        }
        res.status(200).json(results);
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

    console.log("🔍 Buscando mascota ID:", petId, "para el usuario:", userId);

    // Verificamos propiedad de la mascota
    const query = 'SELECT pet_type, weight FROM pets WHERE id = ? AND user_id = ?';
    db.query(query, [petId, userId], (err, petResults) => {
        if (err) {
            console.error("❌ Error en la consulta de mascota:", err.message);
            return res.status(500).json({ message: 'Error consultando la mascota' });
        }
        console.log("ℹ️ Resultados de mascota:", petResults);

        if (petResults.length === 0) {
            console.log("⚠️ Mascota no encontrada o no pertenece al usuario");
            return res.status(404).json({ message: 'Mascota no encontrada o no pertenece al usuario' });
        }

        const { pet_type, weight: pet_weight } = petResults[0];
        console.log("ℹ️ Tipo y peso de la mascota:", pet_type, pet_weight);

        // Calcular tamaño
        let size = 'small';
        if (pet_weight > 8 && pet_weight <= 15) size = 'medium';
        if (pet_weight > 15) size = 'large';
        console.log("ℹ️ Tamaño calculado:", size);

        // Construir query dinámico para location opcional
        let matchQuery = `
      SELECT * FROM petpal_profiles
      WHERE service_type = ?
        AND pet_type = ?
        AND (size_accepted = ? OR size_accepted = 'all')
    `;
        const params = [service_type, pet_type, size];
        if (location && location.trim() !== '') {
            matchQuery += ' AND location = ?';
            params.push(location);
        }
        console.log('🔍 Ejecutando matchQuery:', matchQuery, 'con params', params);

        // Ejecutar búsqueda
        db.query(matchQuery, params, (err2, results) => {
            if (err2) {
                console.error("❌ Error en la búsqueda de Petpals:", err2.message);
                return res.status(500).json({ message: 'Error en la búsqueda de Petpals' });
            }
            console.log("✅ Coincidencias encontradas:", results.length);
            console.table(results);
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
    getPetpalsByUser,
    searchByPetId
};
