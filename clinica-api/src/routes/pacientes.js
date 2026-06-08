const { Router } = require('express');
const pool = require('../db/postgres');

const router = Router();

/**
 * GET /api/pacientes/:id/saldo
 * Ejecuta la funcion escalar saldo_paciente().
 */
router.get('/:id/saldo', async (req, res) => {
  const pacienteId = parseInt(req.params.id, 10);

  if (isNaN(pacienteId)) {
    return res.status(400).json({ error: 'El parámetro id debe ser numérico' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT saldo_paciente($1) AS saldo',
      [pacienteId]
    );

    return res.json({
      paciente_id: pacienteId,
      saldo: rows[0].saldo,
    });
  } catch (err) {
    console.error(`Error en GET /api/pacientes/${pacienteId}/saldo:`, err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/pacientes
 * Retorna todos los pacientes (para los dropdowns).
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nombres, apellidos, dpi FROM pacientes ORDER BY nombres, apellidos');
    return res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/pacientes:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
