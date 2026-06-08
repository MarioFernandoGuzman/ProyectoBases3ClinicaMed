import { NavLink, useLocation } from 'react-router-dom';

const navSections = [
  {
    title: 'General',
    items: [
      { to: '/', icon: '📊', label: 'Dashboard' },
    ],
  },
  {
    title: 'Reportes Gerenciales',
    items: [
      { to: '/reportes/facturacion', icon: '💰', label: 'Facturación Mensual' },
      { to: '/reportes/ranking-medicos', icon: '🏆', label: 'Ranking Médicos' },
      { to: '/reportes/diagnosticos', icon: '🩺', label: 'Top Diagnósticos' },
      { to: '/reportes/medicamentos', icon: '💊', label: 'Medicamentos' },
      { to: '/reportes/signos-vitales', icon: '❤️', label: 'Signos Vitales' },
      { to: '/reportes/tiempo-consultas', icon: '⏱️', label: 'Tiempo Consultas' },
      { to: '/reportes/facturas-pendientes', icon: '⚠️', label: 'Facturas Pendientes' },
    ],
  },
  {
    title: 'Consultas',
    items: [
      { to: '/citas/agenda', icon: '📅', label: 'Agenda Diaria' },
      { to: '/pacientes/saldo', icon: '💵', label: 'Saldo Paciente' },
      { to: '/pacientes/historial', icon: '🏥', label: 'Historial Paciente' },
      { to: '/medicos/disponibilidad', icon: '⏰', label: 'Disponibilidad Médico' },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      { to: '/citas/agendar', icon: '➕', label: 'Agendar Cita' },
      { to: '/pagos/registrar', icon: '💳', label: 'Registrar Pago' },
      { to: '/citas/cancelar', icon: '❌', label: 'Cancelar Cita' },
      { to: '/historiales/nuevo', icon: '📋', label: 'Nuevo Historial' },
    ],
  },
];

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🏥</div>
          <div className="logo-text">
            <h1>MedClinic</h1>
            <span>Panel Administrativo</span>
          </div>
        </div>

        {navSections.map((section) => (
          <div key={section.title}>
            <div className="sidebar-section">
              <div className="sidebar-section-title">{section.title}</div>
            </div>
            <ul className="sidebar-nav">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end={item.to === '/'}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <main className="main-area">
        {children}
      </main>
    </div>
  );
}
