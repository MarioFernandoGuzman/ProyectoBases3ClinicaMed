import React, { useState, useEffect } from 'react';
import { get, post } from '../api/client.js';

export default function AgendarCita() {
  const [formData, setFormData] = useState({
    medico_id: '',
    paciente_id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    usuario_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pacientesData, medicosData] = await Promise.all([
          get('/pacientes'),
          get('/medicos')
        ]);
        setPacientes(pacientesData);
        setMedicos(medicosData);
      } catch (err) {
        setError('Error al cargar datos iniciales.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const body = {
        medico_id: Number(formData.medico_id),
        paciente_id: Number(formData.paciente_id),
        fecha: formData.fecha,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        usuario_id: Number(formData.usuario_id)
      };

      await post('/citas', body);
      setSuccess('Cita agendada exitosamente.');
      setFormData({
        medico_id: '',
        paciente_id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        usuario_id: ''
      });
    } catch (err) {
      setError(err.message || 'Error al agendar la cita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Agendar Cita</h1>
      </div>
      <div className="page-content">
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Médico</label>
                <select
                  name="medico_id"
                  value={formData.medico_id}
                  onChange={handleChange}
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
                <label>Paciente</label>
                <select
                  name="paciente_id"
                  value={formData.paciente_id}
                  onChange={handleChange}
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
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hora Inicio</label>
                <input
                  type="time"
                  step="1800"
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hora Fin</label>
                <input
                  type="time"
                  step="1800"
                  name="hora_fin"
                  value={formData.hora_fin}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>ID Usuario</label>
                <input
                  type="number"
                  name="usuario_id"
                  value={formData.usuario_id}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Agendando...' : 'Agendar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
