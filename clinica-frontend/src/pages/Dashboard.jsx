import { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      get('/health'),
      get('/dashboard/stats')
    ])
      .then(([healthData, statsData]) => {
        setHealth(healthData);
        setStats(statsData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-in">
        <div className="alert alert-error">Error al conectar con la API: {error}</div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Dashboard — Clínica Médica</h1>
      </div>

      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-label">API Status</div>
            <div className="stat-value">
              {health?.status === 'ok' || health?.status === 'UP' ? (
                <span className="badge badge-success">Operativo</span>
              ) : (
                <span className="badge badge-error">{health?.status ?? 'Desconocido'}</span>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-label">Pacientes Registrados</div>
            <div className="stat-value">{stats?.pacientes || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👨‍⚕️</div>
            <div className="stat-label">Médicos Activos</div>
            <div className="stat-value">{stats?.medicos || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏥</div>
            <div className="stat-label">Citas Atendidas</div>
            <div className="stat-value">{stats?.citas_atendidas || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-label">Ingresos Totales</div>
            <div className="stat-value">Q {stats?.ingresos_totales?.toLocaleString('es-GT', { minimumFractionDigits: 2 }) || '0.00'}</div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Bienvenido al Sistema de Gestión Clínica</h2>
          <p>
            Este panel centraliza la información operativa de la clínica.
            Consulte los reportes de facturación mensual, ranking de médicos,
            diagnósticos frecuentes, medicamentos, signos vitales y tiempos
            de consulta desde el menú lateral.
          </p>
          <p>
            El backend expone 11 endpoints distribuidos entre PostgreSQL y
            MongoDB, ofreciendo datos en tiempo real para la toma de decisiones
            médicas y administrativas.
          </p>
        </div>
      </div>
    </div>
  );
}
