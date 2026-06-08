import { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function SaldoPaciente() {
  const [pacienteId, setPacienteId] = useState('');
  const [resultado, setResultado] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pacienteId) return;

    setLoading(true);
    setError('');
    setResultado(null);

    try {
      const data = await get('/pacientes/' + pacienteId + '/saldo');
      setResultado(data);
    } catch (err) {
      setError(err.message || 'Error al consultar el saldo del paciente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Saldo del Paciente</h1>
      </div>

      <div className="page-content">
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="pacienteId">Paciente</label>
                <select
                  id="pacienteId"
                  value={pacienteId}
                  onChange={(e) => setPacienteId(e.target.value)}
                  required
                  disabled={loadingData}
                >
                  <option value="">{loadingData ? 'Cargando...' : 'Seleccione un paciente'}</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos} ({p.dpi})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Consultando...' : 'Consultar Saldo'}
            </button>
          </form>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Consultando saldo...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {resultado && (
          <div className="result-box">
            <p><strong>Paciente ID:</strong> {resultado.paciente_id}</p>
            <div className="section-divider"></div>
            <p className="stat-label">Saldo Actual</p>
            <p className="card-value accent">
              Q{Number(resultado.saldo).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
