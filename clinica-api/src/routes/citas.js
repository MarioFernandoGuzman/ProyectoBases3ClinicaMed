const { Router } = require('express');
const pool = require('../db/postgres');

const router = Router();

/**
 * POST /api/citas/:id/cancelar
 * Ejecuta el stored procedure cancelar_cita.
 */
router.post('/:id/cancelar', async (req, res) => {
  const citaId = parseInt(req.params.id, 10);
  const { motivo, usuario_id } = req.body;

  if (isNaN(citaId)) {
    return res.status(400).json({ error: 'El parámetro id debe ser numérico' });
  }
  if (!motivo || !usuario_id) {
    return res.status(400).json({
      error: 'Campos requeridos: motivo, usuario_id',
    });
  }

  try {
    await pool.query(
      'CALL cancelar_cita($1, $2, $3)',
      [citaId, motivo, usuario_id]
    );

    return res.status(200).json({
      mensaje: 'Cita cancelada exitosamente',
      datos: { cita_id: citaId, motivo, usuario_id },
    });
  } catch (err) {
    // Los SP lanzan excepciones con prefijo CITA_ERR_xxx
    if (err.message && err.message.includes('CITA_ERR_')) {
      return res.status(400).json({ error: err.message });
    }
    console.error(`Error en POST /api/citas/${citaId}/cancelar:`, err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/citas/agenda-diaria?fecha=YYYY-MM-DD
 * RC-01: Agenda diaria (Citas del dia con paciente, medico, hora y estado)
 */
router.get('/agenda-diaria', async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) return res.status(400).json({ error: 'Falta fecha (YYYY-MM-DD)' });

  try {
    const query = `
      SELECT c.id, c.hora_inicio, c.hora_fin, c.estado, 
             p.nombres || ' ' || p.apellidos AS paciente,
             m.nombres || ' ' || m.apellidos AS medico,
             e.nombre AS especialidad
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN medicos m ON c.medico_id = m.id
      JOIN especialidades e ON m.especialidad_id = e.id
      WHERE c.fecha = $1
      ORDER BY c.hora_inicio ASC
    `;
    const { rows } = await pool.query(query, [fecha]);
    return res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/citas/agenda-diaria:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
});

/**
 * POST /api/citas
 * RF-04: Agendar cita validando RN-01, RN-02, RN-03
 */
router.post('/', async (req, res) => {
  const { medico_id, paciente_id, fecha, hora_inicio, hora_fin, usuario_id } = req.body;
  if (!medico_id || !paciente_id || !fecha || !hora_inicio || !hora_fin || !usuario_id) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    // Validar RN-03: No mas de una cita por paciente con el mismo medico el mismo dia
    const rn03 = await pool.query(
      "SELECT 1 FROM citas WHERE paciente_id = $1 AND medico_id = $2 AND fecha = $3 AND estado IN ('programada', 'confirmada')",
      [paciente_id, medico_id, fecha]
    );
    if (rn03.rows.length > 0) {
      return res.status(400).json({ error: 'El paciente ya tiene una cita activa con este médico en esta fecha (RN-03)' });
    }

    // Validar RN-01 y RN-02 usando la funcion de disponibilidad
    const disp = await pool.query(
      'SELECT disponible FROM disponibilidad_medico($1, $2) WHERE hora_inicio = $3 AND hora_fin = $4',
      [medico_id, fecha, hora_inicio, hora_fin]
    );
    
    if (disp.rows.length === 0) {
      return res.status(400).json({ error: 'Horario fuera de la jornada del médico (RN-02)' });
    }
    if (!disp.rows[0].disponible) {
      return res.status(400).json({ error: 'El médico ya tiene una cita en ese horario (RN-01)' });
    }

    // Insertar
    const result = await pool.query(
      `INSERT INTO citas (medico_id, paciente_id, fecha, hora_inicio, hora_fin, estado, creado_por)
       VALUES ($1, $2, $3, $4, $5, 'programada', $6) RETURNING *`,
      [medico_id, paciente_id, fecha, hora_inicio, hora_fin, usuario_id]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error en POST /api/citas:', err);
    return res.status(500).json({ error: 'Error interno al agendar cita' });
  }
});

/**
 * GET /api/citas/activas
 * Retorna las citas en estado 'programada' o 'confirmada' (para select de cancelar o nuevo historial).
 */
router.get('/activas', async (req, res) => {
  try {
    const query = `
      SELECT c.id, c.fecha, c.hora_inicio, c.estado,
             p.nombres || ' ' || p.apellidos AS paciente,
             m.nombres || ' ' || m.apellidos AS medico
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN medicos m ON c.medico_id = m.id
      WHERE c.estado IN ('programada', 'confirmada')
      ORDER BY c.fecha, c.hora_inicio
    `;
    const { rows } = await pool.query(query);
    return res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/citas/activas:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
