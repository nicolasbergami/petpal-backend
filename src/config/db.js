const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, // ✅ Aquí cambié a DB_NAME en vez de DB_DATABASE
    port: process.env.DB_PORT       // ✅ Asegurarnos de que tome el puerto correctamente
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('🚀 Conectado a la base de datos MySQL');
});

module.exports = connection;

