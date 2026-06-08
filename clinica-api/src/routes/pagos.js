const { Router } = require('express');
const pool = require('../db/postgres');

const router = Router();

/**
 * POST /api/pagos
 * Ejecuta el stored procedure registrar_pago.
 */
router.post('/', async (req, res) => {
  const { factura_id, monto, metodo_pago, referencia, usuario_id } = req.body;

  // Validación básica
  if (!factura_id || !monto || !metodo_pago || !usuario_id) {
    return res.status(400).json({
      error: 'Campos requeridos: factura_id, monto, metodo_pago, usuario_id',
    });
  }

  try {
    await pool.query(
      'CALL registrar_pago($1, $2, $3, $4, $5)',
      [factura_id, monto, metodo_pago, referencia || null, usuario_id]
    );

    return res.status(201).json({
      mensaje: 'Pago registrado exitosamente',
      datos: { factura_id, monto, metodo_pago, referencia, usuario_id },
    });
  } catch (err) {
    // Los SP lanzan excepciones con prefijo PAGO_ERR_xxx
    if (err.message && err.message.includes('PAGO_ERR_')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error en POST /api/pagos:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
