-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-05-2025 a las 05:34:29
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `petpal`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `petpal_profiles`
--

CREATE TABLE `petpal_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `service_type` enum('dog walker','caregiver') NOT NULL,
  `price_per_hour` decimal(10,2) DEFAULT NULL,
  `price_per_day` decimal(10,2) DEFAULT NULL,
  `experience` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `location` varchar(100) NOT NULL,
  `pet_type` enum('dog','cat') NOT NULL,
  `size_accepted` enum('small','medium','large','all') DEFAULT 'all'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `petpal_profiles`
--

INSERT INTO `petpal_profiles` (`id`, `user_id`, `service_type`, `price_per_hour`, `price_per_day`, `experience`, `created_at`, `updated_at`, `location`, `pet_type`, `size_accepted`) VALUES
(1, 2, 'dog walker', 15.00, NULL, '2 años de experiencia paseando perros grandes.', '2025-05-19 20:28:22', '2025-05-19 20:28:22', '', 'dog', 'all'),
(2, 4, 'caregiver', NULL, 40.00, 'Especialista en cuidado de mascotas pequeñas.', '2025-05-19 20:28:22', '2025-05-19 20:28:22', '', 'dog', 'all'),
(4, 3, 'dog walker', 15.00, 60.00, '2 años paseando perros grandes y medianos', '2025-05-19 21:34:39', '2025-05-19 21:34:39', 'Nueva Cordoba', 'dog', 'medium');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pets`
--

CREATE TABLE `pets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `breed` varchar(100) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `weight` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pets`
--

INSERT INTO `pets` (`id`, `user_id`, `name`, `breed`, `age`, `created_at`, `updated_at`, `weight`) VALUES
(1, 1, 'Rocco', 'Golden Retriever', 3, '2025-05-19 20:28:22', '2025-05-19 20:28:22', NULL),
(2, 1, 'Luna', 'Labrador', 5, '2025-05-19 20:28:22', '2025-05-19 20:28:22', NULL),
(3, 3, 'Max', 'Beagle', 2, '2025-05-19 20:28:22', '2025-05-19 20:28:22', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `petpal_id` int(11) NOT NULL,
  `pet_id` int(11) NOT NULL,
  `service_type` enum('dog walker','caregiver') NOT NULL,
  `date_start` datetime NOT NULL,
  `date_end` datetime NOT NULL,
  `status` enum('pending','accepted','rejected','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservations`
--

INSERT INTO `reservations` (`id`, `client_id`, `petpal_id`, `pet_id`, `service_type`, `date_start`, `date_end`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 1, 'dog walker', '2025-05-20 10:00:00', '2025-05-20 11:00:00', 'pending', '2025-05-19 20:28:22', '2025-05-19 20:28:22'),
(2, 3, 4, 3, 'caregiver', '2025-05-21 09:00:00', '2025-05-22 09:00:00', 'accepted', '2025-05-19 20:28:22', '2025-05-19 20:28:22'),
(3, 1, 3, 1, 'dog walker', '2025-05-20 10:00:00', '2025-05-20 11:00:00', 'accepted', '2025-05-19 21:38:08', '2025-05-19 22:04:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('client','petpal') NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `profile_picture`, `created_at`, `updated_at`) VALUES
(1, 'Nicolás Bergami', 'nico@petpal.com', '$2b$08$YtgdwsndW2LozMnWkS2PVOmwUmZvyvOFbjXORMDuUsiDak6BYvOQq', 'client', NULL, '2025-05-19 20:28:22', '2025-05-19 21:09:48'),
(2, 'Santiago Aguero', 'santi@petpal.com', '$2b$08$cP1RsMLebc6/EDHDUhy8q.Vd/dde5mlY4JVvu0eeeDn3g/8ljEr.G', 'petpal', NULL, '2025-05-19 20:28:22', '2025-05-19 21:09:48'),
(3, 'Camila Torres', 'camila@petpal.com', '$2b$08$eo0xUg2RrAOSeesDjSeGku.6Pi/J.g69QvqAfw30dLVdyUEOl3aA2', 'client', NULL, '2025-05-19 20:28:22', '2025-05-19 21:09:48'),
(4, 'María López', 'maria@petpal.com', '$2b$08$QVo.IOqE7qVY6PCnmJ4TquYllPp4b81uWcXRKkbR9gqnmaFa9dKky', 'petpal', NULL, '2025-05-19 20:28:22', '2025-05-19 21:09:48'),
(5, 'Juan Pérez', 'juanperez@petpal.com', '$2b$08$PY2nogvrRnqnSGHQX8kL/.4.piueJOfamrHPHj9yP3UmxBYIHGTg6', 'client', NULL, '2025-05-19 23:43:30', '2025-05-19 23:43:30');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `petpal_profiles`
--
ALTER TABLE `petpal_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indices de la tabla `pets`
--
ALTER TABLE `pets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `petpal_id` (`petpal_id`),
  ADD KEY `pet_id` (`pet_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `petpal_profiles`
--
ALTER TABLE `petpal_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `pets`
--
ALTER TABLE `pets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `petpal_profiles`
--
ALTER TABLE `petpal_profiles`
  ADD CONSTRAINT `petpal_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pets`
--
ALTER TABLE `pets`
  ADD CONSTRAINT `pets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`petpal_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_3` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
