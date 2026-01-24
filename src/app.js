// src/app.js
const express = require('express');
const cors = require('cors'); // <--- 1. IMPORTAR CORS
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');
const petpalRoutes = require('./routes/petpalRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const authRoutes = require('./routes/authRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');

dotenv.config();
const app = express();
// El puerto se define mejor en index.js, aquí solo definimos la app
// const PORT = process.env.PORT || 3000; 

// --- 2. CONFIGURACIÓN DE CORS (Lo nuevo) ---
const whitelist = [
  'http://localhost:8081', // Expo local
  'http://localhost:19006', // Expo Web local
  'https://petpal-frontend.vercel.app', // PRODUCCIÓN
  'https://petpal-frontend-git-develop.vercel.app' // QA (Rama Develop)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origen (como Postman o Apps móbiles nativas)
    // O requests que vengan de la whitelist
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Bloqueado por CORS:", origin); // Log para debug
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions)); // <--- ACTIVAR CORS
// ------------------------------------------

app.use(express.json());

// Rutas
console.log("🟢 Registrando rutas en app.js...");
app.use('/api/users', userRoutes);
console.log("   ➡️  /api/users registrado correctamente");

app.use('/api/pets', petRoutes);
console.log("   ➡️  /api/pets registrado correctamente");

app.use('/api/petpals', petpalRoutes);
console.log("   ➡️  /api/petpals registrado correctamente");

app.use('/api/reservations', reservationRoutes);
console.log("   ➡️  /api/reservations registrado correctamente");

app.use('/api/availability', availabilityRoutes)
console.log("   ➡️  /api/avaliability correctamente");

app.use('/api/auth', authRoutes);
console.log("   ➡️  /api/auth registrado correctamente");

// Ruta principal
app.get('/', (req, res) => {
    res.send('Petpal API funcionando correctamente 🚀 con CORS habilitado');
});

// NOTA: Comenté esto porque ya tienes un app.listen en index.js.
// Tener dos listens puede causar conflictos al iniciar.
/*
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
*/

module.exports = app;