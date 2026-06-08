import { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function FacturacionMensual() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    get('/reportes/facturacion-mensual')
      .then(rows => setData(rows))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatMes = (mes) => {
    try {
      const date = new Date(mes);
      return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    } catch {
      return mes;
    }
  };

  const formatCurrency = (value) =>
    Number(value).toLocaleString('es-ES', { style: 'currency', currency: 'USD' });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando facturación mensual…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-in">
        <div className="alert alert-error">Error al cargar facturación: {error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <h1>Facturación Mensual</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p>No hay datos de facturación disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Facturación Mensual</h1>
      </div>

      <div className="page-content">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Especialidad</th>
                <th>Total Facturas</th>
                <th>Total Facturado</th>
                <th>Total Cobrado</th>
                <th>Saldo Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  <td>{formatMes(row.mes)}</td>
                  <td>{row.especialidad}</td>
                  <td>{row.total_facturas}</td>
                  <td>{formatCurrency(row.total_facturado)}</td>
                  <td>
                    <span className="badge badge-success">
                      {formatCurrency(row.total_cobrado)}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-warning">
                      {formatCurrency(row.saldo_pendiente)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
