const db = require('../config/db');

// 🟢 Obtener Slots (Horarios) para un día específico
const getSlotsForDate = (req, res) => {
    const { petpalId, date } = req.query; // date format: '2023-10-25'

    // 1. Obtener horario laboral de ese día de la semana (0=Dom, 1=Lun...)
    const dayOfWeek = new Date(date).getDay();
    
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
        if (err) return res.status(500).json({ error: 'Error DB' });

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
                    status: isBusy ? 'busy' : 'free' // 🔴 busy = ROJO, 🟢 free = VERDE
                });
                current++;
            }

            res.json({ working: true, slots });
        });
    });
};

module.exports = { getSlotsForDate };