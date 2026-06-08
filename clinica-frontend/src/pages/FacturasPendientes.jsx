import React, { useState, useEffect } from 'react';
import { get } from '../api/client.js';

export default function FacturasPendientes() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const data = await get('/reportes/facturas-pendientes');
        setFacturas(data || []);
      } catch (err) {
        setError(err.message || 'Error al cargar las facturas pendientes.');
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, []);

  const getBadgeClass = (estado) => {
    const stateStr = String(estado).toLowerCase();
    if (stateStr === 'pendiente') return 'badge-warning';
    if (stateStr === 'pagada_parcial') return 'badge-info';
    return 'badge';
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Facturas Pendientes</h1>
      </div>
      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <div className="loading-text">Cargando facturas...</div>
          </div>
        ) : facturas.length === 0 && !error ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>No hay facturas pendientes</h3>
            <p>Todos los pacientes están al día con sus pagos.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha Emisión</th>
                  <th>Paciente</th>
                  <th>DPI</th>
                  <th>Total</th>
                  <th>Saldo Pendiente</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((factura) => (
                  <tr key={factura.id}>
                    <td>{factura.id}</td>
                    <td>{factura.fecha_emision}</td>
                    <td>{factura.paciente}</td>
                    <td>{factura.dpi}</td>
                    <td>Q {Number(factura.total).toFixed(2)}</td>
                    <td>Q {Number(factura.saldo_pendiente).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(factura.estado)}`}>
                        {factura.estado}
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
