import { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function SignosVitales() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    get('/reportes/signos-vitales')
      .then(rows => setData(rows))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando signos vitales…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-in">
        <div className="alert alert-error">Error al cargar signos vitales: {error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <h1>Signos Vitales por Grupo Etario</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <p>No hay datos de signos vitales disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Signos Vitales por Grupo Etario</h1>
      </div>

      <div className="page-content">
        <div className="stats-grid">
          {data.map((group, idx) => (
            <div className="stat-card" key={idx}>
              <div className="stat-icon">🫀</div>
              <div className="stat-label">{group.grupo_etario}</div>

              <div className="result-box">
                <div>
                  <span className="stat-label">Presión Sistólica</span>
                  <span className="card-value accent">
                    {Number(group.promedio_presion_sistolica).toFixed(1)}
                  </span>
                </div>
                <div className="section-divider"></div>
                <div>
                  <span className="stat-label">Presión Diastólica</span>
                  <span className="card-value violet">
                    {Number(group.promedio_presion_diastolica).toFixed(1)}
                  </span>
                </div>
                <div className="section-divider"></div>
                <div>
                  <span className="stat-label">Frecuencia Cardíaca</span>
                  <span className="card-value success">
                    {Number(group.promedio_frecuencia_cardiaca).toFixed(1)}
                  </span>
                </div>
                <div className="section-divider"></div>
                <div>
                  <span className="stat-label">Total Registros</span>
                  <span className="card-value">{group.total_registros}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
