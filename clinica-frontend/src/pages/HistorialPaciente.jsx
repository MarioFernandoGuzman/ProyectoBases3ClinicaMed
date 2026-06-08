import React, { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function HistorialPaciente() {
  const [pacienteId, setPacienteId] = useState('');
  const [historiales, setHistoriales] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await get('/pacientes');
        setPacientes(data);
      } catch (err) {
        setError('Error al cargar la lista de pacientes.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchPacientes();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pacienteId) return;

    setLoading(true);
    setError('');
    setHistoriales(null);

    try {
      const data = await get(`/historiales/paciente/${pacienteId}`);
      setHistoriales(data || []);
    } catch (err) {
      setError(err.message || 'Error al buscar el historial clínico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Historial Clínico del Paciente</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Paciente</label>
            <select
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              required
              disabled={loadingData}
              style={{ minWidth: '300px' }}
            >
              <option value="">{loadingData ? 'Cargando...' : 'Seleccione un paciente'}</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombres} {p.apellidos} ({p.dpi})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <div className="loading-text">Buscando historial médico...</div>
          </div>
        )}

        {historiales && historiales.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>Sin historial</h3>
            <p>No se encontraron registros clínicos para el paciente indicado.</p>
          </div>
        )}

        {historiales && historiales.length > 0 && !loading && (
          <div className="result-box" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {historiales.map((registro, idx) => (
              <div key={idx} className="card">
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span>{registro.fecha_consulta} - {registro.especialidad}</span>
                  <span className="card-value violet">Médico: {registro.medico}</span>
                </div>
                
                <div className="section-divider"></div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Motivo de Consulta: </strong> 
                  <span>{registro.motivo_consulta}</span>
                </div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Diagnóstico Principal: </strong> 
                  <span>[{registro.diagnostico_principal?.codigo_cie10}] {registro.diagnostico_principal?.descripcion}</span>
                </div>
                
                <div>
                  <strong>Medicamentos recetados:</strong>
                  {registro.medicamentos_recetados && registro.medicamentos_recetados.length > 0 ? (
                    <ul style={{ margin: '0.5rem 0 0 1.5rem' }}>
                      {registro.medicamentos_recetados.map((med, i) => (
                        <li key={i}>{med}</li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ marginLeft: '0.5rem' }}>Ninguno</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
