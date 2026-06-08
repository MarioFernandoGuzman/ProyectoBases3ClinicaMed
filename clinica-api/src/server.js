require('dotenv').config();

const app = require('./app');
const conectarMongo = require('./db/mongo');
const pool = require('./db/postgres');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    // Verificar conexion a PostgreSQL
    const pgClient = await pool.connect();
    console.log('PostgreSQL conectado');
    pgClient.release();

    // Conectar a MongoDB
    await conectarMongo();

    // Levantar servidor HTTP
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log('Endpoints disponibles:');
      console.log('  POST /api/pagos');
      console.log('  POST /api/citas/:id/cancelar');
      console.log('  GET  /api/reportes/facturacion-mensual');
      console.log('  GET  /api/reportes/ranking-medicos');
      console.log('  GET  /api/reportes/top-diagnosticos');
      console.log('  GET  /api/reportes/medicamentos');
      console.log('  GET  /api/reportes/signos-vitales');
      console.log('  GET  /api/reportes/tiempo-consultas');
      console.log('  GET  /api/pacientes/:id/saldo');
      console.log('  GET  /api/medicos/:id/disponibilidad?fecha=YYYY-MM-DD');
      console.log('  POST /api/historiales');
      console.log('  GET  /api/health');
    });
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

iniciar();
