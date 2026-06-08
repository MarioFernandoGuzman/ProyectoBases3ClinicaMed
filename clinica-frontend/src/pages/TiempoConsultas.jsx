import { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function TiempoConsultas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    get('/reportes/tiempo-consultas')
      .then(rows => setData(rows))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const getDaysBadge = (days) => {
    const num = Number(days);
    if (num < 30) return 'badge badge-success';
    if (num <= 60) return 'badge badge-warning';
    return 'badge badge-error';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando tiempos de consulta…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-in">
        <div className="alert alert-error">Error al cargar tiempos de consulta: {error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <h1>Tiempo entre Consultas</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">⏱️</div>
          <p>No hay datos de tiempos de consulta disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Tiempo entre Consultas</h1>
      </div>

      <div className="page-content">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>ID</th>
                <th>Promedio Días</th>
                <th>Total Intervalos</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.nombre_paciente}</td>
                  <td>{row.paciente_id}</td>
                  <td>
                    <span className={getDaysBadge(row.promedio_dias)}>
                      {Number(row.promedio_dias).toFixed(1)} días
                    </span>
                  </td>
                  <td>{row.total_intervalos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
