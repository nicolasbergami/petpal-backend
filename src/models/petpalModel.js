// src/models/petpalModel.js
const db = require('../config/db');

const Petpal = {
    // ✅ Trae todos los anuncios ACTIVOS + Datos del Usuario (Nombre/Foto)
    getAll: (callback) => {
        const query = `
            SELECT p.*, u.name as user_name, u.profile_picture 
            FROM petpal_profiles p
            JOIN users u ON p.user_id = u.id
            WHERE p.status = 'active'
        `;
        db.query(query, callback);
    },

    // ✅ Trae el detalle de un anuncio específico + Datos de contacto del Usuario
    getById: (id, callback) => {
        const query = `
            SELECT p.*, u.name as user_name, u.profile_picture, u.email, u.telefono, u.barrio
            FROM petpal_profiles p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `;
        db.query(query, [id], callback);
    },

    // ✅ Trae todos los anuncios de un usuario específico (Mis Publicaciones)
    getByUserId: (userId, callback) => {
        const query = 'SELECT * FROM petpal_profiles WHERE user_id = ? ORDER BY created_at DESC';
        db.query(query, [userId], callback);
    },

    // ✅ CREAR: Ahora soporta Title, Lat, Lng y Range
    create: (data, callback) => {
        const query = `
            INSERT INTO petpal_profiles 
            (user_id, title, service_type, price_per_hour, price_per_day, experience, location, pet_type, size_accepted, latitude, longitude, range_km, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`;
        
        db.query(query, [
            data.user_id,
            data.title,         // Nuevo
            data.service_type,
            data.price_per_hour,
            data.price_per_day,
            data.experience,
            data.location,
            data.pet_type,
            data.size_accepted,
            data.latitude,      // Nuevo (Coordenadas)
            data.longitude,     // Nuevo (Coordenadas)
            data.range_km       // Nuevo (Radio de cobertura)
        ], callback);
    },

    // ✅ ACTUALIZAR: Soporta todos los campos nuevos
    update: (id, data, callback) => {
        // Construimos la query dinámica para solo actualizar lo que llegue
        const query = `
            UPDATE petpal_profiles 
            SET title = ?, service_type = ?, price_per_hour = ?, price_per_day = ?, experience = ?, 
                location = ?, pet_type = ?, size_accepted = ?, latitude = ?, longitude = ?, range_km = ?, status = ?
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
            data.status, // Permite pausar el anuncio ('paused')
            id
        ], callback);
    },

    delete: (id, callback) => {
        db.query('DELETE FROM petpal_profiles WHERE id = ?', [id], callback);
    },

    // 📍 BÚSQUEDA GEOLOCALIZADA (La Joya de la Corona 👑)
    // Reemplaza al search antiguo. Usa matemáticas para buscar por radio.
    searchGeo: (filters, callback) => {
        const { lat, lng, service_type, pet_type, size, radius_km } = filters;
        
        // Radio por defecto 10km si no se especifica
        const searchRadius = radius_km || 10; 

        /* EXPLICACIÓN DE LA FÓRMULA SQL (Haversine):
           Calcula la distancia entre el punto A (Cliente) y el punto B (Paseador)
           usando la curvatura de la Tierra.
           6371 es el radio de la Tierra en KM.
        */
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

        // Parámetros iniciales para la fórmula matemática (Lat Cliente, Lng Cliente, Lat Cliente)
        const params = [lat, lng, lat]; 

        // Filtros opcionales
        if (service_type) {
            query += " AND p.service_type = ?";
            params.push(service_type);
        }
        if (pet_type) {
            query += " AND p.pet_type = ?";
            params.push(pet_type);
        }
        
        // Lógica de tamaño: Coincidencia exacta O si el paseador acepta "todos"
        if (size) {
            query += " AND (p.size_accepted = ? OR p.size_accepted = 'all')";
            params.push(size);
        }

        // Filtro final: Que la distancia sea menor al radio y ordenamos por cercanía
        query += " HAVING distance < ? ORDER BY distance ASC";
        params.push(searchRadius);

        db.query(query, params, callback);
    }
};

module.exports = Petpal;