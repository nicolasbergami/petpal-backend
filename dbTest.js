// dbTest.js
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('✅ Conectado correctamente a la base de datos');
    
    // Probar una consulta
    connection.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('❌ Error en la consulta:', err.message);
        } else {
            console.log('🗄️ Tablas encontradas:', results);
        }
        connection.end();
    });
});
