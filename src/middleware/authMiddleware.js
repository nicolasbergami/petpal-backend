const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = (req, res, next) => {
    // 1. Obtener el header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        console.log("❌ Middleware: Token no proporcionado");
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    // 2. Extraer el token (Soporta "Bearer <token>")
    // Usamos split para ser más precisos que replace
    const token = authHeader.split(' ')[1]; 
    
    if (!token) {
        console.log("❌ Middleware: Formato de token inválido");
        return res.status(403).json({ message: 'Token malformado' });
    }

    // 3. Verificar
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("❌ Middleware: Error al verificar token ->", err.message);
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }
        
        // 4. Guardar datos decodificados en la request
        req.user = decoded; 
        console.log(`🟢 Middleware: Usuario autenticado ID: ${decoded.id} | Rol: ${decoded.role}`);
        
        next();
    });
};

const isClient = (req, res, next) => {
    // 🛡️ Safety check: Evita que el server se caiga si olvidamos poner verifyToken antes
    if (!req.user) {
        return res.status(500).json({ message: 'Error de servidor: No se verificó el usuario' });
    }

    if (req.user.role === 'client' || req.user.role === 'admin') {
        next();
    } else {
        console.log(`⛔ Acceso denegado: Usuario ${req.user.id} intentó entrar a ruta de Cliente`);
        res.status(403).json({ message: 'Acceso denegado: Se requiere rol Cliente' });
    }
};

const isPetpal = (req, res, next) => {
    // 🛡️ Safety check
    if (!req.user) {
        return res.status(500).json({ message: 'Error de servidor: No se verificó el usuario' });
    }

    if (req.user.role === 'petpal' || req.user.role === 'admin') {
        next();
    } else {
        console.log(`⛔ Acceso denegado: Usuario ${req.user.id} intentó entrar a ruta de Petpal`);
        res.status(403).json({ message: 'Acceso denegado: Se requiere rol Petpal' });
    }
};

module.exports = {
    verifyToken,
    isClient,
    isPetpal
};