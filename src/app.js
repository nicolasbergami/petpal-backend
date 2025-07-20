// src/app.js (¡Versión actualizada para iniciar la conexión a la DB!)
const express = require('express');
const dotenv = require('dotenv');
const connectDb = require('./config/db'); // ¡IMPORTA LA FUNCIÓN DE CONEXIÓN!

const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');
const petpalRoutes = require('./routes/petpalRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config(); // Carga las variables de entorno

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ----------------------------------------------------
// ¡CAMBIOS CRÍTICOS AQUÍ!
// ----------------------------------------------------

let dbConnection; // Variable para almacenar la conexión a la DB

// Esta función asíncrona inicia el servidor después de conectar a la DB
const startServer = async () => {
  try {
    console.log("🟡 Intentando conectar a la base de datos...");
    dbConnection = await connectDb(); // Llama a la función que retorna la promesa de conexión

    // Ahora que tenemos la conexión, la pasamos a las rutas/controladores
    // Hay varias formas de hacerlo:
    // 1. Usar app.locals (simple para apps pequeñas/medianas)
    app.locals.db = dbConnection; // La conexión estará disponible en req.app.locals.db en los controladores

    // 2. Pasar la conexión explícitamente a cada ruta si son funciones
    // app.use('/api/users', userRoutes(dbConnection)); // Si userRoutes es una función que acepta dbConnection

    // 3. Crear un middleware para inyectar la conexión en cada request (más complejo, pero robusto)
    // app.use((req, res, next) => {
    //   req.db = dbConnection;
    //   next();
    // });

    // Rutas (ahora que la DB está conectada)
    console.log("🟢 Registrando rutas en app.js...");
    app.use('/api/users', userRoutes);
    console.log("   ➡️  /api/users registrado correctamente");

    app.use('/api/pets', petRoutes);
    console.log("   ➡️  /api/pets registrado correctamente");

    app.use('/api/petpals', petpalRoutes);
    console.log("   ➡️  /api/petpals registrado correctamente");

    app.use('/api/reservations', reservationRoutes);
    console.log("   ➡️  /api/reservations registrado correctamente");

    app.use('/api/auth', authRoutes);
    console.log("   ➡️  /api/auth registrado correctamente");

    // Ruta principal
    app.get('/', (req, res) => {
      res.send('Petpal API funcionando correctamente 🚀');
    });

    // Inicia el servidor solo si la conexión a la DB fue exitosa
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error fatal al iniciar la aplicación: No se pudo conectar a la base de datos o iniciar el servidor.', error);
    process.exit(1); // Sale de la aplicación con un código de error
  }
};

// Llama a la función para iniciar el servidor
startServer();

module.exports = app; // Exporta 'app' para los tests (aunque no tendrá la DB conectada si se importa antes de startServer)

