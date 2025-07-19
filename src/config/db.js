const mysql = require('mysql2');
require('iconv-lite').encodingExists('cesu8'); // ✅ Fix para CI/CD
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, // ✅ Unificado para usar el nombre correcto
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('🚀 Conectado a la base de datos MySQL');
});

module.exports = connection;
