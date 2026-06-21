import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, ClipboardCheck, ScrollText, SlidersHorizontal, Siren, UsersRound } from 'lucide-react';

const links = [
  { to: '/', label: 'Command Center', icon: LayoutDashboard },
  { to: '/approval', label: 'Approval Center', icon: ClipboardCheck },
  { to: '/simulator', label: 'Decision Simulator', icon: ShieldCheck },
  { to: '/audit', label: 'Audit Trail', icon: ScrollText },
  { to: '/incidents', label: 'Incident Card', icon: Siren },
  { to: '/usability', label: 'Usability Results', icon: UsersRound },
  { to: '/settings', label: 'Autonomy Dial', icon: SlidersHorizontal },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark">TL</div>
        <div>
          <h1>TrustLens AI</h1>
          <p>Transparent IT decisions</p>
        </div>
      </div>
      <nav className="nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebarCard">
        <span className="pulse" />
        <strong>Human guardrails on</strong>
        <p>Critical actions require explicit admin confirmation.</p>
      </div>
    </aside>
  );
}
