// jest.setup.js
// Este archivo se ejecutará antes de cada suite de pruebas.
// Carga las variables de entorno desde el archivo .env en la raíz del proyecto.
require('dotenv').config({ path: '.env' });

console.log("Jest Setup: .env cargado para las pruebas.");
console.log(`Jest Setup: DB_USER (from .env): ${process.env.DB_USER || 'NO DEFINIDO'}`);
console.log(`Jest Setup: DB_PASSWORD (from .env): ${process.env.DB_PASSWORD ? 'DEFINIDO' : 'NO DEFINIDO'}`);
console.log(`Jest Setup: DB_DATABASE (from .env): ${process.env.DB_DATABASE || 'NO DEFINIDO'}`);