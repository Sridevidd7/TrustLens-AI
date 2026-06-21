import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './screens/Dashboard';
import Explanation from './screens/Explanation';
import ApprovalCenter from './screens/ApprovalCenter';
import AuditTrail from './screens/AuditTrail';
import Profile from './screens/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0A0E1A]">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/explanation" element={<Explanation />} />
              <Route path="/explanation/:id" element={<Explanation />} />
              <Route path="/recommendation/:id" element={<Explanation />} />
              <Route path="/approval" element={<ApprovalCenter />} />
              <Route path="/audit" element={<AuditTrail />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
