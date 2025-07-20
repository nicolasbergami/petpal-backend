-- SQL para crear el esquema de tablas en la base de datos de CI/CD para tests
-- Basado en el diagrama 'image_e48377.png' y adaptado para MySQL 8.0 (Railway)
-- Este script NO incluye sentencias INSERT INTO.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Desactivar temporalmente la verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Borrar tablas existentes si las hay (útil para un reinicio limpio en cada test run)
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `pets`;
DROP TABLE IF EXISTS `petpal_profiles`;
DROP TABLE IF EXISTS `users`;

--
-- Estructura de tabla para la tabla `users`
--
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- Asumiendo que almacenarías un hash de la contraseña
  `role` VARCHAR(50) DEFAULT 'user', -- Ahora VARCHAR, ej. 'user', 'sitter', 'admin'
  `profile_picture` VARCHAR(255) DEFAULT NULL, -- URL de la imagen
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dni` VARCHAR(20) UNIQUE DEFAULT NULL,
  `direccion` VARCHAR(255) DEFAULT NULL,
  `barrio` VARCHAR(100) DEFAULT NULL,
  `telefono` VARCHAR(20) DEFAULT NULL,
  `ciudad` VARCHAR(100) DEFAULT 'Córdoba'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Estructura de tabla para la tabla `petpal_profiles` (Perfiles de cuidadores/paseadores)
--
CREATE TABLE `petpal_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE, -- Debe ser un usuario existente
  `service_type` VARCHAR(100) NOT NULL, -- Ahora VARCHAR, ej. 'dog walker', 'caregiver', 'peluquero'
  `price_per_hour` DECIMAL(10,2) DEFAULT NULL,
  `price_per_day` DECIMAL(10,2) DEFAULT NULL,
  `experience` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `location` VARCHAR(255) NOT NULL,
  `pet_type` VARCHAR(255) NOT NULL, -- Ahora VARCHAR, ej. 'dog', 'cat', 'all'
  `size_accepted` VARCHAR(100) DEFAULT 'all' -- Ahora VARCHAR, ej. 'small', 'medium', 'large', 'all'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Estructura de tabla para la tabla `pets`
--
CREATE TABLE `pets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL, -- Dueño de la mascota
  `breed` VARCHAR(100) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `age` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `weight` DECIMAL(5,2) DEFAULT NULL,
  `pet_type` VARCHAR(50) NOT NULL DEFAULT 'dog', -- Ahora VARCHAR, ej. 'dog', 'cat', 'bird'
  `description` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Estructura de tabla para la tabla `reservations`
--
CREATE TABLE `reservations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT NOT NULL, -- Usuario que hace la reserva
  `petpal_id` INT NOT NULL, -- ID del perfil del cuidador/paseador (petpal_profiles.id)
  `pet_id` INT NOT NULL, -- Mascota involucrada en la reserva
  `service_type` VARCHAR(100) NOT NULL, -- Ahora VARCHAR, ej. 'dog walker', 'caregiver'
  `date_start` DATETIME NOT NULL,
  `date_end` DATETIME NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending', -- Ahora VARCHAR, ej. 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- AUTO_INCREMENT de las tablas (para reiniciar los contadores)
--

ALTER TABLE `users` MODIFY `id` INT NOT NULL AUTO_INCREMENT;
ALTER TABLE `petpal_profiles` MODIFY `id` INT NOT NULL AUTO_INCREMENT;
ALTER TABLE `pets` MODIFY `id` INT NOT NULL AUTO_INCREMENT;
ALTER TABLE `reservations` MODIFY `id` INT NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas (Claves Foráneas)
--

-- Filtros para la tabla `pets`
ALTER TABLE `pets`
  ADD CONSTRAINT `fk_pets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- Filtros para la tabla `petpal_profiles`
ALTER TABLE `petpal_profiles`
  ADD CONSTRAINT `fk_petpal_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- Filtros para la tabla `reservations`
ALTER TABLE `reservations`
  ADD CONSTRAINT `fk_reservations_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reservations_petpal_profile` FOREIGN KEY (`petpal_id`) REFERENCES `petpal_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reservations_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE;

-- Reactivar la verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;