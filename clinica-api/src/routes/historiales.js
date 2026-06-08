const { Router } = require('express');
const HistorialClinico = require('../models/HistorialClinico');
const { normalizarHistorialClinico } = require('../utils/reutilizable-mongo');

const router = Router();

/**
 * POST /api/historiales
 * 1. Normaliza el body con normalizarHistorialClinico()
 * 2. Crea instancia del modelo Mongoose
 * 3. Guarda con .save()
 * 4. Responde con el documento insertado
 */
router.post('/', async (req, res) => {
  try {
    // Paso 1: normalizar y validar
    const docNormalizado = normalizarHistorialClinico({ ...req.body });

    // Paso 2: crear instancia del modelo
    const historial = new HistorialClinico(docNormalizado);

    // Paso 3: guardar en MongoDB
    const resultado = await historial.save();

    // Paso 4: responder con el documento insertado
    return res.status(201).json(resultado);
  } catch (err) {
    // Error de validacion (normalizarHistorialClinico o Mongoose)
    if (
      err.name === 'ValidationError' ||
      err.message.includes('Campos obligatorios') ||
      err.message.includes('debe ser')
    ) {
      return res.status(400).json({ error: err.message });
    }

    // Error de duplicado (cita_id unique)
    if (err.code === 11000) {
      return res.status(400).json({
        error: `Ya existe un historial clínico para la cita_id ${req.body.cita_id}`,
      });
    }

    console.error('Error en POST /api/historiales:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/historiales/paciente/:id
 * RF-08: Consultar historial clinico completo de un paciente (cronologico)
 */
router.get('/paciente/:id', async (req, res) => {
  const pacienteId = parseInt(req.params.id, 10);
  if (isNaN(pacienteId)) {
    return res.status(400).json({ error: 'El parámetro id debe ser numérico' });
  }

  try {
    const historiales = await HistorialClinico.find({ paciente_id: pacienteId })
      .sort({ fecha_consulta: -1 })
      .exec();
    
    return res.json(historiales);
  } catch (err) {
    console.error(`Error en GET /api/historiales/paciente/${pacienteId}:`, err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
