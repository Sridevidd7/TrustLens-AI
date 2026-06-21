import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RecommendationDetail from './pages/RecommendationDetail.jsx';
import ApprovalCenter from './pages/ApprovalCenter.jsx';
import AuditTrail from './pages/AuditTrail.jsx';
import Simulator from './pages/Simulator.jsx';
import Settings from './pages/Settings.jsx';
import IncidentReport from './pages/IncidentReport.jsx';
import UsabilityReport from './pages/UsabilityReport.jsx';

export default function App() {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recommendations/:id" element={<RecommendationDetail />} />
          <Route path="/approval" element={<ApprovalCenter />} />
          <Route path="/audit" element={<AuditTrail />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/incidents" element={<IncidentReport />} />
          <Route path="/usability" element={<UsabilityReport />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
