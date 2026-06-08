const express = require('express');
const router = express.Router();
const pool = require('../db/postgres');

/**
 * GET /api/dashboard/stats
 * Devuelve métricas reales para el dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    const queryPacientes = 'SELECT COUNT(*) as total FROM pacientes';
    const queryMedicos = 'SELECT COUNT(*) as total FROM medicos WHERE activo = true';
    const queryCitas = "SELECT COUNT(*) as total FROM citas WHERE estado = 'atendida'";
    const queryIngresos = "SELECT COALESCE(SUM(total), 0) as total FROM facturas WHERE estado = 'pagada'";

    const [resPacientes, resMedicos, resCitas, resIngresos] = await Promise.all([
      pool.query(queryPacientes),
      pool.query(queryMedicos),
      pool.query(queryCitas),
      pool.query(queryIngresos)
    ]);

    return res.json({
      pacientes: parseInt(resPacientes.rows[0].total, 10),
      medicos: parseInt(resMedicos.rows[0].total, 10),
      citas_atendidas: parseInt(resCitas.rows[0].total, 10),
      ingresos_totales: parseFloat(resIngresos.rows[0].total)
    });
  } catch (err) {
    console.error('Error en GET /api/dashboard/stats:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
