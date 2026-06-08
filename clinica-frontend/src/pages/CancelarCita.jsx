import { useState, useEffect } from 'react';
import { get, post } from '../api/client.js';

export default function CancelarCita() {
  const [citaId, setCitaId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [citas, setCitas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const data = await get('/citas/activas');
        setCitas(data);
      } catch (err) {
        setError('Error al cargar las citas activas.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchCitas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const data = await post('/citas/' + citaId + '/cancelar', {
        motivo,
        usuario_id: Number(usuarioId),
      });
      setSuccess(data.mensaje || 'Cita cancelada exitosamente.');
      setCitaId('');
      setMotivo('');
      setUsuarioId('');
    } catch (err) {
      setError(err.message || 'Error al cancelar la cita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Cancelar Cita</h1>
      </div>

      <div className="page-content">
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="citaId">Cita</label>
                <select
                  id="citaId"
                  value={citaId}
                  onChange={(e) => setCitaId(e.target.value)}
                  required
                  disabled={loadingData}
                >
                  <option value="">{loadingData ? 'Cargando...' : 'Seleccione una cita'}</option>
                  {citas.map(c => (
                    <option key={c.id} value={c.id}>
                      Cita #{c.id} - {c.fecha} {c.hora_inicio} - {c.paciente} con {c.medico}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="usuarioId">ID de Usuario</label>
                <input
                  id="usuarioId"
                  type="number"
                  min="1"
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(e.target.value)}
                  placeholder="ID del usuario"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="motivo">Motivo de Cancelación</label>
              <textarea
                id="motivo"
                rows="4"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Describa el motivo de la cancelación"
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'Cancelando...' : 'Cancelar Cita'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
