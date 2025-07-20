// src/config/db.js (¡Debe ser así!)
const mysql = require('mysql2/promise'); // ¡IMPORTANTE: Usar la versión de promesas!
require('dotenv').config();

const createDbConnection = async () => {
  try {
    const connection = process.env.DATABASE_URL
      ? await mysql.createConnection(process.env.DATABASE_URL)
      : await mysql.createConnection({
          host:     process.env.DB_HOST,
          user:     process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          port:     parseInt(process.env.DB_PORT, 10) // Asegúrate de parsear el puerto
        });

    console.log('🚀 Conectado a la base de datos MySQL');
    return connection; // Retorna la conexión exitosa
  } catch (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    throw err; // Lanza el error para que sea capturado por startServer en app.js
  }
};

module.exports = createDbConnection; // Exporta la FUNCIÓN