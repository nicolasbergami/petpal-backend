-- scripts/seed‑ci.sql

-- 1) Crear tablas si aún no existen
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('client','petpal'),
  dni VARCHAR(20),
  direccion VARCHAR(200),
  barrio VARCHAR(100),
  telefono VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS petpal_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  service_type VARCHAR(50),
  price_per_hour DECIMAL(10,2),
  price_per_day DECIMAL(10,2),
  experience TEXT,
  location VARCHAR(100),
  pet_type VARCHAR(20),
  size_accepted VARCHAR(10),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2) Desactivar FK, truncar y volver a activar
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE petpal_profiles;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 3) Semillas
INSERT INTO users 
  (name, email, password, role, dni, direccion, barrio, telefono)
VALUES 
  (
    'Test User',
    'test@example.com',
    '$2b$10$C5u2t8JkQdV8fM6XZhO8Kes5Y8aZQdpt8eY8zQe2gZlN5hXfN7vG6', -- bcrypt("123456")
    'petpal',
    '12345678',
    'Calle Falsa 123',
    'Nueva Córdoba',
    '3511234567'
  )
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO petpal_profiles 
  (user_id, service_type, price_per_hour, experience, location, pet_type, size_accepted)
VALUES 
  (
    (SELECT id FROM users WHERE email = 'test@example.com'),
    'dog walker',
    15.00,
    '2 años de experiencia',
    'Nueva Córdoba',
    'dog',
    'all'
  )
ON DUPLICATE KEY UPDATE user_id = user_id;
