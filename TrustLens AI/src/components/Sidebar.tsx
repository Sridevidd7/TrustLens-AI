import { NavLink } from 'react-router-dom';
import { LayoutGrid, Sparkles, UserCheck, BookOpen, Shield, Settings } from 'lucide-react';

const nav = [
  { to: '/',           label: 'Dashboard',       icon: LayoutGrid },
  { to: '/explanation',label: 'Explanation',     icon: Sparkles   },
  { to: '/approval',   label: 'Approval center', icon: UserCheck  },
  { to: '/audit',      label: 'Audit trail',     icon: BookOpen   },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0D1120] border-r border-[#1F2937] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">TrustLens AI</p>
            <p className="text-xs text-slate-500">Fleet intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 mb-3">Workspace</p>
        <nav className="flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative group
                ${isActive
                  ? 'bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 gradient-bg rounded-r-full" />}
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom status + user row */}
      <div className="px-4 py-4 border-t border-[#1F2937] space-y-3">
        {/* AI status */}
        <div className="flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-green-400 font-medium">AI systems operational</p>
            <p className="text-[11px] text-slate-600">4 agents · Last sync 2m ago</p>
          </div>
        </div>

        {/* User row — clicking avatar/name → /profile, gear → /profile too */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center justify-between px-1 py-1.5 rounded-lg transition-colors group
            ${isActive ? 'bg-indigo-500/10' : 'hover:bg-white/5'}`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full gradient-bg flex items-center justify-center flex-shrink-0 ring-2 transition-all ${isActive ? 'ring-indigo-500/50' : 'ring-transparent group-hover:ring-indigo-500/30'}`}>
                  <span className="text-[10px] font-bold text-white">AS</span>
                </div>
                <div>
                  <p className="text-xs text-white font-medium">Alex Smith</p>
                  <p className="text-[11px] text-slate-500">Global Administrator</p>
                </div>
              </div>
              <Settings className={`w-3.5 h-3.5 transition-colors flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
