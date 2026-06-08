import { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function RankingMedicos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    get('/reportes/ranking-medicos')
      .then(rows => setData(rows))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const formatCurrency = (value) =>
    Number(value).toLocaleString('es-ES', { style: 'currency', currency: 'USD' });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando ranking de médicos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-in">
        <div className="alert alert-error">Error al cargar el ranking: {error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <h1>Ranking de Médicos</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🩺</div>
          <p>No hay datos de ranking disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Ranking de Médicos</h1>
      </div>

      <div className="page-content">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Médico</th>
                <th>Especialidad</th>
                <th>Citas Atendidas</th>
                <th>Monto Facturado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const rank = idx + 1;
                return (
                  <tr key={idx}>
                    <td>{getMedal(rank)}</td>
                    <td>{row.medico}</td>
                    <td>{row.especialidad}</td>
                    <td>{row.citas_atendidas}</td>
                    <td>{formatCurrency(row.monto_facturado)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
