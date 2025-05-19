// testReservations.js
const db = require('./src/config/db');

db.query('SELECT * FROM reservations WHERE client_id = ?', [1], (err, results) => {
    if (err) {
        console.error("❌ Error en la consulta directa:", err.message);
    } else {
        console.log("🟢 Resultados obtenidos en test directo:", results);
    }
    process.exit(); // Salir del proceso
});
