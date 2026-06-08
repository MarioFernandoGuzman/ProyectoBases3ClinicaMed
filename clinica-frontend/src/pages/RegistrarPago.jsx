import { useState, useEffect } from 'react';
import { get, post } from '../api/client.js';

const INITIAL_FORM = {
  factura_id: '',
  monto: '',
  metodo_pago: 'efectivo',
  referencia: '',
  usuario_id: '',
};

export default function RegistrarPago() {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [facturas, setFacturas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const data = await get('/reportes/facturas-pendientes');
        setFacturas(data);
      } catch (err) {
        setError('Error al cargar las facturas pendientes.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchFacturas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    const body = {
      factura_id: Number(form.factura_id),
      monto: Number(form.monto),
      metodo_pago: form.metodo_pago,
      usuario_id: Number(form.usuario_id),
    };
    if (form.referencia.trim()) {
      body.referencia = form.referencia.trim();
    }

    try {
      const data = await post('/pagos', body);
      setSuccess(data.mensaje || 'Pago registrado exitosamente.');
      setForm({ ...INITIAL_FORM });
    } catch (err) {
      setError(err.message || 'Error al registrar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Registrar Pago</h1>
      </div>

      <div className="page-content">
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="factura_id">Factura</label>
                <select
                  id="factura_id"
                  name="factura_id"
                  value={form.factura_id}
                  onChange={handleChange}
                  required
                  disabled={loadingData}
                >
                  <option value="">{loadingData ? 'Cargando...' : 'Seleccione una factura'}</option>
                  {facturas.map(f => (
                    <option key={f.id} value={f.id}>
                      Factura #{f.id} - {f.paciente} - Q {f.saldo_pendiente}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="monto">Monto</label>
                <input
                  id="monto"
                  name="monto"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.monto}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="metodo_pago">Método de Pago</label>
                <select
                  id="metodo_pago"
                  name="metodo_pago"
                  value={form.metodo_pago}
                  onChange={handleChange}
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="referencia">Referencia (opcional)</label>
                <input
                  id="referencia"
                  name="referencia"
                  type="text"
                  value={form.referencia}
                  onChange={handleChange}
                  placeholder="Número de referencia"
                />
              </div>

              <div className="form-group">
                <label htmlFor="usuario_id">ID de Usuario</label>
                <input
                  id="usuario_id"
                  name="usuario_id"
                  type="number"
                  min="1"
                  value={form.usuario_id}
                  onChange={handleChange}
                  placeholder="ID del usuario"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
