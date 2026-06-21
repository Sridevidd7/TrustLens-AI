import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter, NavLink, Route, Routes, useNavigate, useParams
} from 'react-router-dom'
import {
  Activity, AlertTriangle, ArrowLeft, Bell, Bot, Check, CheckCircle2,
  ChevronRight, CircleGauge, Clock3, Database, ExternalLink, FileCheck2,
  FileText, Filter, LayoutDashboard, LockKeyhole, Menu, Moon, Network,
  Search, Settings, ShieldCheck, Sparkles, Sun, UserCheck, X, XCircle,
  GitBranch, Siren
} from 'lucide-react'
import './index.css'

// ---------------------------------------------------------------------------
// Fallback data
// ---------------------------------------------------------------------------
const fallback = {
  stats: { open: 7, highConfidence: 18, awaiting: 4, automated: 142 },
  recommendations: [
    {
      id: 1, title: 'Enforce MFA for privileged accounts',
      summary: '12 administrator accounts are not covered by a phishing-resistant MFA policy.',
      severity: 'Critical', confidence: 94, status: 'Needs approval', category: 'Identity',
      affected: 12, time: '8 min ago', risk: 'High',
      sources: ['Microsoft Entra ID sign-in logs', 'Conditional Access policies', 'NIST SP 800-63B'],
      limitation: '2 break-glass accounts were excluded from the analysis.',
      impact: 'Reduces account takeover risk across privileged roles.',
      evidence: ['12 of 18 privileged accounts lack phishing-resistant MFA', '3 accounts showed sign-ins from unfamiliar locations', 'Current policy allows SMS as a fallback method'],
      agents: ['Identity Analyst', 'Policy Validator', 'Risk Assessor']
    },
    {
      id: 2, title: 'Patch critical Windows vulnerabilities',
      summary: 'Deploy the June security baseline to 38 devices with actively exploited CVEs.',
      severity: 'High', confidence: 89, status: 'Needs approval', category: 'Endpoints',
      affected: 38, time: '21 min ago', risk: 'High',
      sources: ['Microsoft Defender Vulnerability Management', 'Intune device inventory', 'CISA KEV catalog'],
      limitation: 'Five devices have not checked in for more than 48 hours.',
      impact: 'Closes 4 known exploited vulnerabilities.',
      evidence: ['CVE-2026-31201 detected on 31 devices', '38 devices missed the latest quality update', 'Pilot ring completed with 99.2% app compatibility'],
      agents: ['Endpoint Scanner', 'Threat Correlator', 'Deployment Planner']
    },
    {
      id: 3, title: 'Remove stale guest access',
      summary: 'Revoke access for 24 guest identities inactive for more than 90 days.',
      severity: 'Medium', confidence: 82, status: 'Ready to review', category: 'Identity',
      affected: 24, time: '1 hr ago', risk: 'Medium',
      sources: ['Entra ID directory audit', 'Teams activity data'],
      limitation: 'External activity outside Microsoft 365 is not visible.',
      impact: 'Reduces standing external access and license exposure.',
      evidence: ['24 guests inactive for 90+ days', '7 guests retain access to confidential groups'],
      agents: ['Identity Analyst', 'Access Reviewer']
    },
    {
      id: 4, title: 'Optimize inactive device cleanup',
      summary: 'Retire 61 devices that have not checked in for 120 days.',
      severity: 'Low', confidence: 76, status: 'Draft', category: 'Devices',
      affected: 61, time: '3 hr ago', risk: 'Low',
      sources: ['Intune managed device inventory'],
      limitation: 'Offline warehouse devices may be incorrectly classified.',
      impact: 'Improves inventory accuracy and reporting.',
      evidence: ['61 devices exceed the cleanup threshold'],
      agents: ['Inventory Agent']
    }
  ],
  audit: [
    { time: '10:42:18', actor: 'Priya Sharma', action: 'Approved recommendation', target: 'Block legacy authentication', result: 'Success', type: 'approval' },
    { time: '10:31:04', actor: 'TrustLens AI', action: 'Generated recommendation', target: 'Enforce MFA for privileged accounts', result: 'Pending review', type: 'ai' },
    { time: '10:29:51', actor: 'Risk Assessor', action: 'Raised confidence score', target: 'Patch critical Windows vulnerabilities', result: '89%', type: 'ai' },
    { time: '09:58:22', actor: 'Marcus Chen', action: 'Rejected recommendation', target: 'Disable removable storage', result: 'Reason recorded', type: 'reject' },
    { time: '09:44:10', actor: 'System', action: 'Data source synchronized', target: 'Microsoft Intune', result: '1,842 records', type: 'system' },
    { time: '09:32:44', actor: 'Elena Rossi', action: 'Modified deployment scope', target: 'Browser security baseline', result: 'Pilot group only', type: 'edit' }
  ]
}

const navItems = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/explanation/1', 'Explanation', Sparkles],
  ['/courtroom/1', 'AI Courtroom', ShieldCheck],
  ['/simulation/1', 'Decision Simulator', CircleGauge],
  ['/approvals', 'Approval center', UserCheck],
  ['/audit', 'Audit trail', FileText],
]

// Severity pills — same in both themes (semantic colour carries intent)
const tone = {
  Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  High:     'bg-orange-500/10 text-orange-500 border-orange-500/20',
  Medium:   'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Low:      'bg-sky-500/10 text-sky-500 border-sky-500/20',
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
async function apiFetch(path, opts = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' }, ...opts,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ---------------------------------------------------------------------------
// Theme context
// ---------------------------------------------------------------------------
const ThemeCtx = React.createContext({ light: false, toggle: () => {} })

function useTheme() { return React.useContext(ThemeCtx) }

// ---------------------------------------------------------------------------
// Root App
// ---------------------------------------------------------------------------
function App() {
  const [data, setData] = useState(fallback)
  const [connected, setConnected] = useState(false)
  const [offline, setOffline] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [light, setLight] = useState(() => localStorage.getItem('tl-theme') === 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('light', light)
    localStorage.setItem('tl-theme', light ? 'light' : 'dark')
  }, [light])

  // TC-DASH-017: track backend connectivity to show demo banner on dashboard
  useEffect(() => {
    apiFetch('/dashboard')
      .then(d => { setData(d); setConnected(true); setOffline(false) })
      .catch(() => { setOffline(true) })
  }, [])

  const theme = { light, toggle: () => setLight(l => !l) }

  return (
    <ThemeCtx.Provider value={theme}>
      <div className="min-h-screen flex" style={{ fontFamily: 'Inter, ui-sans-serif, sans-serif', color: 'var(--text)', background: 'var(--bg-grad)' }}>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
          className={`fixed inset-y-0 z-40 w-[232px] border-r flex flex-col transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

          <div className="h-[70px] flex items-center gap-3 px-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5578ff] to-[#3452d4] flex items-center justify-center shadow-lg shadow-blue-900/30">
              <ShieldCheck size={21} color="#fff" />
            </div>
            <div>
              <div className="font-bold tracking-tight">TrustLens <span style={{ color: '#6f8cff' }}>AI</span></div>
              <div className="text-[10px] uppercase tracking-[.16em]" style={{ color: 'var(--muted)' }}>Decision intelligence</div>
            </div>
          </div>

          <nav className="px-3 pt-5 flex-1 overflow-y-auto">
            <div className="label px-3 mb-2">Workspace</div>
            {navItems.map(([to, label, Icon]) => (
              <NavLink key={label} to={to} end={to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] mb-1 transition border ${
                  isActive ? 'font-semibold' : 'border-transparent'
                }`}
                style={({ isActive }) => isActive
                  ? { background: 'var(--nav-active-bg)', borderColor: 'var(--nav-active-border)', color: 'var(--text)' }
                  : { color: 'var(--nav-inactive)' }
                }
              >
                <Icon size={17} />{label}
              </NavLink>
            ))}
          </nav>

          <div className="p-3">
            <div className="rounded-xl p-3.5 mb-3" style={{ background: 'var(--status-bg)' }}>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#36c690] live" />
                AI systems operational
              </div>
              <div className="text-[10px] mt-2" style={{ color: 'var(--muted)' }}>8 agents · Last sync 2m ago</div>
            </div>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-[#5b4296] flex items-center justify-center text-xs font-bold text-white">AS</div>
              <div className="min-w-0">
                <div className="text-xs font-semibold">Alex Smith</div>
                <div className="text-[10px]" style={{ color: 'var(--muted)' }}>Global Administrator</div>
              </div>
              <Settings size={15} className="ml-auto" style={{ color: 'var(--muted)' }} />
            </div>
          </div>
        </aside>

        <main className="md:ml-[232px] flex-1 min-w-0">
          <TopBar connected={connected} onMenuClick={() => setSidebarOpen(o => !o)} />
          <Routes>
            <Route path="/" element={<Dashboard data={data} offline={offline} />} />
            <Route path="/explanation/:id" element={<Explanation data={data} setData={setData} />} />
            <Route path="/courtroom/:id" element={<Courtroom data={data} />} />
            <Route path="/simulation/:id" element={<Simulation data={data} setData={setData} />} />
            <Route path="/approvals" element={<Approvals data={data} setData={setData} />} />
            <Route path="/audit" element={<Audit data={data} setData={setData} />} />
          </Routes>
        </main>
      </div>
    </ThemeCtx.Provider>
  )
}

// ---------------------------------------------------------------------------
// TopBar — contains the theme toggle
// ---------------------------------------------------------------------------
function TopBar({ connected, onMenuClick }) {
  const { light, toggle } = useTheme()
  return (
    <header className="h-[70px] flex items-center px-5 md:px-8 sticky top-0 z-10 backdrop-blur-xl border-b"
      style={{ background: 'var(--topbar-bg)', borderColor: 'var(--sidebar-border)' }}>

      <button onClick={onMenuClick} aria-label="Toggle menu"
        className="md:hidden mr-4 transition" style={{ color: 'var(--muted)' }}>
        <Menu size={20} />
      </button>

      <div className="hidden sm:flex items-center rounded-lg px-3 py-2 w-[300px] border"
        style={{ background: 'var(--search-bg)', borderColor: 'var(--input-border)' }}>
        <Search size={15} style={{ color: 'var(--muted)' }} />
        <span className="text-xs ml-2 w-full" style={{ color: 'var(--muted)' }}>
          Search recommendations…
        </span>
        <span className="text-[9px] border rounded px-1.5 py-0.5"
          style={{ color: 'var(--muted)', borderColor: 'var(--card-border)' }}>⌘K</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Live/Demo pill */}
        <span className={`hidden sm:flex pill ${connected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          {connected ? 'Live data' : 'Demo data'}
        </span>

        {/* Theme toggle */}
        <button onClick={toggle} aria-label="Toggle theme"
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 border transition text-xs font-medium"
          style={{ borderColor: 'var(--card-border)', color: 'var(--muted)', background: 'var(--status-bg)' }}>
          {light ? <Moon size={14} /> : <Sun size={14} />}
          <span className="hidden sm:inline">{light ? 'Dark' : 'Light'}</span>
        </button>

        <Bell size={18} style={{ color: 'var(--muted)' }} />
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--status-bg)' }}>
          <Bot size={17} style={{ color: '#6f8cff' }} />
        </div>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------
function Page({ children }) {
  return <div className="p-5 md:p-8 max-w-[1480px] mx-auto fade-in">{children}</div>
}

function Header({ eyebrow = 'IT OPERATIONS', title, desc, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between mb-7">
      <div>
        <div className="label mb-2" style={{ color: '#6689ff' }}>{eyebrow}</div>
        <h1 className="text-2xl md:text-[28px] font-bold tracking-tight">{title}</h1>
        <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>{desc}</p>
      </div>
      {action}
    </div>
  )
}

function SectionTitle({ icon: Icon, title, tag }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--acc-bg)', color: '#82a0ff' }}>
          <Icon size={16} />
        </div>
        <div className="font-semibold text-sm">{title}</div>
      </div>
      {tag && <span className="pill" style={{ background: 'var(--acc-bg)', color: '#91aaff' }}>{tag}</span>}
    </div>
  )
}

function Stat({ icon: Icon, label, value, delta, color }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{label}</div>
          <div className="text-2xl font-bold mt-2">{value}</div>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18`, color }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-[10px] mt-3" style={{ color: 'var(--muted)' }}>{delta}</div>
    </div>
  )
}

