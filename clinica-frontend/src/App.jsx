import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FacturacionMensual from './pages/FacturacionMensual';
import RankingMedicos from './pages/RankingMedicos';
import TopDiagnosticos from './pages/TopDiagnosticos';
import Medicamentos from './pages/Medicamentos';
import SignosVitales from './pages/SignosVitales';
import TiempoConsultas from './pages/TiempoConsultas';
import SaldoPaciente from './pages/SaldoPaciente';
import DisponibilidadMedico from './pages/DisponibilidadMedico';
import RegistrarPago from './pages/RegistrarPago';
import CancelarCita from './pages/CancelarCita';
import NuevoHistorial from './pages/NuevoHistorial';
import AgendaDiaria from './pages/AgendaDiaria';
import AgendarCita from './pages/AgendarCita';
import FacturasPendientes from './pages/FacturasPendientes';
import HistorialPaciente from './pages/HistorialPaciente';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reportes/facturacion" element={<FacturacionMensual />} />
        <Route path="/reportes/ranking-medicos" element={<RankingMedicos />} />
        <Route path="/reportes/diagnosticos" element={<TopDiagnosticos />} />
        <Route path="/reportes/medicamentos" element={<Medicamentos />} />
        <Route path="/reportes/signos-vitales" element={<SignosVitales />} />
        <Route path="/reportes/tiempo-consultas" element={<TiempoConsultas />} />
        <Route path="/reportes/facturas-pendientes" element={<FacturasPendientes />} />
        <Route path="/pacientes/saldo" element={<SaldoPaciente />} />
        <Route path="/pacientes/historial" element={<HistorialPaciente />} />
        <Route path="/medicos/disponibilidad" element={<DisponibilidadMedico />} />
        <Route path="/citas/agenda" element={<AgendaDiaria />} />
        <Route path="/citas/agendar" element={<AgendarCita />} />
        <Route path="/pagos/registrar" element={<RegistrarPago />} />
        <Route path="/citas/cancelar" element={<CancelarCita />} />
        <Route path="/historiales/nuevo" element={<NuevoHistorial />} />
      </Routes>
    </Layout>
  );
}
