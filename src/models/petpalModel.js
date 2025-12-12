// src/models/petpalModel.js
const db = require('../config/db');

const Petpal = {
    // 🟢 OBTENER TODOS (Para el Home o Admin)
    // Agregamos JOIN para traer nombre y foto del dueño del anuncio
    getAll: (callback) => {
        const query = `
            SELECT p.*, u.name as user_name, u.profile_picture 
            FROM petpal_profiles p
            JOIN users u ON p.user_id = u.id
            WHERE p.status = 'active'
        `;
        db.query(query, callback);
    },

    // 🟢 OBTENER POR ID (Detalle del Anuncio)
    // Traemos también datos de contacto del usuario
    getById: (id, callback) => {
        const query = `
            SELECT p.*, u.name as user_name, u.profile_picture, u.email, u.telefono, u.barrio
            FROM petpal_profiles p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `;
        db.query(query, [id], callback);
    },

    // 🟢 MIS PUBLICACIONES (Perfil del Petpal)
    getByUserId: (userId, callback) => {
        const query = 'SELECT * FROM petpal_profiles WHERE user_id = ? ORDER BY created_at DESC';
        db.query(query, [userId], callback);
    },

    // 🟢 CREAR ANUNCIO (Actualizado con Title y Geo)
    create: (data, callback) => {
        const query = `
            INSERT INTO petpal_profiles 
            (user_id, title, service_type, price_per_hour, price_per_day, experience, location, pet_type, size_accepted, latitude, longitude, range_km, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`;
        
        db.query(query, [
            data.user_id,
            data.title || 'Mi Servicio', // Título por defecto si no viene
            data.service_type,
            data.price_per_hour,
            data.price_per_day,
            data.experience,
            data.location,
            data.pet_type,
            data.size_accepted,
            data.latitude || null,      // Coordenadas opcionales pero recomendadas
            data.longitude || null,
            data.range_km || 5          // Radio por defecto 5km
        ], callback);
    },

    // 🟢 ACTUALIZAR ANUNCIO
    update: (id, data, callback) => {
        const query = `
            UPDATE petpal_profiles 
            SET title = ?, service_type = ?, price_per_hour = ?, price_per_day = ?, experience = ?, 
                location = ?, pet_type = ?, size_accepted = ?, latitude = ?, longitude = ?, range_km = ?
            WHERE id = ?`;
            
        db.query(query, [
            data.title,
            data.service_type,
            data.price_per_hour,
            data.price_per_day,
            data.experience,
            data.location,
            data.pet_type,
            data.size_accepted,
            data.latitude,
            data.longitude,
            data.range_km,
            id
        ], callback);
    },

    delete: (id, callback) => {
        db.query('DELETE FROM petpal_profiles WHERE id = ?', [id], callback);
    },

    // 📍 BÚSQUEDA INTELIGENTE (MATCH > DISTANCIA)
    // Esta función reemplaza a tu antiguo 'search' simple.
    searchGeo: (filters, callback) => {
        const { lat, lng, service_type, pet_type, size, radius_km } = filters;
        
        // Si no hay coordenadas, buscamos solo por texto/filtros (Fallback)
        if (!lat || !lng) {
            let simpleQuery = `
                SELECT p.*, u.name as user_name, u.profile_picture 
                FROM petpal_profiles p
                JOIN users u ON p.user_id = u.id
                WHERE p.status = 'active' 
                AND p.service_type = ? 
                AND p.pet_type = ? 
                AND (p.size_accepted = ? OR p.size_accepted = 'all')
            `;
            return db.query(simpleQuery, [service_type, pet_type, size], callback);
        }

        // Si HAY coordenadas, usamos la fórmula matemática Haversine
        const searchRadius = radius_km || 50; // Buscamos hasta 50km a la redonda

        let query = `
            SELECT 
                p.*, 
                u.name as user_name, 
                u.profile_picture,
                (6371 * acos(
                    cos(radians(?)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(?)) + 
                    sin(radians(?)) * sin(radians(p.latitude))
                )) AS distance
            FROM petpal_profiles p
            JOIN users u ON p.user_id = u.id
            WHERE p.status = 'active'
        `;

        const params = [lat, lng, lat]; 

        // 1️⃣ FILTRO ESTRICTO: Tipo de Servicio (Paseo vs Cuidado)
        if (service_type) {
            query += " AND p.service_type = ?";
            params.push(service_type);
        }

        // 2️⃣ FILTRO ESTRICTO: Especie (Perro vs Gato)
        if (pet_type) {
            query += " AND p.pet_type = ?";
            params.push(pet_type);
        }
        
        // 3️⃣ FILTRO ESTRICTO: Tamaño
        // Muestra solo los que acepten el tamaño de tu perro O acepten 'todos'
        if (size) {
            query += " AND (p.size_accepted = ? OR p.size_accepted = 'all')";
            params.push(size);
        }

        // 4️⃣ ORDENAMIENTO: Por distancia (los más cercanos primero)
        // Usamos HAVING para descartar los que están lejísimos (>50km)
        query += " HAVING distance < ? ORDER BY distance ASC";
        params.push(searchRadius);

        db.query(query, params, callback);
    }
};

module.exports = Petpal;