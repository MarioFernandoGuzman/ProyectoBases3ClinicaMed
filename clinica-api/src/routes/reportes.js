const { Router } = require('express');
const pool = require('../db/postgres');
const HistorialClinico = require('../models/HistorialClinico');
const {
  pipelineTopDiagnosticos,
  pipelineMedicamentos,
  pipelineSignosVitales,
  pipelineTiempoEntreConsultas,
} = require('../utils/pipelines-mongo');

const router = Router();

// ──────────────────────────────────────────────
// Vistas materializadas de PostgreSQL
// ──────────────────────────────────────────────

/**
 * GET /api/reportes/facturacion-mensual
 */
router.get('/facturacion-mensual', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM mv_facturacion_mensual');
    return res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/reportes/facturacion-mensual:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/reportes/ranking-medicos
 */
router.get('/ranking-medicos', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM mv_ranking_medicos_trimestre');
    return res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/reportes/ranking-medicos:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/reportes/facturas-pendientes
 * RC-02: Facturas pendientes (ordenadas por antigüedad)
 */
router.get('/facturas-pendientes', async (_req, res) => {
  try {
    const query = `
      SELECT f.id, f.emitida_en AS fecha_emision, f.total, f.estado, 
             p.nombres || ' ' || p.apellidos AS paciente,
             p.dpi,
             (f.total - COALESCE((SELECT SUM(monto) FROM pagos WHERE factura_id = f.id), 0)) AS saldo_pendiente
      FROM facturas f
      JOIN pacientes p ON f.paciente_id = p.id
      WHERE f.estado IN ('pendiente', 'pagada_parcial')
      ORDER BY f.emitida_en ASC
    `;
    const { rows } = await pool.query(query);
    return res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/reportes/facturas-pendientes:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ──────────────────────────────────────────────
// Pipelines de aggregation de MongoDB
// ──────────────────────────────────────────────

/**
 * GET /api/reportes/top-diagnosticos
 */
router.get('/top-diagnosticos', async (_req, res) => {
  try {
    const resultado = await HistorialClinico.aggregate(pipelineTopDiagnosticos());
    return res.json(resultado);
  } catch (err) {
    console.error('Error en GET /api/reportes/top-diagnosticos:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/reportes/medicamentos
 */
router.get('/medicamentos', async (_req, res) => {
  try {
    const resultado = await HistorialClinico.aggregate(pipelineMedicamentos());
    return res.json(resultado);
  } catch (err) {
    console.error('Error en GET /api/reportes/medicamentos:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/reportes/signos-vitales
 */
router.get('/signos-vitales', async (_req, res) => {
  try {
    const resultado = await HistorialClinico.aggregate(pipelineSignosVitales());
    return res.json(resultado);
  } catch (err) {
    console.error('Error en GET /api/reportes/signos-vitales:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/reportes/tiempo-consultas
 */
router.get('/tiempo-consultas', async (_req, res) => {
  try {
    const resultado = await HistorialClinico.aggregate(pipelineTiempoEntreConsultas());
    return res.json(resultado);
  } catch (err) {
    console.error('Error en GET /api/reportes/tiempo-consultas:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
