// src/controllers/petpalController.js
const Petpal = require('../models/petpalModel');
// src/controllers/petpalController.js

const db = require('../config/db').promise()

/**
 * Devuelve todos los perfiles de Petpal
 */
const getAllPetpals = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        user_id,
        service_type,
        price_per_hour,
        price_per_day,
        experience,
        location,
        pet_type,
        size_accepted
      FROM petpals
    `)
    return res.status(200).json(rows)
  } catch (err) {
    console.error('❌ Error al obtener los perfiles de Petpal:', err)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

/**
 * Devuelve un perfil de Petpal por su ID
 */
const getPetpalById = async (req, res) => {
  const petpalId = req.params.id
  try {
    const [rows] = await db.query(
      'SELECT * FROM petpals WHERE id = ?',
      [petpalId]
    )
    if (!rows.length) {
      return res.status(404).json({ message: 'Perfil no encontrado' })
    }
    return res.status(200).json(rows[0])
  } catch (err) {
    console.error('❌ Error al obtener el perfil de Petpal:', err)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

/**
 * Devuelve todos los perfiles de Petpal de un usuario autenticado
 */
const getPetpalsByUser = async (req, res) => {
  const userId = req.user.id
  try {
    const [rows] = await db.query(
      'SELECT * FROM petpals WHERE user_id = ?',
      [userId]
    )
    return res.status(200).json(rows)
  } catch (err) {
    console.error('❌ Error al obtener los perfiles de Petpal del usuario:', err)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

/**
 * Crea un nuevo perfil de Petpal
 */
const createPetpal = async (req, res) => {
  const userId = req.user.id
  const {
    service_type,
    price_per_hour,
    price_per_day,
    experience,
    location,
    pet_type,
    size_accepted
  } = req.body

  // Validación básica
  if (!service_type || !experience || !location || !pet_type || !size_accepted) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' })
  }

  try {
    const [result] = await db.query(
      `INSERT INTO petpals
         (user_id, service_type, price_per_hour, price_per_day, experience, location, pet_type, size_accepted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        service_type,
        price_per_hour || null,
        price_per_day || null,
        experience,
        location,
        pet_type,
        size_accepted
      ]
    )
    return res
      .status(201)
      .json({ message: 'Perfil de Petpal creado correctamente', id: result.insertId })
  } catch (err) {
    console.error('❌ Error al crear el perfil de Petpal:', err)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

/**
 * Actualiza un perfil de Petpal existente
 */
const updatePetpal = async (req, res) => {
  const petpalId = req.params.id
  const {
    service_type,
    price_per_hour,
    price_per_day,
    experience,
    location,
    pet_type,
    size_accepted
  } = req.body

  try {
    await db.query(
      `UPDATE petpals SET
         service_type = ?, price_per_hour = ?, price_per_day = ?,
         experience = ?, location = ?, pet_type = ?, size_accepted = ?
       WHERE id = ?`,
      [
        service_type,
        price_per_hour,
        price_per_day,
        experience,
        location,
        pet_type,
        size_accepted,
        petpalId
      ]
    )
    return res.status(200).json({ message: 'Perfil de Petpal actualizado correctamente' })
  } catch (err) {
    console.error('❌ Error al actualizar el perfil de Petpal:', err)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

/**
 * Elimina un perfil de Petpal
 */
const deletePetpal = async (req, res) => {
  const petpalId = req.params.id
  try {
    await db.query('DELETE FROM petpals WHERE id = ?', [petpalId])
    return res.status(200).json({ message: 'Perfil de Petpal eliminado correctamente' })
  } catch (err) {
    console.error('❌ Error al eliminar el perfil de Petpal:', err)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}

module.exports = {
  getAllPetpals,
  getPetpalById,
  getPetpalsByUser,
  createPetpal,
  updatePetpal,
  deletePetpal
}
