// testSelect.jssssss
const db = require('./src/config/db');

db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
        console.error("❌ Error en el test directo:", err.message);
    } else {
        console.log("🟢 Test directo MySQL OK. Resultado:", results);
    }
    process.exit(); // Salir del proceso
});
