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

// --- 2. CONFIGURACIÓN DE CORS (AHORA ES DINÁMICO) ---
const corsOptions = {
  origin: function (origin, callback) {
    // 1. Permitir llamadas sin origen (Postman, Insomnia, Apps Nativas)
    if (!origin) return callback(null, true);

    // 2. Permitir llamadas locales (tu PC)
    if (origin.includes('localhost')) return callback(null, true);

    // 3. LA MAGIA: Permitir CUALQUIER URL generada por Vercel
    if (origin.includes('.vercel.app')) return callback(null, true);

    // 4. Si no es ninguna de las anteriores, bloquear
    console.log("🚫 Bloqueado por CORS:", origin);
    callback(new Error('Not allowed by CORS'));
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
    res.send('Petpal API funcionando correctamente 🚀 con CORS dinámico para Vercel prueba Santi por segunda vez ');
});

module.exports = app;