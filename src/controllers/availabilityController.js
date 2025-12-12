const db = require('../config/db');

// 🟢 1. Obtener disponibilidad configurada (Días y horas generales)
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

// 🟢 2. Configurar disponibilidad (Para el panel del PetPal)
const setAvailability = (req, res) => {
    const petpalId = req.user.id;
    const { days } = req.body; // Array de { day_of_week, start_time, end_time }

    // Primero borramos lo viejo
    db.query('DELETE FROM availabilities WHERE petpal_id = ?', [petpalId], (err) => {
        if (err) return res.status(500).json({ message: 'Error limpiando horarios' });

        if (!days || days.length === 0) return res.json({ message: 'Horarios actualizados (vacío)' });

        // Insertamos lo nuevo
        const values = days.map(d => [petpalId, d.day_of_week, d.start_time, d.end_time]);
        const query = 'INSERT INTO availabilities (petpal_id, day_of_week, start_time, end_time) VALUES ?';

        db.query(query, [values], (err2) => {
            if (err2) return res.status(500).json({ message: 'Error guardando horarios' });
            res.json({ message: 'Horarios actualizados correctamente' });
        });
    });
};

// 🟢 3. Obtener Slots (Horarios puntuales) para un día específico
const getSlotsForDate = (req, res) => {
    const { petpalId, date } = req.query; // date format: '2023-10-25'

    if (!petpalId || !date) {
        return res.status(400).json({ error: 'Faltan parámetros (petpalId, date)' });
    }

    // 1. Obtener horario laboral de ese día de la semana (0=Dom, 1=Lun...)
    // OJO: new Date('2023-10-25') puede dar el día anterior por zona horaria. 
    // Mejor usamos una librería o nos aseguramos de la zona. 
    // Para simplificar, asumimos que el frontend manda la fecha local correcta.
    const dayOfWeek = new Date(date + 'T12:00:00').getDay(); 
    
    const querySchedule = `
        SELECT start_time, end_time 
        FROM availabilities 
        WHERE petpal_id = ? AND day_of_week = ?
    `;

    // 2. Obtener reservas YA hechas para ese día (para marcarlas en ROJO)
    const queryReservations = `
        SELECT DATE_FORMAT(date_start, '%H:%i') as busy_start 
        FROM reservations 
        WHERE petpal_id = ? 
        AND status IN ('pending', 'accepted')
        AND DATE(date_start) = ?
    `;

    db.query(querySchedule, [petpalId, dayOfWeek], (err, scheduleRes) => {
        if (err) return res.status(500).json({ error: 'Error DB Schedule' });

        // Si no trabaja ese día
        if (scheduleRes.length === 0) {
            return res.json({ working: false, slots: [] });
        }

        const { start_time, end_time } = scheduleRes[0];

        // Consultamos reservas ocupadas
        db.query(queryReservations, [petpalId, date], (err2, busyRes) => {
            if (err2) return res.status(500).json({ error: 'Error DB Reservations' });

            const busyHours = busyRes.map(r => r.busy_start); // Ej: ['14:00', '15:00']

            // Generar slots de 1 hora
            let slots = [];
            let current = parseInt(start_time.split(':')[0]);
            const end = parseInt(end_time.split(':')[0]);

            while (current < end) {
                const timeStr = `${current.toString().padStart(2, '0')}:00`;
                const isBusy = busyHours.includes(timeStr);
                
                slots.push({
                    time: timeStr,
                    status: isBusy ? 'busy' : 'free'
                });
                current++;
            }

            res.json({ working: true, slots });
        });
    });
};

// 🚨 ¡AQUÍ ESTABA EL PROBLEMA!
// Asegúrate de exportar TODAS las funciones
module.exports = { 
    getAvailability, 
    setAvailability, 
    getSlotsForDate 
};