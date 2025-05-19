// hashPasswords.js
const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

db.query('SELECT * FROM users', (err, users) => {
    if (err) {
        console.error('Error al obtener usuarios:', err.message);
        return;
    }

    users.forEach(user => {
        const hashedPassword = bcrypt.hashSync(user.password, 8);

        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id], (err) => {
            if (err) {
                console.error(`Error al actualizar usuario ${user.name}:`, err.message);
            } else {
                console.log(`Contraseña de ${user.name} actualizada correctamente`);
            }
        });
    });
});
