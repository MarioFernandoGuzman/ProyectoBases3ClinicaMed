import React, { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function AgendaDiaria() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fecha) return;
    const fetchCitas = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await get(`/citas/agenda-diaria?fecha=${fecha}`);
        setCitas(data || []);
      } catch (err) {
        setError(err.message || 'Error al cargar la agenda diaria.');
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, [fecha]);

  const getBadgeClass = (estado) => {
    const stateStr = String(estado).toLowerCase();
    if (['atendida', 'confirmada'].includes(stateStr)) return 'badge-success';
    if (stateStr === 'programada') return 'badge-warning';
    if (['cancelada', 'no_asistio'].includes(stateStr)) return 'badge-error';
    return 'badge';
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Agenda Diaria</h1>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="fecha">Fecha</label>
          <input
            type="date"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
      </div>
      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <div className="loading-text">Cargando agenda...</div>
          </div>
        ) : citas.length === 0 && !error ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No hay citas programadas</h3>
            <p>No se encontraron citas para la fecha seleccionada.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Especialidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((cita) => (
                  <tr key={cita.id}>
                    <td>{cita.id}</td>
                    <td>{cita.hora_inicio} - {cita.hora_fin}</td>
                    <td>{cita.paciente}</td>
                    <td>{cita.medico}</td>
                    <td>{cita.especialidad}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(cita.estado)}`}>
                        {cita.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
