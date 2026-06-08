const express = require('express');

const pagosRouter = require('./routes/pagos');
const citasRouter = require('./routes/citas');
const reportesRouter = require('./routes/reportes');
const pacientesRouter = require('./routes/pacientes');
const medicosRouter = require('./routes/medicos');
const historialesRouter = require('./routes/historiales');
const dashboardRouter = require('./routes/dashboard');

const app = express();

// Middleware
app.use(express.json());

// Rutas
app.use('/api/pagos', pagosRouter);
app.use('/api/citas', citasRouter);
app.use('/api/reportes', reportesRouter);
app.use('/api/pacientes', pacientesRouter);
app.use('/api/medicos', medicosRouter);
app.use('/api/historiales', historialesRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ruta no encontrada
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador global de errores
app.use((err, _req, res, _next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