function Mini({ n, l }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'var(--mini-bg)' }}>
      <div className="font-bold">{n}</div>
      <div className="text-[9px] mt-1" style={{ color: 'var(--muted)' }}>{l}</div>
    </div>
  )
}

function Meter({ label, n }) {
  return (
    <div>
      <div className="flex text-[9px] justify-between" style={{ color: 'var(--muted)' }}>
        <span>{label}</span><span>{n}%</span>
      </div>
      <div className="h-1 rounded mt-1" style={{ background: 'var(--alt-border)' }}>
        <div className="h-full bg-[#5b7fff] rounded" style={{ width: `${n}%` }} />
      </div>
    </div>
  )
}

function Divider() {
  return <div className="border-b" style={{ borderColor: 'var(--divider)' }} />
}

// ---------------------------------------------------------------------------
// Severity sort order for TC-DASH-004
// ---------------------------------------------------------------------------
const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 }

function sortBySeverity(recs) {
  return [...recs].sort((a, b) => {
    const diff = (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99)
    if (diff !== 0) return diff
    return (b.confidence ?? 0) - (a.confidence ?? 0)
  })
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function Dashboard({ data, offline }) {
  // TC-DASH-006/007/008/009: search state
  const [search, setSearch] = useState('')
  // TC-DASH-010/011/012: filter state
  const [severityFilter, setSeverityFilter] = useState('All')
  const [filterOpen, setFilterOpen] = useState(false)

  // TC-DASH-004: sort recommendations by severity
  const sorted = sortBySeverity(data.recommendations)

  // TC-DASH-006/007/008/009: filter by search
  const searched = search.trim()
    ? sorted.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.summary.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase())
      )
    : sorted

  // TC-DASH-010/011/012: filter by severity
  const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low']
  const displayed = severityFilter === 'All'
    ? searched
    : searched.filter(r => r.severity === severityFilter)

  return (
    <Page>
      {/* TC-DASH-017: demo mode banner when backend unreachable */}
      {offline && <OfflineBanner />}
      <Header title="Recommendation dashboard" desc="AI-assisted decisions, with evidence you can inspect."
        action={
          <button className="bg-[#3156d9] hover:bg-[#3d64ec] text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex gap-2 items-center transition">
            <Sparkles size={15} />Run new analysis
          </button>
        }
      />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5 mb-6">
        <Stat icon={AlertTriangle} label="Open recommendations" value={data.stats.open} delta="2 added today" color="#f4a94b" />
        <Stat icon={CircleGauge} label="High confidence" value={data.stats.highConfidence} delta="≥ 85% confidence" color="#50d3a0" />
        <Stat icon={Clock3} label="Awaiting approval" value={data.stats.awaiting} delta="Oldest: 3h 24m" color="#6f8cff" />
        <Stat icon={Activity} label="Automated actions" value={data.stats.automated} delta="Last 7 days" color="#aa80ff" />
      </div>
      <div className="grid xl:grid-cols-[1fr_300px] gap-5">
        <div className="card overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: 'var(--divider)' }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-semibold text-sm">Priority recommendations</div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>Ranked by severity, then confidence</div>
              </div>
              <div className="flex items-center gap-2">
                {/* TC-DASH-006/007/008/009: Search input */}
                <div className="flex items-center border rounded-lg px-2.5 py-1.5"
                  style={{ borderColor: 'var(--input-border)', background: 'var(--search-bg)' }}>
                  <Search size={13} style={{ color: 'var(--muted)' }} />
                  <input
                    aria-label="Search recommendations"
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent border-0 outline-0 text-xs ml-2 w-[140px]"
                    style={{ color: 'var(--text)' }}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} aria-label="Clear search"
                      className="ml-1 transition hover:opacity-70" style={{ color: 'var(--muted)' }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
                {/* TC-DASH-010/011/012: Severity filter dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen(o => !o)}
                    className="text-[11px] border px-2.5 py-1.5 rounded-md flex gap-1.5 items-center transition"
                    style={{ borderColor: severityFilter !== 'All' ? '#5578ff' : 'var(--card-border)',
                             color: severityFilter !== 'All' ? '#6f8cff' : 'var(--muted)',
                             background: severityFilter !== 'All' ? 'rgba(85,120,255,.08)' : 'transparent' }}>
                    <Filter size={12} />
                    {severityFilter === 'All' ? 'Filter' : severityFilter}
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 top-full mt-1 z-20 rounded-lg border overflow-hidden shadow-lg"
                      style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--card-border)', minWidth: '110px' }}>
                      {SEVERITIES.map(s => (
                        <button key={s}
                          onClick={() => { setSeverityFilter(s); setFilterOpen(false) }}
                          className="w-full text-left px-3 py-2 text-xs transition hover:opacity-80"
                          style={{
                            color: s === severityFilter ? '#6f8cff' : 'var(--text)',
                            background: s === severityFilter ? 'var(--nav-active-bg)' : 'transparent'
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* active filter badge */}
            {severityFilter !== 'All' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] pill" style={{ background: 'rgba(85,120,255,.1)', color: '#6f8cff' }}>
                  {severityFilter}
                  <button onClick={() => setSeverityFilter('All')} className="ml-1" aria-label="Remove filter">
                    <X size={10} />
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* TC-DASH-008: empty state */}
          {displayed.length === 0 ? (
            <div className="p-10 text-center" style={{ color: 'var(--muted)' }}>
              <Search size={28} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm font-semibold">No results found</div>
              <div className="text-[11px] mt-1">
                {search ? `No recommendations match "${search}"` : `No ${severityFilter} recommendations`}
              </div>
              <button onClick={() => { setSearch(''); setSeverityFilter('All') }}
                className="mt-3 text-[11px] text-[#6f8cff] hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div>{displayed.map(r => <RecommendationRow key={r.id} r={r} />)}</div>
          )}
        </div>
        <div className="space-y-5">
          <TrustScore />
          <AgentSummary />
        </div>
      </div>
    </Page>
  )
}

function RecommendationRow({ r }) {
  const nav = useNavigate()
  return (
    <button onClick={() => nav(`/explanation/${r.id}`)}
      className="w-full text-left p-4 border-b last:border-0 transition group"
      style={{ borderColor: 'var(--divider)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}>
      <div className="flex gap-3">
        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
          r.severity === 'Critical' ? 'bg-red-500' : r.severity === 'High' ? 'bg-orange-500' :
          r.severity === 'Medium' ? 'bg-amber-500' : 'bg-sky-500'}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold text-[13px]">{r.title}</div>
            <span className={`pill border !py-0.5 ${tone[r.severity]}`}>{r.severity}</span>
          </div>
          <p className="text-[11px] mt-1.5 line-clamp-1" style={{ color: 'var(--muted)' }}>{r.summary}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px]" style={{ color: 'var(--muted)' }}>
            <span className="flex gap-1.5 items-center"><CircleGauge size={12} className="text-emerald-500" />{r.confidence}% confidence</span>
            <span>{r.affected} affected</span>
            <span>{r.category}</span>
            <span>{r.time}</span>
          </div>
        </div>
        <ChevronRight size={16} className="mt-4 transition" style={{ color: 'var(--muted)' }} />
      </div>
    </button>
  )
}

function TrustScore() {
  return (
    <div className="card p-5">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-sm">Trust readiness</div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>Across active decisions</div>
        </div>
        <ShieldCheck size={20} className="text-emerald-500" />
      </div>
      <div className="flex items-center gap-4 mt-5">
        <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'conic-gradient(#46c99a 0 88%, var(--alt-border) 88%)' }}>
          <div className="absolute inset-[7px] rounded-full" style={{ background: 'var(--card-bg)' }} />
          <span className="relative font-bold text-xl">88</span>
        </div>
        <div className="space-y-2 flex-1">
          <Meter label="Explainability" n={94} />
          <Meter label="Source quality" n={91} />
          <Meter label="Human oversight" n={80} />
        </div>
      </div>
    </div>
  )
}

