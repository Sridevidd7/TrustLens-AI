import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import RecommendationDetail from './pages/RecommendationDetail'
import ApprovalCenter from './pages/ApprovalCenter'
import AuditTrail from './pages/AuditTrail'
import Simulator from './pages/Simulator'
import Settings from './pages/Settings'
import IncidentReport from './pages/IncidentReport'
import UsabilityReport from './pages/UsabilityReport'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/recommendation/:id" element={<RecommendationDetail />} />
      <Route path="/approval-center" element={<ApprovalCenter />} />
      <Route path="/audit-trail" element={<AuditTrail />} />
      <Route path="/simulator" element={<Simulator />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/incident-report" element={<IncidentReport />} />
      <Route path="/usability-report" element={<UsabilityReport />} />
    </Routes>
  )
}

export default App
