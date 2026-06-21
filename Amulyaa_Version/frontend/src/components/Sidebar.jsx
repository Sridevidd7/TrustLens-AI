import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, ShieldCheck, FileSearch, Activity, Settings, AlertTriangle, BarChart3, BookOpenCheck } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/approval-center', label: 'Approval Center', icon: ShieldCheck },
  { to: '/audit-trail', label: 'Audit Trail', icon: FileSearch },
  { to: '/simulator', label: 'Simulator', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/incident-report', label: 'Incident Report', icon: AlertTriangle },
  { to: '/usability-report', label: 'Usability Report', icon: BarChart3 },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon"><BookOpenCheck size={18} /></div>
        <span>TrustLens AI</span>
      </div>
      <nav className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.to
          return (
            <Link key={item.to} to={item.to} className={`nav-link ${active ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
