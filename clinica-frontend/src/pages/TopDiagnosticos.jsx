import { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function TopDiagnosticos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    get('/reportes/top-diagnosticos')
      .then(rows => setData(rows))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando diagnósticos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-in">
        <div className="alert alert-error">Error al cargar diagnósticos: {error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <h1>Top Diagnósticos por Especialidad</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🔬</div>
          <p>No hay datos de diagnósticos disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Top Diagnósticos por Especialidad</h1>
      </div>

      <div className="page-content">
        <div className="specialty-grid">
          {data.map((specialty, idx) => (
            <div className="specialty-card" key={idx}>
              <h3>{specialty.especialidad}</h3>
              <div className="section-divider"></div>
              {specialty.top_diagnosticos && specialty.top_diagnosticos.map((diag, dIdx) => (
                <div className="diag-item" key={dIdx}>
                  <span className="diag-code">{diag.codigo_cie10}</span>
                  <span>{diag.descripcion}</span>
                  <span className="diag-count">{diag.total}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
