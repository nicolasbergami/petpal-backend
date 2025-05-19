// src/index.js
const app = require('./app');
const db = require('./config/db');

app.listen(process.env.PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${process.env.PORT}`);
});
