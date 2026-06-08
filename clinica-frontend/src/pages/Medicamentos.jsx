import { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function Medicamentos() {
  const [rankingGlobal, setRankingGlobal] = useState([]);
  const [porEspecialidad, setPorEspecialidad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    get('/reportes/medicamentos')
      .then(response => {
        const record = Array.isArray(response) ? response[0] : response;
        setRankingGlobal(record?.ranking_global ?? []);
        setPorEspecialidad(record?.por_especialidad ?? []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando medicamentos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-in">
        <div className="alert alert-error">Error al cargar medicamentos: {error}</div>
      </div>
    );
  }

  if (rankingGlobal.length === 0 && porEspecialidad.length === 0) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <h1>Medicamentos</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">💊</div>
          <p>No hay datos de medicamentos disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Medicamentos</h1>
      </div>

      <div className="page-content">
        <div className="facet-layout">
          {/* Left panel — Global ranking table */}
          <div>
            <h2 className="card-title">Ranking Global</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicamento</th>
                    <th>Total Prescripciones</th>
                    <th>Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingGlobal.map((med, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{med.medicamento}</td>
                      <td>{med.total_prescripciones}</td>
                      <td>
                        <span className="badge badge-info">
                          {Number(med.porcentaje).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right panel — By specialty */}
          <div>
            <h2 className="card-title">Por Especialidad</h2>
            <div className="specialty-grid">
              {porEspecialidad.map((spec, idx) => (
                <div className="specialty-card" key={idx}>
                  <h3>{spec.especialidad}</h3>
                  <div className="section-divider"></div>
                  {spec.medicamentos && spec.medicamentos.map((med, mIdx) => (
                    <div className="med-item" key={mIdx}>
                      <span>{med.medicamento}</span>
                      <span className="med-count">
                        {Number(med.porcentaje).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
