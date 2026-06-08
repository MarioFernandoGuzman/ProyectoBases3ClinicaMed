import { useState, useEffect } from 'react';
import { get, post } from '../api/client.js';

const INITIAL_FORM = {
  cita_id: '',
  paciente_id: '',
  medico_id: '',
  especialidad: '',
  nombre_medico: '',
  nombre_paciente: '',
  fecha_nacimiento_paciente: '',
  fecha_consulta: '',
  motivo_consulta: '',
  presion_sistolica: '',
  presion_diastolica: '',
  frecuencia_cardiaca: '',
  temperatura: '',
  peso_kg: '',
  talla_cm: '',
  codigo_cie10: '',
  descripcion_diagnostico: '',
  tipo_diagnostico: 'principal',
  nombre_medicamento: '',
  dosis: '',
  frecuencia: '',
  duracion: '',
  notas_adicionales: '',
};

export default function NuevoHistorial() {
  const [form, setForm] = useState({ ...INITIAL_FORM });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cita_id') {
      const cita = citas.find(c => String(c.id) === String(value));
      if (cita) {
        setForm(prev => ({
          ...prev,
          cita_id: value,
          paciente_id: cita.paciente_id || '',
          medico_id: cita.medico_id || '',
          nombre_paciente: cita.paciente || '',
          nombre_medico: cita.medico || ''
        }));
      } else {
        setForm(prev => ({ ...prev, cita_id: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    const body = {
      cita_id: Number(form.cita_id),
      paciente_id: Number(form.paciente_id),
      medico_id: Number(form.medico_id),
      especialidad: form.especialidad,
      nombre_medico: form.nombre_medico,
      nombre_paciente: form.nombre_paciente,
      fecha_nacimiento_paciente: form.fecha_nacimiento_paciente,
      fecha_consulta: form.fecha_consulta,
      motivo_consulta: form.motivo_consulta,
      signos_vitales: {
        presion_sistolica: Number(form.presion_sistolica),
        presion_diastolica: Number(form.presion_diastolica),
        frecuencia_cardiaca: Number(form.frecuencia_cardiaca),
        temperatura: Number(form.temperatura),
        peso_kg: Number(form.peso_kg),
        talla_cm: Number(form.talla_cm),
      },
      diagnosticos: [
        {
          codigo_cie10: form.codigo_cie10,
          descripcion: form.descripcion_diagnostico,
          tipo: form.tipo_diagnostico,
        },
      ],
      medicamentos: [
        {
          nombre: form.nombre_medicamento,
          dosis: form.dosis,
          frecuencia: form.frecuencia,
          duracion: form.duracion,
        },
      ],
      notas_adicionales: form.notas_adicionales,
    };

    try {
      const data = await post('/historiales', body);
      setSuccess('Historial clínico creado exitosamente. ID: ' + (data.id || data._id || ''));
      setForm({ ...INITIAL_FORM });
    } catch (err) {
      setError(err.message || 'Error al crear el historial clínico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Nuevo Historial Clínico</h1>
      </div>

      <div className="page-content">
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>

            {/* Datos de la Consulta */}
            <h3>Datos de la Consulta</h3>
            <div className="section-divider"></div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cita_id">Cita</label>
                <select
                  id="cita_id"
                  name="cita_id"
                  value={form.cita_id}
                  onChange={handleChange}
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
              <div className="form-group" style={{ display: 'none' }}>
                <label htmlFor="paciente_id">ID del Paciente</label>
                <input
                  id="paciente_id"
                  name="paciente_id"
                  type="number"
                  value={form.paciente_id}
                  onChange={handleChange}
                  readOnly
                />
              </div>
              <div className="form-group" style={{ display: 'none' }}>
                <label htmlFor="medico_id">ID del Médico</label>
                <input
                  id="medico_id"
                  name="medico_id"
                  type="number"
                  value={form.medico_id}
                  onChange={handleChange}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="especialidad">Especialidad</label>
                <input
                  id="especialidad"
                  name="especialidad"
                  type="text"
                  value={form.especialidad}
                  onChange={handleChange}
                  placeholder="Especialidad médica"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="nombre_medico">Nombre del Médico</label>
                <input
                  id="nombre_medico"
                  name="nombre_medico"
                  type="text"
                  value={form.nombre_medico}
                  onChange={handleChange}
                  placeholder="Dr. Nombre Apellido"
                  required
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="nombre_paciente">Nombre del Paciente</label>
                <input
                  id="nombre_paciente"
                  name="nombre_paciente"
                  type="text"
                  value={form.nombre_paciente}
                  onChange={handleChange}
                  placeholder="Nombre completo del paciente"
                  required
                  readOnly
                />
              </div>
            </div>

            {/* Fechas */}
            <h3>Fechas</h3>
            <div className="section-divider"></div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fecha_nacimiento_paciente">Fecha de Nacimiento del Paciente</label>
                <input
                  id="fecha_nacimiento_paciente"
                  name="fecha_nacimiento_paciente"
                  type="date"
                  value={form.fecha_nacimiento_paciente}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="fecha_consulta">Fecha de Consulta</label>
                <input
                  id="fecha_consulta"
                  name="fecha_consulta"
                  type="date"
                  value={form.fecha_consulta}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Consulta */}
            <h3>Consulta</h3>
            <div className="section-divider"></div>
            <div className="form-group">
              <label htmlFor="motivo_consulta">Motivo de Consulta</label>
              <textarea
                id="motivo_consulta"
                name="motivo_consulta"
                rows="4"
                value={form.motivo_consulta}
                onChange={handleChange}
                placeholder="Describa el motivo de la consulta"
                required
              ></textarea>
            </div>

            {/* Signos Vitales */}
            <h3>Signos Vitales</h3>
            <div className="section-divider"></div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="presion_sistolica">Presión Sistólica (mmHg)</label>
                <input
                  id="presion_sistolica"
                  name="presion_sistolica"
                  type="number"
                  value={form.presion_sistolica}
                  onChange={handleChange}
                  placeholder="120"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="presion_diastolica">Presión Diastólica (mmHg)</label>
                <input
                  id="presion_diastolica"
                  name="presion_diastolica"
                  type="number"
                  value={form.presion_diastolica}
                  onChange={handleChange}
                  placeholder="80"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="frecuencia_cardiaca">Frecuencia Cardíaca (bpm)</label>
                <input
                  id="frecuencia_cardiaca"
                  name="frecuencia_cardiaca"
                  type="number"
                  value={form.frecuencia_cardiaca}
                  onChange={handleChange}
                  placeholder="72"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="temperatura">Temperatura (°C)</label>
                <input
                  id="temperatura"
                  name="temperatura"
                  type="number"
                  step="0.1"
                  value={form.temperatura}
                  onChange={handleChange}
                  placeholder="36.5"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="peso_kg">Peso (kg)</label>
                <input
                  id="peso_kg"
                  name="peso_kg"
                  type="number"
                  step="0.1"
                  value={form.peso_kg}
                  onChange={handleChange}
                  placeholder="70.0"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="talla_cm">Talla (cm)</label>
                <input
                  id="talla_cm"
                  name="talla_cm"
                  type="number"
                  step="0.1"
                  value={form.talla_cm}
                  onChange={handleChange}
                  placeholder="170.0"
                  required
                />
              </div>
            </div>

            {/* Diagnóstico Principal */}
            <h3>Diagnóstico Principal</h3>
            <div className="section-divider"></div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="codigo_cie10">Código CIE-10</label>
                <input
                  id="codigo_cie10"
                  name="codigo_cie10"
                  type="text"
                  value={form.codigo_cie10}
                  onChange={handleChange}
                  placeholder="Ej. J06.9"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="descripcion_diagnostico">Descripción</label>
                <input
                  id="descripcion_diagnostico"
                  name="descripcion_diagnostico"
                  type="text"
                  value={form.descripcion_diagnostico}
                  onChange={handleChange}
                  placeholder="Descripción del diagnóstico"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="tipo_diagnostico">Tipo</label>
                <select
                  id="tipo_diagnostico"
                  name="tipo_diagnostico"
                  value={form.tipo_diagnostico}
                  onChange={handleChange}
                  required
                >
                  <option value="principal">Principal</option>
                  <option value="secundario">Secundario</option>
                  <option value="presuntivo">Presuntivo</option>
                </select>
              </div>
            </div>

            {/* Medicamento */}
            <h3>Medicamento</h3>
            <div className="section-divider"></div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre_medicamento">Nombre</label>
                <input
                  id="nombre_medicamento"
                  name="nombre_medicamento"
                  type="text"
                  value={form.nombre_medicamento}
                  onChange={handleChange}
                  placeholder="Nombre del medicamento"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dosis">Dosis</label>
                <input
                  id="dosis"
                  name="dosis"
                  type="text"
                  value={form.dosis}
                  onChange={handleChange}
                  placeholder="Ej. 500mg"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="frecuencia">Frecuencia</label>
                <input
                  id="frecuencia"
                  name="frecuencia"
                  type="text"
                  value={form.frecuencia}
                  onChange={handleChange}
                  placeholder="Ej. Cada 8 horas"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="duracion">Duración</label>
                <input
                  id="duracion"
                  name="duracion"
                  type="text"
                  value={form.duracion}
                  onChange={handleChange}
                  placeholder="Ej. 7 días"
                  required
                />
              </div>
            </div>

            {/* Notas */}
            <h3>Notas</h3>
            <div className="section-divider"></div>
            <div className="form-group">
              <label htmlFor="notas_adicionales">Notas Adicionales</label>
              <textarea
                id="notas_adicionales"
                name="notas_adicionales"
                rows="4"
                value={form.notas_adicionales}
                onChange={handleChange}
                placeholder="Observaciones o notas adicionales"
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear Historial Clínico'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
