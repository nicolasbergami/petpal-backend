// src/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

let connection;
if (process.env.DATABASE_URL) {
  // Conexion directa usando URL (incluye usuario, password, host, puerto y database)
  connection = mysql.createConnection(process.env.DATABASE_URL);
} else {
  // modo local o Azure DevOps con variables sueltas
  connection = mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port:     process.env.DB_PORT
  });
}

connection.connect(err => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    return;
  }
  console.log('🚀 Conectado a la base de datos MySQL');
});

module.exports = connection;
