import { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function DisponibilidadMedico() {
  const [medicoId, setMedicoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consulted, setConsulted] = useState(false);
  const [medicos, setMedicos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const data = await get('/medicos');
        setMedicos(data);
      } catch (err) {
        setError('Error al cargar la lista de médicos.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchMedicos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicoId || !fecha) return;

    setLoading(true);
    setError('');
    setSlots([]);
    setConsulted(false);

    try {
      const data = await get('/medicos/' + medicoId + '/disponibilidad?fecha=' + fecha);
      setSlots(Array.isArray(data) ? data : data.slots || data.disponibilidad || []);
      setConsulted(true);
    } catch (err) {
      setError(err.message || 'Error al consultar la disponibilidad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Disponibilidad del Médico</h1>
      </div>

      <div className="page-content">
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="medicoId">Médico</label>
                <select
                  id="medicoId"
                  value={medicoId}
                  onChange={(e) => setMedicoId(e.target.value)}
                  required
                  disabled={loadingData}
                >
                  <option value="">{loadingData ? 'Cargando...' : 'Seleccione un médico'}</option>
                  {medicos.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nombres} {m.apellidos} - {m.especialidad}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="fecha">Fecha</label>
                <input
                  id="fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Consultando...' : 'Consultar Disponibilidad'}
            </button>
          </form>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Consultando disponibilidad...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {consulted && slots.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <p>No se encontraron horarios para esta fecha.</p>
          </div>
        )}

        {slots.length > 0 && (
          <div className="availability-grid">
            {slots.map((slot, index) => (
              <div
                key={index}
                className={`slot ${slot.disponible ? 'slot-available' : 'slot-occupied'}`}
              >
                <strong>{slot.hora_inicio} — {slot.hora_fin}</strong>
                <span className={`badge ${slot.disponible ? 'badge-success' : 'badge-error'}`}>
                  {slot.disponible ? 'Disponible' : 'Ocupado'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
