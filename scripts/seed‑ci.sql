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
CREATE TABLE IF NOT EXISTS petpals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  service_type VARCHAR(50),
  price_per_hour DECIMAL(10,2),
  price_per_day DECIMAL(10,2),
  experience TEXT,
  location VARCHAR(100),
  pet_type VARCHAR(20),
  size_accepted VARCHAR(10),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
INSERT INTO users (name,email,password,role,dni,direccion,barrio,telefono)
VALUES (
  'Test User',
  'test@example.com',
  -- generar aquí el hash bcrypt de '123456'  
  '$2b$10$…', 
  'petpal',
  '12345678',
  'Calle Falsa 123',
  'Nueva Córdoba',
  '3511234567'
);
INSERT INTO petpals (user_id,service_type,price_per_hour,experience,location,pet_type,size_accepted)
VALUES (LAST_INSERT_ID(),'dog walker',15.00,'2 años de experiencia','Nueva Córdoba','dog','all');
