// src/app.js
const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');
const petpalRoutes = require('./routes/petpalRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const authRoutes = require('./routes/authRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

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
    res.send('Petpal API funcionando correctamente 🚀 - v2.0');
});



app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