function AgentSummary() {
  return (
    <div className="card p-5">
      <div className="flex justify-between">
        <div>
          <div className="font-semibold text-sm">Active AI agents</div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>8 collaborating now</div>
        </div>
        <Network size={18} style={{ color: '#718cff' }} />
      </div>
      <div className="mt-4 space-y-3">
        {['Identity Analyst', 'Risk Assessor', 'Policy Validator', 'Endpoint Scanner'].map(x => (
          <div className="flex items-center gap-2.5" key={x}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--agent-bg)' }}>
              <Bot size={13} style={{ color: '#7491ff' }} />
            </div>
            <div className="text-[11px] flex-1">{x}</div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        ))}
      </div>
      <NavLink to="/explanation/1"
        className="block text-center mt-4 text-[11px] border-t pt-3 transition hover:opacity-80"
        style={{ color: '#7993ff', borderColor: 'var(--divider)' }}>
        View transparency map →
      </NavLink>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Explanation
// ---------------------------------------------------------------------------
function Explanation({ data, setData }) {
  const { id } = useParams()
  const [expOffline, setExpOffline] = useState(false)
  const [expLoaded, setExpLoaded] = useState(false)

  // TC-EXP-020: try to load fresh data for this specific recommendation
  useEffect(() => {
    apiFetch(`/recommendations/${id}`)
      .then(fresh => {
        // merge fresh data into global state
        setData(d => ({
          ...d,
          recommendations: d.recommendations.map(x => x.id === +id ? fresh : x)
            // add if not present
            .concat(d.recommendations.find(x => x.id === +id) ? [] : [fresh])
        }))
        setExpLoaded(true)
      })
      .catch(() => { setExpOffline(true); setExpLoaded(true) })
  }, [id])

  // TC-EXP-019: invalid/unknown id → graceful not-found state (no fallback to rec[0])
  const r = data.recommendations.find(x => x.id === +id)

  // TC-EXP-019: render a not-found card instead of silently showing wrong data
  if (!r) {
    return (
      <Page>
        <NavLink to="/" className="inline-flex items-center gap-2 text-xs mb-5 transition hover:opacity-80"
          style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={14} />Back to recommendations
        </NavLink>
        <div className="card p-10 text-center mt-8">
          <AlertTriangle size={36} className="mx-auto mb-4 text-amber-500 opacity-60" />
          <div className="font-semibold text-base mb-2">Recommendation not found</div>
          <p className="text-[12px] mb-5" style={{ color: 'var(--muted)' }}>
            No recommendation exists for ID <code className="font-mono">#{id}</code>. It may have been removed or the link is invalid.
          </p>
          <NavLink to="/"
            className="inline-flex items-center gap-2 bg-[#3156d9] hover:bg-[#3d64ec] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition">
            <ArrowLeft size={13} />Return to Dashboard
          </NavLink>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      {/* TC-EXP-020: offline banner propagated via data flag */}
      {expOffline && <OfflineBanner />}
      <NavLink to="/" className="inline-flex items-center gap-2 text-xs mb-5 transition hover:opacity-80"
        style={{ color: 'var(--muted)' }}>
        <ArrowLeft size={14} />Back to recommendations
      </NavLink>
      <Header eyebrow={`${r.category} · ${r.severity} risk`} title={r.title} desc={r.summary} />
      <div className="grid xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          {/* TC-EXP-001/002: Reasoning trace with evidence verification */}
          <ReasoningTrace r={r} />
          {/* TC-EXP-005: Data sources */}
          <Sources r={r} />
          {/* TC-EXP-007: Multi-agent transparency */}
          <AgentMap agents={r.agents} />
          {/* TC-EXP-013/014: Alternative recommendations */}
          <Alternatives rid={r.id} />
        </div>
        <div className="space-y-5">
          {/* TC-EXP-006: Confidence breakdown */}
          <Confidence n={r.confidence} />
          {/* TC-EXP-004: Known limitation */}
          <Warning text={r.limitation} />
          {/* TC-EXP-008–016: Decision panel */}
          <Decision r={r} setData={setData} />
        </div>
      </div>
    </Page>
  )
}

// TC-EXP-001/002/003: Reasoning trace — extracted for clarity
function ReasoningTrace({ r }) {
  // TC-EXP-003: "Ask Why" expandable detail per evidence item
  const [expanded, setExpanded] = useState(null)

  const whyDetail = [
    'This signal was extracted from real-time sign-in telemetry and cross-referenced with the current Conditional Access policy set.',
    'Location anomaly detected using IP geolocation and device compliance posture. Corroborated across 3 independent data sources.',
    'Policy simulation ran against current tenant baseline. SMS fallback violates NIST SP 800-63B AAL2 requirements.',
    'Automated comparison against known baseline configuration and CIS Benchmark controls.',
    'Threat intelligence feed correlation with CISA KEV catalog and internal incident history.',
  ]

  return (
    <section className="card p-5">
      <SectionTitle icon={Sparkles} title="Why TrustLens recommends this" tag="Reasoning trace" />
      <div className="mt-5 pl-3 border-l-2 border-[#4e6bd0] space-y-4">
        {r.evidence.map((e, i) => (
          <div key={e} className="flex gap-3">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
              style={{ background: 'var(--acc-bg)', color: '#9cb2ff' }}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium">{e}</div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>
                Verified against current tenant data · {i === 2 ? 'Policy simulation' : 'Direct observation'}
              </div>
              {/* TC-EXP-003: Ask Why toggle */}
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="mt-2 text-[10px] flex items-center gap-1 transition hover:opacity-80"
                style={{ color: '#6f8cff' }}>
                <Sparkles size={10} />
                {expanded === i ? 'Hide reasoning ↑' : 'Ask why →'}
              </button>
              {expanded === i && (
                <div className="mt-2 rounded-lg p-3 text-[10px] leading-relaxed"
                  style={{ background: 'var(--acc-bg)', color: 'var(--muted)', border: '1px solid var(--sub-border)' }}>
                  {whyDetail[i] ?? 'This evidence point was verified through automated analysis of your connected data sources.'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-lg p-3.5" style={{ background: 'var(--sub-bg)', border: '1px solid var(--sub-border)' }}>
        <div className="label mb-1.5">Expected impact</div>
        <div className="text-xs text-emerald-500">{r.impact}</div>
      </div>
    </section>
  )
}

function Sources({ r }) {
  return (
    <section className="card p-5">
      <SectionTitle icon={Database} title="Data sources & attribution" tag={`${r.sources.length} sources`} />
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        {r.sources.map((s, i) => (
          <div key={s} className="rounded-lg p-3 flex gap-3 items-center border"
            style={{ borderColor: 'var(--card-border)', background: 'var(--sub-bg)' }}>
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'var(--agent-bg)' }}>
              <Database size={14} className="text-sky-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium truncate">{s}</div>
              <div className="text-[9px] mt-1" style={{ color: 'var(--muted)' }}>
                Synced {i ? '14 min' : '2 min'} ago · Verified
              </div>
            </div>
            <ExternalLink size={12} style={{ color: 'var(--muted)' }} />
          </div>
        ))}
      </div>
    </section>
  )
}

function AgentMap({ agents }) {
  return (
    <section className="card p-5">
      <SectionTitle icon={Network} title="Multi-agent transparency" tag={`${agents.length} agents`} />
      <p className="text-[11px] mt-3" style={{ color: 'var(--muted)' }}>
        Independent agents contributed evidence, challenged assumptions, and formed a consensus.
      </p>
      <div className="flex items-center justify-center gap-2 mt-6 overflow-x-auto pb-2">
        {agents.map((a, i) => (
          <React.Fragment key={a}>
            <div className="min-w-[125px] border rounded-lg p-3 text-center"
              style={{ borderColor: 'var(--card-border)', background: 'var(--courtroom-bg)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'var(--agent-icon-bg)' }}>
                <Bot size={15} style={{ color: '#91aaff' }} />
              </div>
              <div className="text-[10px] mt-2 font-semibold">{a}</div>
              <div className="text-[9px] text-emerald-500 mt-1">
                {i === 0 ? 'Proposed' : i === 1 ? 'Validated' : 'Agreed'}
              </div>
            </div>
            {i < agents.length - 1 && <div className="w-5 h-px shrink-0" style={{ background: 'var(--card-border)' }} />}
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}

// TC-EXP-013/014: Alternatives panel on Explanation page
function Alternatives({ rid }) {
  const [alts, setAlts] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    apiFetch(`/alternatives/${rid}`)
      .then(d => setAlts(d.alternatives))
      .catch(() => setAlts([
        { action: 'Monitor for 7 days', risk: 'Medium' },
        { action: 'Pilot deployment (10% of devices)', risk: 'Low' },
        { action: 'Escalate to security analyst', risk: 'Very Low' },
      ]))
  }, [rid])

  const riskColor = { Low: 'text-emerald-500', Medium: 'text-amber-500', High: 'text-red-500', 'Very Low': 'text-sky-500' }

  return (
    <section className="card p-5">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left">
        <SectionTitle icon={GitBranch} title="Alternative actions"
          tag={alts ? `${alts.length} options` : '…'} />
      </button>
      {open && alts && (
        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          {alts.map(a => (
            <div key={a.action} className="rounded-lg p-3.5 border"
              style={{ background: 'var(--alt-bg)', borderColor: 'var(--alt-border)' }}>
              <div className="text-[11px] font-semibold leading-snug">{a.action}</div>
              <div className={`text-[10px] mt-2 font-semibold ${riskColor[a.risk] ?? ''}`}>{a.risk} risk</div>
            </div>
          ))}
        </div>
      )}
      {!open && (
        <p className="text-[11px] mt-3" style={{ color: 'var(--muted)' }}>
          {alts ? `${alts.length} alternative actions are available.` : 'Loading alternatives…'}{' '}
          <button onClick={() => setOpen(true)} className="text-[#6f8cff] hover:underline">View →</button>
        </p>
      )}
    </section>
  )
}

function Confidence({ n }) {
  // TC-EXP-006: derive label and colour from actual confidence value
  const label = n >= 90 ? 'Very High' : n >= 75 ? 'High' : n >= 55 ? 'Medium' : 'Low'
  const labelClass = n >= 90 ? 'bg-emerald-500/10 text-emerald-500'
    : n >= 75 ? 'bg-sky-500/10 text-sky-500'
    : n >= 55 ? 'bg-amber-500/10 text-amber-500'
    : 'bg-red-500/10 text-red-500'

  // Sub-scores derived proportionally from overall confidence
  const dq = Math.min(100, Math.round(n * 1.02))
  const cs = Math.min(100, Math.round(n * 0.97))
  const pm = Math.min(100, Math.round(n * 1.01))

  return (
    <div className="card p-5">
      <SectionTitle icon={CircleGauge} title="Confidence" />
      <div className="flex items-end gap-2 mt-5">
        <span className="text-4xl font-bold">{n}%</span>
        <span className={`pill mb-1 ${labelClass}`}>{label}</span>
      </div>
      <div className="h-2 rounded-full mt-4" style={{ background: 'var(--alt-border)' }}>
        <div className="h-full rounded-full bg-gradient-to-r from-[#4f79ff] to-[#45cf9c]" style={{ width: `${n}%` }} />
      </div>
      <div className="grid grid-cols-3 mt-4 text-center">
        <div><b className="text-[11px]">{dq}%</b><div className="text-[9px]" style={{ color: 'var(--muted)' }}>Data quality</div></div>
        <div className="border-x" style={{ borderColor: 'var(--divider)' }}>
          <b className="text-[11px]">{cs}%</b><div className="text-[9px]" style={{ color: 'var(--muted)' }}>Consensus</div>
        </div>
        <div><b className="text-[11px]">{pm}%</b><div className="text-[9px]" style={{ color: 'var(--muted)' }}>Policy match</div></div>
      </div>
    </div>
  )
}

function Warning({ text }) {
  // TC-EXP-004: "View all assumptions" should expand additional context
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-xl p-4 bg-amber-500/[.07] border border-amber-400/25">
      <div className="flex gap-2 text-amber-500 text-xs font-semibold"><AlertTriangle size={15} />Known limitation</div>
      <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>{text}</p>
      {expanded && (
        <div className="mt-3 space-y-1.5">
          {[
            'Human context and business justifications are not factored into the AI analysis.',
            'Recent environmental or organizational changes may not be reflected in real-time data.',
            'The model confidence score does not account for unmeasured risk vectors.',
          ].map(a => (
            <div key={a} className="flex gap-2 text-[10px]" style={{ color: 'var(--muted)' }}>
              <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              {a}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setExpanded(e => !e)}
        className="text-[10px] text-amber-500 mt-2 hover:underline transition">
        {expanded ? 'Hide assumptions ↑' : 'View all assumptions →'}
      </button>
    </div>
  )
}

function Decision({ r, setData }) {
  // TC-EXP-008/009: sync done state with incoming status prop
  const [status, setStatus] = useState(r.status)
  const [loading, setLoading] = useState(false)
  // TC-EXP-010: reject-with-reason modal state
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  // TC-EXP-011: escalate feedback
  const [escalated, setEscalated] = useState(false)
  // Human context — persisted to backend
  const [contextOpen, setContextOpen]   = useState(false)
  const [humanContext, setHumanContext] = useState('')
  const [contextSaving, setContextSaving] = useState(false)
  const [contextError, setContextError]   = useState(null)
  // History of saved context notes for this recommendation
  const [contextNotes, setContextNotes] = useState([])
  const [notesLoaded, setNotesLoaded]   = useState(false)

  // keep local status in sync if parent data changes (e.g. approved via approval center)
  React.useEffect(() => { setStatus(r.status) }, [r.status])

  // Load persisted context notes on mount
  React.useEffect(() => {
    apiFetch(`/context/${r.id}`)
      .then(d => { setContextNotes(d.notes); setNotesLoaded(true) })
      .catch(() => setNotesLoaded(true))
  }, [r.id])

  const act = async (newStatus, reason = '') => {
    setLoading(true)
    setStatus(newStatus)
    setData(d => ({ ...d, recommendations: d.recommendations.map(x => x.id === r.id ? { ...x, status: newStatus } : x) }))
    try {
      await apiFetch(`/recommendations/${r.id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus, actor: 'Alex Smith', reason }),
      })
    } catch {}
    setLoading(false)
  }

  const handleEscalate = async () => {
    try {
      await apiFetch(`/escalate/${r.id}`, { method: 'POST', body: JSON.stringify({ actor: 'Alex Smith' }) })
    } catch {}
    setEscalated(true)
  }

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return
    act('Rejected', rejectReason)
    setRejectOpen(false)
    setRejectReason('')
  }

  // Persist context note to backend → SQLite → audit trail
  const handleContextSave = async () => {
    if (!humanContext.trim()) return
    setContextSaving(true)
    setContextError(null)
    try {
      const res = await apiFetch(`/context/${r.id}`, {
        method: 'POST',
        body: JSON.stringify({ note: humanContext.trim(), actor: 'Alex Smith' }),
      })
      const newNote = {
        id:         res.id,
        actor:      'Alex Smith',
        note:       humanContext.trim(),
        created_at: res.created_at,
      }
      // Prepend to local note history
      setContextNotes(prev => [newNote, ...prev])
      // Append to global audit trail so Audit page reflects it immediately
      setData(d => ({
        ...d,
        audit: [
          {
            time:   res.created_at,
            actor:  'Alex Smith',
            action: 'Added human context',
            target: r.title,
            result: humanContext.trim().slice(0, 80) + (humanContext.trim().length > 80 ? '…' : ''),
            type:   'human_context',
          },
          ...d.audit,
        ],
      }))
      setHumanContext('')
      setContextOpen(false)
    } catch {
      setContextError('Failed to save — please try again.')
    } finally {
      setContextSaving(false)
    }
  }

  const isApproved = status === 'Approved'
  const isRejected = status === 'Rejected'

  return (
    <div className="card p-5">
      <SectionTitle icon={UserCheck} title="Human decision" />
      <p className="text-[10px] mt-3" style={{ color: 'var(--muted)' }}>
        No action will be taken without administrator approval.
      </p>

      {/* TC-EXP-008: Approved state */}
      {isApproved && (
        <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-500 text-xs flex gap-2">
          <CheckCircle2 size={16} />Approved for staged rollout
        </div>
      )}

      {/* TC-EXP-009: Rejected state */}
      {isRejected && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-500 text-xs flex gap-2">
          <XCircle size={16} />Recommendation rejected
        </div>
      )}

      {!isApproved && !isRejected && (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3 mt-4">
            <NavLink to={`/courtroom/${r.id}`}
              className="text-center border py-2 rounded-lg text-xs transition hover:opacity-80"
              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
              AI Courtroom
            </NavLink>
            <NavLink to={`/simulation/${r.id}`}
              className="text-center border py-2 rounded-lg text-xs transition hover:opacity-80"
              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
              Simulator
            </NavLink>
          </div>
          <div className="space-y-2 mt-2">
            {/* TC-EXP-008: Approve */}
            <button disabled={loading} onClick={() => act('Approved')}
              className="w-full bg-[#3159db] hover:bg-[#4068e9] text-white disabled:opacity-50 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition">
              <Check size={15} />Approve recommendation
            </button>
            {/* TC-EXP-010: Reject with reason */}
            <button disabled={loading} onClick={() => setRejectOpen(true)}
              className="w-full border py-2.5 rounded-lg text-xs disabled:opacity-50 flex items-center justify-center gap-2 transition hover:opacity-80"
              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
              <X size={14} />Reject with reason
            </button>
          </div>

          {/* TC-EXP-010: Reject reason modal */}
          {rejectOpen && (
            <div className="mt-3 rounded-xl border p-4"
              style={{ background: 'var(--sub-bg)', borderColor: 'var(--sub-border)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Rejection reason</div>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Describe why this recommendation is being rejected…"
                className="w-full text-[11px] rounded-lg px-3 py-2 outline-none resize-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
              />
              <div className="flex gap-2 mt-2 justify-end">
                <button onClick={() => { setRejectOpen(false); setRejectReason('') }}
                  className="text-[11px] px-3 py-1.5 rounded-lg border transition hover:opacity-70"
                  style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
                  Cancel
                </button>
                <button onClick={handleRejectSubmit} disabled={!rejectReason.trim()}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-red-500/90 text-white disabled:opacity-40 transition hover:bg-red-600">
                  Confirm rejection
                </button>
              </div>
            </div>
          )}

          {/* TC-EXP-011: Escalate */}
          <div className="mt-3">
            {escalated ? (
              <div className="flex items-center gap-2 text-[11px] text-emerald-500 px-1">
                <CheckCircle2 size={13} />Escalated for human review
              </div>
            ) : (
              <button onClick={handleEscalate}
                className="w-full border py-2 rounded-lg text-[11px] flex items-center justify-center gap-2 transition hover:opacity-80"
                style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
                <Siren size={13} />Escalate to security analyst
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Human context override — persisted ───────────────────────── */}
      <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--divider)' }}>
        {/* Header row: toggle + note count badge */}
        <button onClick={() => setContextOpen(o => !o)}
          className="w-full text-left text-[11px] flex items-center justify-between transition hover:opacity-80"
          style={{ color: '#6f8cff' }}>
          <span className="flex items-center gap-1.5">
            <UserCheck size={13} />Context & Decision History
            {contextNotes.length > 0 && (
              <span className="pill text-[9px] !py-0 bg-sky-500/10 text-sky-500 ml-1">
                {contextNotes.length}
              </span>
            )}
          </span>
          <ChevronRight size={13} className={`transition-transform ${contextOpen ? 'rotate-90' : ''}`} />
        </button>

        {contextOpen && (
          <div className="mt-3 space-y-3">
            {/* History of persisted notes */}
            {notesLoaded && contextNotes.length > 0 && (
              <div className="space-y-2">
                {contextNotes.map(n => (
                  <div key={n.id} className="rounded-lg p-3 text-[10px] leading-relaxed"
                    style={{ background: 'var(--acc-bg)', border: '1px solid var(--sub-border)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold" style={{ color: '#91aaff' }}>{n.actor}</span>
                      <span className="font-mono" style={{ color: 'var(--muted)' }}>{n.created_at}</span>
                    </div>
                    <p style={{ color: 'var(--text)' }}>{n.note}</p>
                  </div>
                ))}
              </div>
            )}

            {/* New note input */}
            <textarea
              rows={3}
              value={humanContext}
              onChange={e => setHumanContext(e.target.value)}
              placeholder="Provide business justification, exception details, or additional context not captured by the AI…"
              className="w-full text-[11px] rounded-lg px-3 py-2 outline-none resize-none"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
            />
            {contextError && (
              <p className="text-[10px] text-red-500">{contextError}</p>
            )}
            <button
              onClick={handleContextSave}
              disabled={!humanContext.trim() || contextSaving}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-[#3156d9] text-white disabled:opacity-40 transition hover:bg-[#3d64ec]">
              {contextSaving ? 'Saving…' : 'Save context'}
            </button>
          </div>
        )}

        {/* Collapsed summary when notes exist */}
        {!contextOpen && contextNotes.length > 0 && (
          <div className="mt-2 text-[10px] text-sky-500 flex items-center gap-1">
            <CheckCircle2 size={11} />
            {contextNotes.length} context note{contextNotes.length !== 1 ? 's' : ''} recorded
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4 text-[9px]" style={{ color: 'var(--muted)' }}>
        <LockKeyhole size={12} />Decision is signed and added to the audit trail.
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Courtroom
// ---------------------------------------------------------------------------
function Courtroom({ data }) {
  const { id } = useParams()
  const [cd, setCd] = useState(null)
  const [offline, setOffline] = useState(false)
  // TC-COURT-009: track whether id is genuinely invalid (API returned 404)
  const [notFound, setNotFound] = useState(false)
  // Challenge state per prosecution item (TC-COURT — "challengeable AI")
  const [challenged, setChallenged] = useState({})
  const [challengeText, setChallengeText] = useState({})
  // Rec metadata for severity badge (TC-COURT-016)
  const rec = data.recommendations.find(r => r.id === +id)

  useEffect(() => {
    // TC-COURT-009: distinguish 404 from network error
    apiFetch(`/courtroom/${id}`)
      .then(d => { setCd(d); setOffline(false) })
      .catch(async () => {
        // try to check if the rec exists in local data
        const localRec = data.recommendations.find(r => r.id === +id)
        if (!localRec) {
          // TC-COURT-009: truly invalid id — no local fallback either
          setNotFound(true)
          return
        }
        // TC-COURT-012: offline fallback with banner
        setCd({
          recommendation: localRec.title,
          severity: localRec.severity,
          category: localRec.category,
          prosecution: localRec.evidence,
          confidence: localRec.confidence,
          // TC-COURT-005: verdict is a human-readable recommendation statement, not just the title
          verdict: `Based on ${localRec.evidence.length} verified evidence point${localRec.evidence.length !== 1 ? 's' : ''}, TrustLens recommends immediate action. The ${localRec.severity.toLowerCase()} risk level and ${localRec.confidence}% confidence support this recommendation.`,
          defense: [
            localRec.limitation,
            'Human context and business justifications are not factored into the AI analysis.',
            'Recent environmental or organisational changes may not be reflected in real-time data.',
          ],
        })
        setOffline(true)
      })
  }, [id])

  // TC-COURT-019: loading state
  if (!cd && !notFound) return <Page><LoadingState /></Page>

  // TC-COURT-009: invalid id — dedicated not-found card
  if (notFound) {
    return (
      <Page>
        <NavLink to="/" className="inline-flex items-center gap-2 text-xs mb-5 transition hover:opacity-80"
          style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={14} />Back to dashboard
        </NavLink>
        <div className="card p-10 text-center mt-8">
          <AlertTriangle size={36} className="mx-auto mb-4 text-amber-500 opacity-60" />
          <div className="font-semibold text-base mb-2">Recommendation not found</div>
          <p className="text-[12px] mb-5" style={{ color: 'var(--muted)' }}>
            No courtroom record exists for ID <code className="font-mono">#{id}</code>.
          </p>
          <NavLink to="/"
            className="inline-flex items-center gap-2 bg-[#3156d9] hover:bg-[#3d64ec] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition">
            <ArrowLeft size={13} />Return to Dashboard
          </NavLink>
        </div>
      </Page>
    )
  }

  const prosecution = cd.prosecution ?? []
  const defense = cd.defense ?? []

  // severity of the matched rec (for badge — TC-COURT-016)
  const severity = rec?.severity ?? cd.severity ?? 'Unknown'
  const severityBadgeClass = {
    Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    High:     'bg-orange-500/10 text-orange-500 border-orange-500/20',
    Medium:   'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Low:      'bg-sky-500/10 text-sky-500 border-sky-500/20',
  }[severity] ?? 'bg-slate-500/10 text-slate-400 border-slate-400/20'

  const confidenceLabel = cd.confidence >= 90 ? 'Very High'
    : cd.confidence >= 75 ? 'High'
    : cd.confidence >= 55 ? 'Medium' : 'Low'

  const handleChallenge = (idx) => {
    setChallenged(c => ({ ...c, [idx]: true }))
  }
  const handleChallengeSubmit = (idx) => {
    if (!challengeText[idx]?.trim()) return
    setChallenged(c => ({ ...c, [idx]: 'submitted' }))
  }

  return (
    <Page>
      {/* TC-COURT-012: offline banner */}
      {offline && <OfflineBanner />}

      {/* TC-COURT-010: back nav */}
      <NavLink to={`/explanation/${id}`} className="inline-flex items-center gap-2 text-xs mb-5 transition hover:opacity-80"
        style={{ color: 'var(--muted)' }}>
        <ArrowLeft size={14} />Back to explanation
      </NavLink>

      {/* TC-COURT-016/017: eyebrow includes severity badge for data consistency */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="label" style={{ color: '#6689ff' }}>AI COURTROOM</span>
            <span className={`pill border text-[10px] !py-0.5 ${severityBadgeClass}`}>{severity}</span>
          </div>
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight">{cd.recommendation}</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
            Evidence is weighed against known limitations. Challenge any point before deciding.
          </p>
        </div>
        {/* TC-COURT-006: confidence shown prominently in header */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="card px-4 py-3 text-center">
            <div className="text-2xl font-bold text-emerald-500">{cd.confidence}%</div>
            <div className="text-[9px] mt-0.5" style={{ color: 'var(--muted)' }}>{confidenceLabel} confidence</div>
          </div>
        </div>
      </div>

      {/* balance indicator */}
      <div className="card p-3 mb-5 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--alt-border)' }}>
          <div className="h-full bg-gradient-to-r from-emerald-500 to-red-500 rounded-full" style={{ width: '100%' }} />
        </div>
        <div className="text-[10px] shrink-0" style={{ color: 'var(--muted)' }}>
          {prosecution.length} for · {defense.length} against
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* TC-COURT-003/007: prosecution — with empty state guard */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Check size={14} className="text-emerald-500" />
            </div>
            <h3 className="font-bold text-emerald-500">Case for action</h3>
            <span className="ml-auto pill bg-emerald-500/10 text-emerald-500 text-[10px]">
              {prosecution.length} point{prosecution.length !== 1 ? 's' : ''}
            </span>
          </div>
          {prosecution.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8 text-center">
              <div style={{ color: 'var(--muted)' }}>
                <CheckCircle2 size={28} className="mx-auto mb-2 opacity-30" />
                <div className="text-xs">No prosecution evidence available.</div>
              </div>
            </div>
          ) : (
            <ul className="space-y-4 flex-1">
              {prosecution.map((x, i) => (
                <li key={x} className="text-xs">
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                      style={{ background: 'rgba(52,200,140,.12)', color: '#34c88c' }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      {/* TC-COURT-015: long text wraps naturally inside flex-1 */}
                      <p className="leading-relaxed">{x}</p>
                      {/* "Challengeable AI" — challenge each evidence point */}
                      {challenged[i] === 'submitted' ? (
                        <div className="mt-2 text-[10px] text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 size={11} />Challenge recorded
                        </div>
                      ) : challenged[i] ? (
                        <div className="mt-2">
                          <textarea
                            rows={2}
                            value={challengeText[i] ?? ''}
                            onChange={e => setChallengeText(t => ({ ...t, [i]: e.target.value }))}
                            placeholder="Explain why this evidence point may be incorrect or incomplete…"
                            className="w-full text-[10px] rounded-lg px-2.5 py-1.5 outline-none resize-none"
                            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
                          />
                          <div className="flex gap-2 mt-1.5">
                            <button onClick={() => setChallenged(c => ({ ...c, [i]: false }))}
                              className="text-[10px] px-2 py-1 rounded border transition hover:opacity-70"
                              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>Cancel</button>
                            <button onClick={() => handleChallengeSubmit(i)}
                              disabled={!challengeText[i]?.trim()}
                              className="text-[10px] px-2 py-1 rounded bg-emerald-600/80 text-white disabled:opacity-40 transition hover:bg-emerald-600">
                              Submit challenge
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => handleChallenge(i)}
                          className="mt-1.5 text-[10px] transition hover:underline"
                          style={{ color: 'var(--muted)' }}>
                          Challenge this point →
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* TC-COURT-004/008: defense — with empty state guard */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={14} className="text-red-500" />
            </div>
            <h3 className="font-bold text-red-500">Case against action</h3>
            <span className="ml-auto pill bg-red-500/10 text-red-500 text-[10px]">
              {defense.length} point{defense.length !== 1 ? 's' : ''}
            </span>
          </div>
          {defense.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8 text-center">
              <div style={{ color: 'var(--muted)' }}>
                <AlertTriangle size={28} className="mx-auto mb-2 opacity-30" />
                <div className="text-xs">No defense arguments recorded.</div>
              </div>
            </div>
          ) : (
            <ul className="space-y-3 flex-1">
              {defense.map((x, i) => (
                <li key={x} className="flex gap-2.5 text-xs">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                    style={{ background: 'rgba(239,68,68,.10)', color: '#f87171' }}>{i + 1}</span>
                  {/* TC-COURT-015: long text wraps inside flex-1 */}
                  <p className="leading-relaxed flex-1">{x}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* TC-COURT-005/006: verdict card — full reasoning explanation, not just the title */}
      <div className="card p-5 mt-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex-1 min-w-0">
            <div className="label mb-2">Model verdict</div>
            <p className="text-sm font-semibold leading-relaxed">{cd.verdict}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className={`pill border text-[10px] !py-0.5 ${severityBadgeClass}`}>{severity} severity</span>
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                {prosecution.length} evidence point{prosecution.length !== 1 ? 's' : ''} · {defense.length} counter-argument{defense.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="text-center shrink-0">
            <div className="text-4xl font-bold text-emerald-500">{cd.confidence}%</div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Overall confidence</div>
            <div className="h-1.5 rounded-full mt-2 w-24 mx-auto" style={{ background: 'var(--alt-border)' }}>
              <div className="h-full rounded-full bg-gradient-to-r from-[#4f79ff] to-[#45cf9c]"
                style={{ width: `${cd.confidence}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* TC-COURT-011: navigation actions */}
      <div className="mt-5 flex flex-wrap gap-3 justify-between items-center">
        <NavLink to={`/explanation/${id}`}
          className="inline-flex items-center gap-2 border px-4 py-2.5 rounded-lg text-xs transition hover:opacity-80"
          style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
          <ArrowLeft size={13} />Back to explanation
        </NavLink>
        <NavLink to={`/simulation/${id}`}
          className="inline-flex items-center gap-2 bg-[#3156d9] hover:bg-[#3d64ec] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition">
          Run decision simulator <ChevronRight size={13} />
        </NavLink>
      </div>
    </Page>
  )
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------
function Simulation({ data, setData }) {
  const { id } = useParams()
  const [sd, setSd] = useState(null)
  const [altData, setAltData] = useState(null)
  const [offline, setOffline] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // TC-SIM-002: find rec from global state for badge consistency
  const rec = data.recommendations.find(r => r.id === +id)

  useEffect(() => {
    // TC-SIM-014: use independent fetches so a 404 from simulate
    // doesn't silently suppress a valid alternatives response and vice-versa.
    // If simulate returns 404 → notFound. If network fails → offline fallback.
    const doFetch = async () => {
      try {
        const [sim, alt] = await Promise.all([
          apiFetch(`/simulate/${id}`),
          apiFetch(`/alternatives/${id}`),
        ])
        setSd(sim)
        setAltData(alt)
        setOffline(false)
      } catch (err) {
        // TC-SIM-011: if local data also has no matching rec, this is a genuine 404
        if (!data.recommendations.find(r => r.id === +id)) {
          setNotFound(true)
          return
        }
        // TC-SIM-012: offline — build fallback from local rec data
        const r = data.recommendations.find(rv => rv.id === +id)
        const sevRisk = { Critical: 91, High: 78, Medium: 58, Low: 34 }
        const appBiz  = r.severity === 'Critical' || r.severity === 'High' ? 'Low' : 'Very Low'
        const rejBiz  = { Critical: 'High', High: 'High', Medium: 'Medium', Low: 'Low' }[r.severity]
        setSd({
          recommendation:   r.title,
          severity:         r.severity,
          category:         r.category,
          confidence:       r.confidence,
          affected:         r.affected,
          approve: {
            risk_reduction:      `${r.confidence}%`,
            business_impact:     appBiz,
            affected_resources:  r.affected,
            security_benefit:    r.impact,
            time_to_effect:      '24–48 hours after deployment',
          },
          reject: {
            risk_increase:       `${sevRisk[r.severity] ?? 60}%`,
            business_impact:     rejBiz,
            affected_resources:  r.affected,
            security_risk:       `Threat remains unresolved across ${r.affected} affected resource${r.affected !== 1 ? 's' : ''}.`,
            time_to_exposure:    'Immediate — threat is already active',
          },
        })
        setAltData({ alternatives: [
          { action: 'Emergency change procedure (expedited approval)', risk: 'Low',
            description: 'Bypass standard change window given active exploit potential.' },
          { action: 'Pilot deployment (10% of affected resources)', risk: 'Low',
            description: 'Validate rollout before full deployment.' },
          { action: 'Escalate to security analyst for manual review', risk: 'Very Low',
            description: 'Route to a human expert before any automated action.' },
        ]})
        setOffline(true)
      }
    }
    doFetch()
  }, [id])

  // TC-SIM-013: loading state — shows until either data or notFound resolves
  if (!sd && !notFound) return <Page><LoadingState /></Page>

  // TC-SIM-011: genuine not-found
  if (notFound) {
    return (
      <Page>
        <NavLink to="/" className="inline-flex items-center gap-2 text-xs mb-5 transition hover:opacity-80"
          style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={14} />Back to dashboard
        </NavLink>
        <div className="card p-10 text-center mt-8">
          <AlertTriangle size={36} className="mx-auto mb-4 text-amber-500 opacity-60" />
          <div className="font-semibold text-base mb-2">Recommendation not found</div>
          <p className="text-[12px] mb-5" style={{ color: 'var(--muted)' }}>
            No simulation data exists for ID <code className="font-mono">#{id}</code>.
          </p>
          <NavLink to="/"
            className="inline-flex items-center gap-2 bg-[#3156d9] hover:bg-[#3d64ec] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition">
            <ArrowLeft size={13} />Return to Dashboard
          </NavLink>
        </div>
      </Page>
    )
  }

  // TC-SIM-017/018: derive severity/confidence from API response, fallback to local rec
  const severity   = sd.severity   ?? rec?.severity   ?? 'Unknown'
  const confidence = sd.confidence ?? rec?.confidence ?? 0
  const affected   = sd.affected   ?? rec?.affected   ?? 0

  const sevBadge = {
    Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    High:     'bg-orange-500/10 text-orange-500 border-orange-500/20',
    Medium:   'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Low:      'bg-sky-500/10 text-sky-500 border-sky-500/20',
  }[severity] ?? 'bg-slate-500/10 text-slate-400'

  const riskColor = {
    Low: 'text-emerald-500', Medium: 'text-amber-500',
    High: 'text-red-500', 'Very Low': 'text-sky-500',
  }

  return (
    <Page>
      {/* TC-SIM-012 */}
      {offline && <OfflineBanner />}

      {/* TC-SIM-016: back to explanation */}
      <NavLink to={`/explanation/${id}`} className="inline-flex items-center gap-2 text-xs mb-5 transition hover:opacity-80"
        style={{ color: 'var(--muted)' }}>
        <ArrowLeft size={14} />Back to explanation
      </NavLink>

      {/* Header — TC-SIM-017/018 severity + confidence consistent with other screens */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="label" style={{ color: '#6689ff' }}>DECISION SIMULATOR</span>
            <span className={`pill border text-[10px] !py-0.5 ${sevBadge}`}>{severity}</span>
          </div>
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight">{sd.recommendation}</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
            Compare projected outcomes before committing.{' '}
            <span className="font-semibold" style={{ color: 'var(--text)' }}>{affected}</span>{' '}
            resource{affected !== 1 ? 's' : ''} affected.
          </p>
        </div>
        {/* TC-SIM-017: confidence badge matches Explanation & Courtroom */}
        <div className="card px-4 py-3 text-center shrink-0">
          <div className="text-2xl font-bold text-emerald-500">{confidence}%</div>
          <div className="text-[9px] mt-0.5" style={{ color: 'var(--muted)' }}>Model confidence</div>
        </div>
      </div>

      {/* TC-SIM-003 / TC-SIM-004 */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* ── Approve scenario ── */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            <h3 className="font-bold text-emerald-500">If approved</h3>
          </div>
          <div className="flex-1">
            {/* TC-SIM-006 */}
            <SimRow label="Risk reduction"      value={sd.approve.risk_reduction}                   positive />
            {/* TC-SIM-007 */}
            <SimRow label="Business impact"     value={sd.approve.business_impact} />
            <SimRow label="Resources addressed" value={`${sd.approve.affected_resources ?? affected} items`} />
            <SimRow label="Time to effect"      value={sd.approve.time_to_effect ?? 'Within 48h'} />
          </div>
          {/* TC-SIM-008 */}
          <div className="rounded-lg p-3.5 mt-4" style={{ background: 'var(--sim-approve-bg)' }}>
            <div className="label mb-1.5">Security benefit</div>
            <div className="text-xs text-emerald-500 leading-relaxed">{sd.approve.security_benefit}</div>
          </div>
        </div>

        {/* ── Reject scenario ── */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <XCircle size={14} className="text-red-500" />
            </div>
            <h3 className="font-bold text-red-500">If rejected</h3>
          </div>
          <div className="flex-1">
            {/* TC-SIM-006 */}
            <SimRow label="Residual risk increase" value={sd.reject.risk_increase}                   negative />
            {/* TC-SIM-007 */}
            <SimRow label="Business impact"        value={sd.reject.business_impact} />
            <SimRow label="Resources at risk"      value={`${sd.reject.affected_resources ?? affected} items`} />
            <SimRow label="Time to exposure"       value={sd.reject.time_to_exposure ?? 'Immediate'} negative />
          </div>
          {/* TC-SIM-008 */}
          <div className="rounded-lg p-3.5 mt-4" style={{ background: 'var(--sim-reject-bg)' }}>
            <div className="label mb-1.5">Security risk</div>
            <div className="text-xs text-red-500 leading-relaxed">{sd.reject.security_risk}</div>
          </div>
        </div>
      </div>

      {/* TC-SIM-005: alternatives with descriptions */}
      {altData && altData.alternatives.length > 0 && (
        <div className="card p-5 mt-5">
          <SectionTitle icon={GitBranch} title="Alternative actions"
            tag={`${altData.alternatives.length} options`} />
          <p className="text-[11px] mt-2 mb-4" style={{ color: 'var(--muted)' }}>
            These paths let you act with reduced scope or risk before committing to a full decision.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {altData.alternatives.map(a => (
              <div key={a.action} className="rounded-lg p-4 border flex flex-col gap-2"
                style={{ background: 'var(--alt-bg)', borderColor: 'var(--alt-border)' }}>
                <div className="text-[11px] font-semibold leading-snug">{a.action}</div>
                {a.description && (
                  <p className="text-[10px] leading-relaxed flex-1" style={{ color: 'var(--muted)' }}>
                    {a.description}
                  </p>
                )}
                <div className={`text-[10px] font-semibold mt-auto ${riskColor[a.risk] ?? ''}`}>
                  {a.risk} risk
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TC-SIM-009/010 + human-in-the-loop decision */}
      <div className="card p-5 mt-5">
        <SectionTitle icon={UserCheck} title="Make your decision" />
        <p className="text-[11px] mt-3 mb-4" style={{ color: 'var(--muted)' }}>
          You have reviewed the simulation. No action will execute without your explicit approval.
        </p>
        {/* TC-SIM-009/010: pass setData so global state updates on decision */}
        <SimDecisionPanel id={id} rec={rec} setData={setData} />
      </div>

      {/* TC-SIM-015/016: bidirectional navigation */}
      <div className="mt-5 flex flex-wrap gap-3 justify-between items-center">
        <NavLink to={`/courtroom/${id}`}
          className="inline-flex items-center gap-2 border px-4 py-2.5 rounded-lg text-xs transition hover:opacity-80"
          style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
          <ArrowLeft size={13} />Back to AI Courtroom
        </NavLink>
        <NavLink to="/approvals"
          className="inline-flex items-center gap-2 bg-[#3156d9] hover:bg-[#3d64ec] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition">
          Go to Approval Center <ChevronRight size={13} />
        </NavLink>
      </div>
    </Page>
  )
}

// SimDecisionPanel — inline approve/reject/escalate with global state sync
function SimDecisionPanel({ id, rec, setData }) {
  const [status, setStatus]             = useState(rec?.status ?? 'Pending')
  const [loading, setLoading]           = useState(false)
  const [escalated, setEscalated]       = useState(false)
  const [rejectOpen, setRejectOpen]     = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // TC-SIM-017: keep local status in sync when parent data changes
  React.useEffect(() => { if (rec) setStatus(rec.status) }, [rec?.status])

  const act = async (newStatus, reason = '') => {
    setLoading(true)
    // TC-SIM-010: optimistic global state update so audit trail reflects decision
    if (setData) {
      setData(d => ({
        ...d,
        recommendations: d.recommendations.map(x =>
          x.id === +id ? { ...x, status: newStatus } : x
        ),
      }))
    }
    setStatus(newStatus)
    try {
      await apiFetch(`/recommendations/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus, actor: 'Alex Smith', reason }),
      })
    } catch {}
    setLoading(false)
  }

  // TC-SIM-009/010: escalate POSTs to /api/escalate/:id which writes to audit table
  const handleEscalate = async () => {
    try {
      await apiFetch(`/escalate/${id}`, {
        method: 'POST',
        body: JSON.stringify({ actor: 'Alex Smith' }),
      })
    } catch {}
    setEscalated(true)
  }

  if (status === 'Approved') {
    return (
      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-500 text-xs flex gap-2 items-center">
        <CheckCircle2 size={16} />Approved — queued for staged rollout
      </div>
    )
  }
  if (status === 'Rejected') {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-500 text-xs flex gap-2 items-center">
        <XCircle size={16} />Rejected — recommendation dismissed
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button disabled={loading} onClick={() => act('Approved')}
          className="w-full bg-[#3159db] hover:bg-[#4068e9] text-white disabled:opacity-50 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition">
          <Check size={14} />Approve
        </button>
        <button disabled={loading} onClick={() => setRejectOpen(o => !o)}
          className="w-full border py-2.5 rounded-lg text-xs disabled:opacity-50 flex items-center justify-center gap-2 transition hover:opacity-80"
          style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
          <X size={13} />Reject with reason
        </button>
      </div>

      {rejectOpen && (
        <div className="rounded-xl border p-4"
          style={{ background: 'var(--sub-bg)', borderColor: 'var(--sub-border)' }}>
          <div className="text-xs font-semibold mb-2">Rejection reason</div>
          <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            placeholder="Describe why this recommendation is being rejected…"
            className="w-full text-[11px] rounded-lg px-3 py-2 outline-none resize-none"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }} />
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={() => { setRejectOpen(false); setRejectReason('') }}
              className="text-[11px] px-3 py-1.5 rounded-lg border transition hover:opacity-70"
              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>Cancel</button>
            <button onClick={() => { act('Rejected', rejectReason); setRejectOpen(false); setRejectReason('') }}
              disabled={!rejectReason.trim()}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-red-500/90 text-white disabled:opacity-40 transition hover:bg-red-600">
              Confirm rejection
            </button>
          </div>
        </div>
      )}

      {escalated ? (
        <div className="flex items-center gap-2 text-[11px] text-emerald-500 pt-1">
          <CheckCircle2 size={13} />Escalated — logged to audit trail
        </div>
      ) : (
        <button onClick={handleEscalate}
          className="w-full border py-2 rounded-lg text-[11px] flex items-center justify-center gap-2 transition hover:opacity-80"
          style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
          <Siren size={13} />Escalate to security analyst
        </button>
      )}

      <div className="flex gap-2 mt-1 text-[9px]" style={{ color: 'var(--muted)' }}>
        <LockKeyhole size={11} />Decision is signed and added to the audit trail.
      </div>
    </div>
  )
}

function SimRow({ label, value, positive, negative }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: 'var(--divider)' }}>
      <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{label}</span>
      <span className={`text-sm font-bold ${positive ? 'text-emerald-500' : negative ? 'text-red-500' : ''}`}>{value}</span>
    </div>
  )
}

// Keep EscalateButton for backward compatibility (used elsewhere if any)
function EscalateButton({ id }) {
  const [done, setDone] = useState(false)
  const escalate = async () => {
    try { await apiFetch(`/escalate/${id}`, { method: 'POST', body: JSON.stringify({ actor: 'Alex Smith' }) }) } catch {}
    setDone(true)
  }
  return (
    <div className="mt-5 flex justify-end">
      {done ? (
        <div className="flex items-center gap-2 text-xs text-emerald-500 pill bg-emerald-500/10">
          <CheckCircle2 size={14} />Escalated for human review
        </div>
      ) : (
        <button onClick={escalate}
          className="flex items-center gap-2 border px-4 py-2.5 rounded-lg text-xs transition hover:opacity-80"
          style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
          <Siren size={14} />Escalate to security analyst
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Approvals
// ---------------------------------------------------------------------------
function Approvals({ data, setData }) {
  // TC-APP-011/012: fetch fresh recommendations on mount so we show live statuses
  const [refreshing, setRefreshing] = useState(false)
  const [offline, setOffline]       = useState(false)

  // refresh queue from API on mount
  useEffect(() => {
    setRefreshing(true)
    apiFetch('/dashboard')
      .then(d => { setData(d); setOffline(false) })
      .catch(() => setOffline(true))
      .finally(() => setRefreshing(false))
  }, [])

  // TC-APP-002: pending = anything not yet in a terminal state
  const pending = data.recommendations.filter(
    r => !['Approved', 'Rejected'].includes(r.status)
  )

  // TC-APP-007: derive this-week stats from actual audit data in state
  const auditApproved  = data.audit.filter(a => a.type === 'approval').length
  const auditRejected  = data.audit.filter(a => a.type === 'reject').length
  const auditEscalated = data.audit.filter(a => a.type === 'escalation').length

  return (
    <Page>
      {/* TC-APP-011 */}
      {offline && <OfflineBanner />}

      <Header eyebrow="HUMAN OVERSIGHT" title="Approval center"
        desc="Review high-impact AI recommendations before execution."
        action={
          <div className="flex items-center gap-2">
            <span className="pill" style={{ background: 'var(--acc-bg)', color: '#91a7ff' }}>
              {pending.length} awaiting review
            </span>
            {/* TC-APP-008: manual refresh */}
            <button
              onClick={() => {
                setRefreshing(true)
                apiFetch('/dashboard')
                  .then(d => { setData(d); setOffline(false) })
                  .catch(() => setOffline(true))
                  .finally(() => setRefreshing(false))
              }}
              disabled={refreshing}
              className="border rounded-lg px-3 py-2 text-[11px] flex items-center gap-1.5 transition hover:opacity-80 disabled:opacity-40"
              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
              {/* simple inline SVG refresh icon — no extra import needed */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={refreshing ? 'animate-spin' : ''}>
                <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        }
      />

      <div className="grid xl:grid-cols-[1fr_300px] gap-5">
        <div className="card overflow-hidden">
          {/* TC-APP-002: table header — added Severity column */}
          <div className="grid grid-cols-[1fr_80px_90px_120px] text-[10px] label px-5 py-3 border-b"
            style={{ borderColor: 'var(--divider)' }}>
            <span>Recommendation</span>
            <span>Severity</span>
            <span>Confidence</span>
            <span>Decision</span>
          </div>

          {/* TC-APP-012: loading state */}
          {refreshing && pending.length === 0 ? (
            <div className="p-10 text-center" style={{ color: 'var(--muted)' }}>
              <div className="w-6 h-6 rounded-full border-2 border-[#3452d4] border-t-transparent animate-spin mx-auto mb-3" />
              <div className="text-sm">Loading queue…</div>
            </div>
          ) : pending.length === 0 ? (
            <div className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>
              <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-400 opacity-50" />
              All caught up — no pending recommendations.
            </div>
          ) : (
            pending.map(r => (
              <ApprovalRow key={r.id} r={r} setData={setData} />
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Oversight policy */}
          <div className="card p-5">
            <div className="font-semibold text-sm">Oversight policy</div>
            <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
              High-impact changes require one Global Administrator. Critical identity changes require two approvers.
            </p>
            <div className="mt-4 text-[10px] rounded-lg p-3"
              style={{ background: 'var(--status-bg)', color: 'var(--muted)' }}>
              Policy TL-GOV-04 · Active
            </div>
          </div>

          {/* TC-APP-007: stats derived from real audit data */}
          <div className="card p-5">
            <div className="font-semibold text-sm mb-4">Activity (audit log)</div>
            <div className="grid grid-cols-2 gap-3">
              <Mini n={String(auditApproved)}  l="Approved" />
              <Mini n={String(auditRejected)}  l="Rejected" />
              <Mini n={String(auditEscalated)} l="Escalated" />
              <Mini n={String(pending.length)} l="Pending" />
            </div>
          </div>

          {/* TC-APP-009: escalated items notice */}
          {auditEscalated > 0 && (
            <div className="card p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold mb-2">
                <Siren size={14} style={{ color: '#f4a94b' }} />
                <span style={{ color: '#f4a94b' }}>{auditEscalated} item{auditEscalated !== 1 ? 's' : ''} escalated</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                Escalated recommendations are pending security analyst review before returning to this queue.
              </p>
            </div>
          )}
        </div>
      </div>
    </Page>
  )
}

// ContextBadge — shown in ApprovalRow to surface persisted human context notes
function ContextBadge({ rid }) {
  const [notes, setNotes]       = useState([])
  const [expanded, setExpanded] = useState(false)
  const [loaded, setLoaded]     = useState(false)

  React.useEffect(() => {
    apiFetch(`/context/${rid}`)
      .then(d => { setNotes(d.notes); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [rid])

  if (!loaded || notes.length === 0) return null

  return (
    <div className="mx-5 mb-3">
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 text-[10px] transition hover:opacity-80"
        style={{ color: '#6f8cff' }}>
        <UserCheck size={11} />
        {notes.length} human context note{notes.length !== 1 ? 's' : ''}
        <ChevronRight size={11} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {notes.map(n => (
            <div key={n.id} className="rounded-lg p-2.5 text-[10px] leading-relaxed"
              style={{ background: 'var(--acc-bg)', border: '1px solid var(--sub-border)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold" style={{ color: '#91aaff' }}>{n.actor}</span>
                <span className="font-mono" style={{ color: 'var(--muted)' }}>{n.created_at}</span>
              </div>
              <p style={{ color: 'var(--text)' }}>{n.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ApprovalRow({ r, setData }) {
  const nav = useNavigate()
  const [loading, setLoading]           = useState(false)
  // TC-APP-005: reject-reason capture
  const [rejectOpen, setRejectOpen]     = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const severityBadge = {
    Critical: 'bg-red-500/10 text-red-500',
    High:     'bg-orange-500/10 text-orange-500',
    Medium:   'bg-amber-500/10 text-amber-500',
    Low:      'bg-sky-500/10 text-sky-500',
  }[r.severity] ?? 'bg-slate-500/10 text-slate-400'

  const decide = async (status, reason = '') => {
    setLoading(true)
    // TC-APP-006: optimistic global state update
    setData(d => ({
      ...d,
      recommendations: d.recommendations.map(x => x.id === r.id ? { ...x, status } : x),
      // TC-APP-015/016: append audit entry to live data.audit so Audit page reflects it
      audit: [
        {
          time:   new Date().toTimeString().slice(0, 8),
          actor:  'Alex Smith',
          action: `${status} recommendation`,
          target: r.title,
          result: reason ? `Reason: ${reason.slice(0, 40)}${reason.length > 40 ? '…' : ''}` : 'Decision recorded',
          type:   status === 'Approved' ? 'approval' : 'reject',
        },
        ...d.audit,
      ],
    }))
    try {
      await apiFetch(`/recommendations/${r.id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ status, actor: 'Alex Smith', reason }),
      })
    } catch {}
    setLoading(false)
  }

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return
    decide('Rejected', rejectReason)
    setRejectOpen(false)
    setRejectReason('')
  }

  return (
    <div className="border-b last:border-0" style={{ borderColor: 'var(--divider)' }}>
      {/* TC-APP-002: main row — added severity badge */}
      <div className="grid grid-cols-[1fr_80px_90px_120px] items-center px-5 py-4">
        {/* title + meta */}
        <button onClick={() => nav(`/explanation/${r.id}`)} className="text-left pr-3 min-w-0">
          <div className="text-xs font-semibold hover:text-[#6f8cff] transition truncate">{r.title}</div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
              {r.affected} resources
            </span>
            {/* TC-APP-018: show current status chip for Dashboard consistency */}
            <span className="text-[9px] pill !py-0"
              style={{ background: 'var(--acc-bg)', color: 'var(--muted)' }}>
              {r.status}
            </span>
          </div>
        </button>

        {/* TC-APP-002: severity badge */}
        <div>
          <span className={`pill text-[9px] !py-0.5 ${severityBadge}`}>{r.severity}</span>
        </div>

        {/* confidence */}
        <div className="text-xs font-bold text-emerald-500">{r.confidence}%</div>

        {/* TC-APP-003/004/005: decision buttons */}
        <div className="flex gap-1.5 items-center">
          <button aria-label="Approve" disabled={loading} onClick={() => decide('Approved')}
            className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-40 flex items-center justify-center transition">
            <Check size={14} />
          </button>
          {/* TC-APP-005: opens inline reason form instead of instant reject */}
          <button aria-label="Reject" disabled={loading} onClick={() => setRejectOpen(o => !o)}
            className="w-8 h-8 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-40 flex items-center justify-center transition">
            <X size={14} />
          </button>
          {/* TC-APP-017: view in explanation for context */}
          <button
            aria-label="View details"
            onClick={() => nav(`/explanation/${r.id}`)}
            className="w-8 h-8 rounded-md flex items-center justify-center transition hover:opacity-80"
            style={{ background: 'var(--acc-bg)', color: '#6f8cff' }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Human context notes for this recommendation */}
      <ContextBadge rid={r.id} />

      {/* TC-APP-005: inline reject-reason form */}
      {rejectOpen && (
        <div className="mx-5 mb-4 rounded-xl border p-4"
          style={{ background: 'var(--sub-bg)', borderColor: 'var(--sub-border)' }}>
          <div className="text-xs font-semibold mb-2">Rejection reason</div>
          <textarea
            rows={2}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Describe why this recommendation is being rejected…"
            className="w-full text-[11px] rounded-lg px-3 py-2 outline-none resize-none"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => { setRejectOpen(false); setRejectReason('') }}
              className="text-[11px] px-3 py-1.5 rounded-lg border transition hover:opacity-70"
              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim()}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-red-500/90 text-white disabled:opacity-40 transition hover:bg-red-600">
              Confirm rejection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

// Type taxonomy for icons and colours
const AUDIT_TYPE_META = {
  approval:      { icon: CheckCircle2, bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Approved' },
  reject:        { icon: XCircle,      bg: 'bg-red-500/10',     text: 'text-red-500',     label: 'Rejected' },
  ai:            { icon: Bot,          bg: 'var(--pill-ai-bg)', text: 'var(--pill-ai-text)', label: 'AI Action' },
  system:        { icon: Database,     bg: 'var(--status-bg)',  text: 'var(--muted)',        label: 'System' },
  edit:          { icon: Settings,     bg: 'var(--acc-bg)',     text: '#91aaff',             label: 'Edit' },
  escalation:    { icon: Siren,        bg: 'bg-amber-500/10',   text: 'text-amber-500',      label: 'Escalated' },
  human_context: { icon: UserCheck,    bg: 'bg-sky-500/10',     text: 'text-sky-500',        label: 'Context' },
}

const FILTER_TYPES = ['All', 'approval', 'reject', 'ai', 'system', 'edit', 'escalation', 'human_context']
const FILTER_LABELS = { All: 'All', approval: 'Approved', reject: 'Rejected', ai: 'AI Actions',
  system: 'System', edit: 'Edits', escalation: 'Escalations', human_context: 'Human Context' }

function AuditActorCell({ entry }) {
  const meta = AUDIT_TYPE_META[entry.type] ?? AUDIT_TYPE_META.system
  const Icon = meta.icon
  // CSS-var colours need inline style; Tailwind class colours need className
  const useClass = typeof meta.bg === 'string' && meta.bg.startsWith('bg-')
  return (
    <div className="flex gap-2 items-center">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${useClass ? meta.bg : ''}`}
        style={useClass ? {} : { background: meta.bg, color: meta.text }}>
        <Icon size={13} className={useClass ? meta.text : ''} />
      </div>
      <span className="text-[11px] font-medium">{entry.actor}</span>
    </div>
  )
}

function AuditResultPill({ entry }) {
  const meta = AUDIT_TYPE_META[entry.type] ?? AUDIT_TYPE_META.system
  const useClass = typeof meta.bg === 'string' && meta.bg.startsWith('bg-')
  return (
    <span className={`pill text-[10px] ${useClass ? `${meta.bg} ${meta.text}` : ''}`}
      style={useClass ? {} : { background: meta.bg, color: meta.text }}>
      {entry.result}
    </span>
  )
}

function Audit({ data, setData }) {
  const [search,       setSearch]       = useState('')
  const [typeFilter,   setTypeFilter]   = useState('All')
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [refreshing,   setRefreshing]   = useState(false)
  const [offline,      setOffline]      = useState(false)
  const [exportMsg,    setExportMsg]    = useState(null)

  // TC-AUD-012/013: fetch live audit data on mount
  useEffect(() => {
    setRefreshing(true)
    apiFetch('/audit?limit=50')
      .then(d => {
        setData(prev => ({ ...prev, audit: d.audit }))
        setOffline(false)
      })
      .catch(() => setOffline(true))
      .finally(() => setRefreshing(false))
  }, [])

  const doRefresh = () => {
    setRefreshing(true)
    apiFetch('/audit?limit=50')
      .then(d => {
        setData(prev => ({ ...prev, audit: d.audit }))
        setOffline(false)
      })
      .catch(() => setOffline(true))
      .finally(() => setRefreshing(false))
  }

  // TC-AUD-003/004/006: combined search + type filter
  const filtered = data.audit.filter(a => {
    const matchesSearch = !search.trim() ||
      [a.actor, a.action, a.target, a.result].some(v =>
        v?.toLowerCase().includes(search.toLowerCase())
      )
    const matchesType = typeFilter === 'All' || a.type === typeFilter
    return matchesSearch && matchesType
  })

  // TC-AUD-019: live stats derived from actual data
  const totalEvents   = data.audit.length
  const approvals     = data.audit.filter(a => a.type === 'approval').length
  const rejections    = data.audit.filter(a => a.type === 'reject').length
  const escalations   = data.audit.filter(a => a.type === 'escalation').length
  const aiActions     = data.audit.filter(a => a.type === 'ai').length

  // TC-AUD-014: export as CSV
  const handleExport = () => {
    const header = ['Time', 'Actor', 'Activity', 'Target', 'Result', 'Type']
    const rows   = data.audit.map(a =>
      [a.time, a.actor, a.action, a.target, a.result, a.type]
        .map(v => `"${(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv  = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `trustlens-audit-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setExportMsg('Audit log exported')
    setTimeout(() => setExportMsg(null), 3000)
  }

  return (
    <Page>
      {/* TC-AUD-015: offline banner */}
      {offline && <OfflineBanner />}

      <Header eyebrow="GOVERNANCE" title="Audit trail"
        desc="A tamper-evident, searchable record of every AI and human decision."
        action={
          <div className="flex items-center gap-2">
            {exportMsg && (
              <span className="text-[11px] text-emerald-500 flex items-center gap-1">
                <CheckCircle2 size={13} />{exportMsg}
              </span>
            )}
            {/* TC-AUD-014: working export */}
            <button onClick={handleExport}
              className="border px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition hover:opacity-80"
              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
              <FileCheck2 size={14} />Export CSV
            </button>
            {/* TC-AUD-013: refresh */}
            <button onClick={doRefresh} disabled={refreshing}
              className="border px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition hover:opacity-80 disabled:opacity-40"
              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className={refreshing ? 'animate-spin' : ''}>
                <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        }
      />

      {/* TC-AUD-019: real stats from live data */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <Stat icon={FileText}     label="Total events"     value={totalEvents}   delta="In audit log"           color="#6f8cff" />
        <Stat icon={CheckCircle2} label="Approved"          value={approvals}     delta="Human decisions"        color="#50d3a0" />
        <Stat icon={XCircle}      label="Rejected"          value={rejections}    delta="With recorded reason"   color="#f87171" />
        <Stat icon={Siren}        label="Escalated"         value={escalations}   delta="Pending analyst review" color="#f4a94b" />
      </div>

      <div className="card overflow-hidden">
        {/* Search + filter bar */}
        <div className="p-4 border-b flex gap-3 flex-wrap" style={{ borderColor: 'var(--divider)' }}>
          {/* TC-AUD-003: wired search */}
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-sm"
            style={{ borderColor: 'var(--input-border)', background: 'var(--search-bg)' }}>
            <Search size={14} style={{ color: 'var(--muted)' }} />
            <input
              placeholder="Search actor, activity, target…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-0 text-xs ml-2 w-full"
              style={{ color: 'var(--text)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--muted)' }}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* TC-AUD-006/007: working type filter */}
          <div className="relative">
            <button onClick={() => setFilterOpen(o => !o)}
              className="border px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition hover:opacity-80"
              style={{
                borderColor: typeFilter !== 'All' ? '#5578ff' : 'var(--input-border)',
                color:       typeFilter !== 'All' ? '#6f8cff' : 'var(--muted)',
                background:  typeFilter !== 'All' ? 'rgba(85,120,255,.08)' : 'transparent',
              }}>
              <Filter size={13} />
              {FILTER_LABELS[typeFilter] ?? typeFilter}
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 rounded-lg border overflow-hidden shadow-lg"
                style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--card-border)', minWidth: '130px' }}>
                {FILTER_TYPES.map(t => (
                  <button key={t}
                    onClick={() => { setTypeFilter(t); setFilterOpen(false) }}
                    className="w-full text-left px-3 py-2 text-xs transition hover:opacity-80"
                    style={{
                      color:      t === typeFilter ? '#6f8cff' : 'var(--text)',
                      background: t === typeFilter ? 'var(--nav-active-bg)' : 'transparent',
                    }}>
                    {FILTER_LABELS[t]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* active filter chip */}
          {typeFilter !== 'All' && (
            <span className="flex items-center gap-1 pill text-[10px]"
              style={{ background: 'rgba(85,120,255,.1)', color: '#6f8cff' }}>
              {FILTER_LABELS[typeFilter]}
              <button onClick={() => setTypeFilter('All')} aria-label="Remove filter">
                <X size={10} />
              </button>
            </span>
          )}

          <span className="ml-auto text-[10px] self-center" style={{ color: 'var(--muted)' }}>
            {filtered.length} of {data.audit.length} events
          </span>
        </div>

        {/* TC-AUD-016: loading state */}
        {refreshing && data.audit.length === 0 ? (
          <div className="p-12 text-center" style={{ color: 'var(--muted)' }}>
            <div className="w-6 h-6 rounded-full border-2 border-[#3452d4] border-t-transparent animate-spin mx-auto mb-3" />
            <div className="text-sm">Loading audit log…</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="label border-b" style={{ borderColor: 'var(--table-head-border)' }}>
                  {['Time', 'Type', 'Actor', 'Activity', 'Target', 'Result / Reason'].map(x => (
                    <th key={x} className="px-4 py-3 font-semibold">{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* TC-AUD-005: empty state */}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center" style={{ color: 'var(--muted)' }}>
                      <Search size={24} className="mx-auto mb-2 opacity-30" />
                      <div className="text-sm font-semibold">No events found</div>
                      <div className="text-[11px] mt-1">
                        {search ? `Nothing matches "${search}"` : `No ${FILTER_LABELS[typeFilter]} events`}
                      </div>
                      <button onClick={() => { setSearch(''); setTypeFilter('All') }}
                        className="mt-2 text-[11px] text-[#6f8cff] hover:underline">
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : filtered.map((a, i) => (
                  <tr key={i} className="border-b last:border-0 transition"
                    style={{ borderColor: 'var(--divider)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--table-row-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>

                    {/* Time */}
                    <td className="px-4 py-4 text-[10px] font-mono whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                      {a.time}
                    </td>

                    {/* TC-AUD-002/008/009/010: Type badge with correct icon per type */}
                    <td className="px-4 py-4">
                      {(() => {
                        const m = AUDIT_TYPE_META[a.type] ?? AUDIT_TYPE_META.system
                        const useClass = typeof m.bg === 'string' && m.bg.startsWith('bg-')
                        return (
                          <span className={`pill text-[9px] !py-0.5 ${useClass ? `${m.bg} ${m.text}` : ''}`}
                            style={useClass ? {} : { background: m.bg, color: m.text }}>
                            {m.label}
                          </span>
                        )
                      })()}
                    </td>

                    {/* Actor with type-aware icon */}
                    <td className="px-4 py-4">
                      <AuditActorCell entry={a} />
                    </td>

                    {/* Activity */}
                    <td className="px-4 py-4 text-[11px]">{a.action}</td>

                    {/* Target */}
                    <td className="px-4 py-4 text-[11px] max-w-[160px] truncate" style={{ color: 'var(--muted)' }}>
                      {a.target}
                    </td>

                    {/* TC-AUD-009/011: Result / Reason */}
                    <td className="px-4 py-4 max-w-[200px]">
                      <AuditResultPill entry={a} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TC-AUD-019: integrity footer */}
      <div className="mt-4 flex items-center gap-2 text-[10px]" style={{ color: 'var(--muted)' }}>
        <LockKeyhole size={12} />
        Audit log is append-only. Entries are written server-side and cannot be modified through the UI.
        {offline && <span className="text-amber-500 ml-2">· Showing local cache — may not reflect latest server state</span>}
      </div>
    </Page>
  )
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24" style={{ color: 'var(--muted)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-[#3452d4] border-t-transparent animate-spin mb-4" />
      <div className="text-sm">Loading…</div>
    </div>
  )
}

function OfflineBanner() {
  return (
    <div className="mb-5 px-4 py-2.5 rounded-lg bg-amber-500/[.07] border border-amber-400/20 text-[11px] text-amber-500 flex items-center gap-2">
      <AlertTriangle size={13} />Backend unavailable — showing demo data.
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------
createRoot(document.getElementById('root')).render(
  <BrowserRouter><App /></BrowserRouter>
)
