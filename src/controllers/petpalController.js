// src/controllers/petpalController.js
const Petpal = require('../models/petpalModel');
const db = require('../config/db'); // Necesario para consultar datos auxiliares (pets/users)

// ✅ Obtener todos los anuncios (para admin o listados generales)
const getAllPetpals = (req, res) => {
    Petpal.getAll((err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener los perfiles de Petpal' });
        } else {
            res.status(200).json(results);
        }
    });
};

// ✅ Obtener un anuncio específico por ID
const getPetpalById = (req, res) => {
    const petpalId = req.params.id;
    Petpal.getById(petpalId, (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error al obtener el perfil de Petpal' });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Anuncio no encontrado' });
        } else {
            res.status(200).json(results[0]);
        }
    });
};

// ✅ Obtener todos los anuncios de un usuario específico (Mis Anuncios)
const getPetpalsByUser = (req, res) => {
    const userId = req.user.id; // ID del token

    Petpal.getByUserId(userId, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener tus anuncios' });
        }
        res.status(200).json(results);
    });
};

// ✅ CREAR ANUNCIO (Actualizado para Múltiples Anuncios + Geo)
const createPetpal = (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    // 🔒 Seguridad: Solo usuarios con rol 'petpal' pueden publicar
    if (userRole !== 'petpal') {
        return res.status(403).json({ message: 'Acceso denegado: Solo los Petpals pueden crear anuncios' });
    }

    const {
        title,
        service_type,
        price_per_hour,
        price_per_day,
        experience,
        location,
        latitude,  // 📍 Nuevo: Coordenadas
        longitude, // 📍 Nuevo: Coordenadas
        range_km,
        pet_type,
        size_accepted
    } = req.body;

    // Validación de campos obligatorios
    if (!title || !service_type || !experience || !location || !latitude || !longitude) {
        return res.status(400).json({ message: 'Faltan campos obligatorios (Título, Ubicación o Coordenadas)' });
    }

    const newPetpal = {
        user_id: userId,
        title,
        service_type,
        price_per_hour,
        price_per_day,
        experience,
        location,
        latitude,
        longitude,
        range_km: range_km || 5, // Default 5km
        pet_type,
        size_accepted
    };

    Petpal.create(newPetpal, (err, results) => {
        if (err) {
            console.error("❌ Error al crear anuncio:", err.message);
            res.status(500).json({ message: 'Error interno al crear el anuncio' });
        } else {
            res.status(201).json({ 
                message: 'Anuncio publicado correctamente', 
                id: results.insertId 
            });
        }
    });
};

// ✅ Actualizar anuncio
const updatePetpal = (req, res) => {
    const petpalId = req.params.id;
    const petpalData = req.body;
    
    // Aquí podrías agregar una validación extra para asegurar que el anuncio pertenece al usuario req.user.id
    
    Petpal.update(petpalId, petpalData, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error al actualizar el perfil de Petpal' });
        } else {
            res.status(200).json({ message: 'Perfil de Petpal actualizado correctamente' });
        }
    });
};

// ✅ Eliminar anuncio
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

// ❌ (DEPRECATED) Búsqueda simple antigua
// La mantenemos por compatibilidad, pero redirige a searchByPetId preferiblemente
const searchPetpals = (req, res) => {
    res.status(400).json({ message: "Por favor utiliza el endpoint avanzado de búsqueda." });
};

// ✅ BÚSQUEDA INTELIGENTE (Geo + Match de Mascota)
const searchByPetId = (req, res) => {
    const petId = req.params.id;
    const userId = req.user.id;
    
    // Recibimos lat/lng del frontend (ubicación actual del cel) o usamos las del perfil
    let { lat, lng, service_type } = req.query;

    console.log(`🔍 Buscando match para Mascota ID: ${petId}`);

    // 1. Obtener datos de la mascota (Peso y Tipo)
    const queryPet = 'SELECT pet_type, weight FROM pets WHERE id = ? AND user_id = ?';
    
    db.query(queryPet, [petId, userId], (err, petResults) => {
        if (err) {
            console.error("❌ Error DB:", err);
            return res.status(500).json({ message: 'Error al consultar la mascota' });
        }
        
        if (petResults.length === 0) {
            return res.status(404).json({ message: 'Mascota no encontrada o no te pertenece' });
        }

        const { pet_type, weight } = petResults[0];

        // 2. Calcular tamaño basado en peso
        let size = 'small';
        if (weight > 8 && weight <= 25) size = 'medium';
        if (weight > 25) size = 'large';

        console.log(`ℹ️ Mascota: ${pet_type} (${size})`);

        // 3. Definir coordenadas de búsqueda
        if (!lat || !lng) {
            // Si no envían coordenadas, buscamos las del domicilio del usuario
            const queryUser = 'SELECT latitude, longitude FROM users WHERE id = ?';
            db.query(queryUser, [userId], (errU, userRes) => {
                if (errU || !userRes[0].latitude) {
                    return res.status(400).json({ message: 'No se detectó ubicación. Por favor envía lat/lng o actualiza tu perfil.' });
                }
                // Ejecutamos búsqueda con las coordenadas de la BD
                executeGeoSearch(userRes[0].latitude, userRes[0].longitude, pet_type, size, service_type, res);
            });
        } else {
            // Ejecutamos búsqueda con las coordenadas del Query Param
            executeGeoSearch(lat, lng, pet_type, size, service_type, res);
        }
    });
};

// Función auxiliar para llamar al modelo
function executeGeoSearch(lat, lng, pet_type, size, service_type, res) {
    const filters = {
        lat,
        lng,
        pet_type,
        size,
        service_type,
        radius_km: 15 // Buscar en un radio de 15km
    };

    Petpal.searchGeo(filters, (err, results) => {
        if (err) {
            console.error("❌ Error en búsqueda Geo:", err);
            return res.status(500).json({ message: 'Error buscando cuidadores cercanos' });
        }
        res.status(200).json({ 
            message: "Resultados encontrados", 
            count: results.length,
            data: results 
        });
    });
}

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