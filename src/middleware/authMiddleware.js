// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = (req, res, next) => {
    console.log("🟢 Middleware: Iniciando verificación de token...");

    const token = req.headers['authorization'];
    if (!token) {
        console.log("❌ Middleware: Token no proporcionado");
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    const cleanToken = token.replace('Bearer ', '');
    console.log("🟢 Middleware: Token recibido ->", cleanToken);

    jwt.verify(cleanToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("❌ Middleware: Error al verificar el token:", err.message);
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }
        
        console.log("🟢 Middleware: Token verificado correctamente:", decoded);
        req.user = decoded;
        next();
    });

    console.log("🟢 Middleware: Finalización del middleware"); // 👈 Este debería salir siempre
};

const isClient = (req, res, next) => {
    console.log("🟢 Middleware: Verificando si es cliente:", req.user.role);
    if (req.user.role === 'client') {
        next();
    } else {
        console.log("❌ Middleware: Acceso denegado (no es cliente)");
        res.status(403).json({ message: 'Acceso denegado: solo para clientes' });
    }
};

const isPetpal = (req, res, next) => {
    if (req.user.role === 'petpal') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado: solo para Petpals' });
    }
};

module.exports = {
    verifyToken,
    isClient,
    isPetpal
};
