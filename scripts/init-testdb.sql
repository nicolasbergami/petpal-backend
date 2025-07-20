-- scripts/init-testdb.sql
-- Este script se ejecuta al iniciar el contenedor MySQL
-- Crea un usuario con los privilegios necesarios para la base de datos de tests.

-- Si el usuario ya existe, lo borra para un inicio limpio (opcional, pero seguro)
DROP USER IF EXISTS 'testuser'@'%';

-- Crea el usuario 'testuser' con contraseña 'testpassword'
CREATE USER 'testuser'@'%' IDENTIFIED BY 'testpassword';

-- Otorga todos los privilegios en la base de datos 'testdb' al nuevo usuario
-- El '%' permite conexiones desde cualquier host (incluyendo localhost desde el runner)
GRANT ALL PRIVILEGES ON `testdb`.* TO 'testuser'@'%';

-- Aplica los cambios de privilegios
FLUSH PRIVILEGES;