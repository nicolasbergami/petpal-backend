const db = require('../config/db');

// Obtener disponibilidad de un PetPal
const getAvailability = (req, res) => {
    const petpalId = req.params.petpalId;

    const query = `
        SELECT day_of_week, 
               DATE_FORMAT(start_time, '%H:%i') as start_time, 
               DATE_FORMAT(end_time, '%H:%i') as end_time
        FROM availabilities 
        WHERE petpal_id = ? 
        ORDER BY day_of_week ASC
    `;

    db.query(query, [petpalId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener horarios' });
        }
        res.json(results);
    });
};

// Configurar disponibilidad (Para el futuro, cuando hagas la pantalla del paseador)
const setAvailability = (req, res) => {
    const petpalId = req.user.id;
    const { days } = req.body; // Array de { day_of_week, start_time, end_time }

    // 1. Borramos horarios viejos
    db.query('DELETE FROM availabilities WHERE petpal_id = ?', [petpalId], (err) => {
        if (err) return res.status(500).json({ message: 'Error limpiando horarios' });

        if (!days || days.length === 0) return res.json({ message: 'Horarios actualizados' });

        // 2. Insertamos nuevos
        const values = days.map(d => [petpalId, d.day_of_week, d.start_time, d.end_time]);
        const query = 'INSERT INTO availabilities (petpal_id, day_of_week, start_time, end_time) VALUES ?';

        db.query(query, [values], (err2) => {
            if (err2) return res.status(500).json({ message: 'Error guardando horarios' });
            res.json({ message: 'Horarios actualizados correctamente' });
        });
    });
};

module.exports = { getAvailability, setAvailability };