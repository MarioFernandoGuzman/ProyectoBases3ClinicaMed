const { Router } = require('express');
const pool = require('../db/postgres');

const router = Router();

/**
 * GET /api/medicos/:id/disponibilidad?fecha=YYYY-MM-DD
 * Ejecuta la función tabla disponibilidad_medico().
 */
router.get('/:id/disponibilidad', async (req, res) => {
  const medicoId = parseInt(req.params.id, 10);
  const { fecha } = req.query;

  if (isNaN(medicoId)) {
    return res.status(400).json({ error: 'El parámetro id debe ser numérico' });
  }
  if (!fecha) {
    return res.status(400).json({
      error: 'El query param "fecha" es requerido (formato YYYY-MM-DD)',
    });
  }

  // Validar formato de fecha
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!fechaRegex.test(fecha)) {
    return res.status(400).json({
      error: 'Formato de fecha inválido. Use YYYY-MM-DD',
    });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM disponibilidad_medico($1, $2)',
      [medicoId, fecha]
    );

    return res.json({
      medico_id: medicoId,
      fecha,
      disponibilidad: rows,
    });
  } catch (err) {
    console.error(`Error en GET /api/medicos/${medicoId}/disponibilidad:`, err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/medicos
 * Retorna todos los médicos (para los dropdowns).
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.id, m.nombres, m.apellidos, e.nombre AS especialidad 
      FROM medicos m 
      JOIN especialidades e ON m.especialidad_id = e.id 
      ORDER BY m.nombres, m.apellidos
    `);
    return res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/medicos:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
