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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [light, setLight] = useState(() => localStorage.getItem('tl-theme') === 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('light', light)
    localStorage.setItem('tl-theme', light ? 'light' : 'dark')
  }, [light])

  useEffect(() => {
    apiFetch('/dashboard')
      .then(d => { setData(d); setConnected(true) })
      .catch(() => {})
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
            <Route path="/" element={<Dashboard data={data} />} />
            <Route path="/explanation/:id" element={<Explanation data={data} setData={setData} />} />
            <Route path="/courtroom/:id" element={<Courtroom data={data} />} />
            <Route path="/simulation/:id" element={<Simulation data={data} />} />
            <Route path="/approvals" element={<Approvals data={data} setData={setData} />} />
            <Route path="/audit" element={<Audit data={data} />} />
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
        <input aria-label="Search" placeholder="Search recommendations, devices..."
          className="bg-transparent border-0 outline-0 text-xs ml-2 w-full"
          style={{ color: 'var(--text)' }} />
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
// Dashboard
// ---------------------------------------------------------------------------
function Dashboard({ data }) {
  return (
    <Page>
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
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--divider)' }}>
            <div>
              <div className="font-semibold text-sm">Priority recommendations</div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>Ranked by risk, impact and model confidence</div>
            </div>
            <button className="text-[11px] border px-2.5 py-1.5 rounded-md flex gap-1.5 items-center transition"
              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
              <Filter size={12} />Filter
            </button>
          </div>
          <div>{data.recommendations.map(r => <RecommendationRow key={r.id} r={r} />)}</div>
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
  const r = data.recommendations.find(x => x.id === +id) || data.recommendations[0]

  return (
    <Page>
      <NavLink to="/" className="inline-flex items-center gap-2 text-xs mb-5 transition hover:opacity-80"
        style={{ color: 'var(--muted)' }}>
        <ArrowLeft size={14} />Back to recommendations
      </NavLink>
      <Header eyebrow={`${r.category} · ${r.severity} risk`} title={r.title} desc={r.summary} />
      <div className="grid xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <section className="card p-5">
            <SectionTitle icon={Sparkles} title="Why TrustLens recommends this" tag="Reasoning trace" />
            <div className="mt-5 pl-3 border-l-2 border-[#4e6bd0] space-y-5">
              {r.evidence.map((e, i) => (
                <div key={e} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: 'var(--acc-bg)', color: '#9cb2ff' }}>{i + 1}</span>
                  <div>
                    <div className="text-xs font-medium">{e}</div>
                    <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>
                      Verified against current tenant data · {i === 2 ? 'Policy simulation' : 'Direct observation'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg p-3.5" style={{ background: 'var(--sub-bg)', border: '1px solid var(--sub-border)' }}>
              <div className="label mb-1.5">Expected impact</div>
              <div className="text-xs text-emerald-500">{r.impact}</div>
            </div>
          </section>
          <Sources r={r} />
          <AgentMap agents={r.agents} />
        </div>
        <div className="space-y-5">
          <Confidence n={r.confidence} />
          <Warning text={r.limitation} />
          <Decision r={r} setData={setData} />
        </div>
      </div>
    </Page>
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

function Confidence({ n }) {
  return (
    <div className="card p-5">
      <SectionTitle icon={CircleGauge} title="Confidence" />
      <div className="flex items-end gap-2 mt-5">
        <span className="text-4xl font-bold">{n}%</span>
        <span className="pill bg-emerald-500/10 text-emerald-500 mb-1">High</span>
      </div>
      <div className="h-2 rounded-full mt-4" style={{ background: 'var(--alt-border)' }}>
        <div className="h-full rounded-full bg-gradient-to-r from-[#4f79ff] to-[#45cf9c]" style={{ width: `${n}%` }} />
      </div>
      <div className="grid grid-cols-3 mt-4 text-center">
        <div><b className="text-[11px]">96%</b><div className="text-[9px]" style={{ color: 'var(--muted)' }}>Data quality</div></div>
        <div className="border-x" style={{ borderColor: 'var(--divider)' }}>
          <b className="text-[11px]">91%</b><div className="text-[9px]" style={{ color: 'var(--muted)' }}>Consensus</div>
        </div>
        <div><b className="text-[11px]">95%</b><div className="text-[9px]" style={{ color: 'var(--muted)' }}>Policy match</div></div>
      </div>
    </div>
  )
}

function Warning({ text }) {
  return (
    <div className="rounded-xl p-4 bg-amber-500/[.07] border border-amber-400/25">
      <div className="flex gap-2 text-amber-500 text-xs font-semibold"><AlertTriangle size={15} />Known limitation</div>
      <p className="text-[10px] mt-2 leading-relaxed text-amber-700 dark:text-amber-100/65">{text}</p>
      <button className="text-[10px] text-amber-500 mt-2 hover:underline">View all assumptions →</button>
    </div>
  )
}

function Decision({ r, setData }) {
  const [done, setDone] = useState(r.status === 'Approved')
  const [loading, setLoading] = useState(false)

  const act = async (status) => {
    setLoading(true)
    setDone(status === 'Approved')
    setData(d => ({ ...d, recommendations: d.recommendations.map(x => x.id === r.id ? { ...x, status } : x) }))
    try {
      await apiFetch(`/recommendations/${r.id}/decision`, {
        method: 'POST', body: JSON.stringify({ status, actor: 'Alex Smith' })
      })
    } catch {}
    setLoading(false)
  }

  return (
    <div className="card p-5">
      <SectionTitle icon={UserCheck} title="Human decision" />
      <p className="text-[10px] mt-3" style={{ color: 'var(--muted)' }}>
        No action will be taken without administrator approval.
      </p>
      {done ? (
        <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-500 text-xs flex gap-2">
          <CheckCircle2 size={16} />Approved for staged rollout
        </div>
      ) : (
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
            <button disabled={loading} onClick={() => act('Approved')}
              className="w-full bg-[#3159db] hover:bg-[#4068e9] text-white disabled:opacity-50 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition">
              <Check size={15} />Approve recommendation
            </button>
            <button disabled={loading} onClick={() => act('Rejected')}
              className="w-full border py-2.5 rounded-lg text-xs disabled:opacity-50 flex items-center justify-center gap-2 transition hover:opacity-80"
              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
              <X size={14} />Reject with reason
            </button>
          </div>
        </>
      )}
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
  const [error, setError] = useState(false)

  useEffect(() => {
    apiFetch(`/courtroom/${id}`).then(setCd).catch(() => {
      const rec = data.recommendations.find(r => r.id === +id) || data.recommendations[0]
      setCd({
        recommendation: rec.title, prosecution: rec.evidence, confidence: rec.confidence,
        verdict: rec.title,
        defense: [rec.limitation, 'Human context may not be fully available.', 'Recent environmental changes may affect risk.'],
      })
      setError(true)
    })
  }, [id])

  if (!cd) return <Page><LoadingState /></Page>

  return (
    <Page>
      {error && <OfflineBanner />}
      <NavLink to={`/explanation/${id}`} className="inline-flex items-center gap-2 text-xs mb-5 transition hover:opacity-80"
        style={{ color: 'var(--muted)' }}>
        <ArrowLeft size={14} />Back to explanation
      </NavLink>
      <Header eyebrow="AI COURTROOM" title={cd.recommendation}
        desc="Evidence is weighed against known limitations before a recommendation is issued." />
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Check size={14} className="text-emerald-500" />
            </div>
            <h3 className="font-bold text-emerald-500">Case for action</h3>
          </div>
          <ul className="space-y-3">
            {cd.prosecution.map(x => (
              <li key={x} className="flex gap-2.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />{x}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={14} className="text-red-500" />
            </div>
            <h3 className="font-bold text-red-500">Case against action</h3>
          </div>
          <ul className="space-y-3">
            {cd.defense.map(x => (
              <li key={x} className="flex gap-2.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />{x}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card p-5 mt-5 flex items-center justify-between">
        <div>
          <div className="label mb-1">Model verdict</div>
          <div className="font-semibold text-sm">{cd.verdict}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-emerald-500">{cd.confidence}%</div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Overall confidence</div>
        </div>
      </div>
      <div className="mt-5 flex gap-3 justify-end">
        <NavLink to={`/simulation/${id}`}
          className="border px-4 py-2.5 rounded-lg text-xs transition hover:opacity-80"
          style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
          Run decision simulator →
        </NavLink>
      </div>
    </Page>
  )
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------
function Simulation({ data }) {
  const { id } = useParams()
  const [sd, setSd] = useState(null)
  const [altData, setAltData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([apiFetch(`/simulate/${id}`), apiFetch(`/alternatives/${id}`)])
      .then(([sim, alt]) => { setSd(sim); setAltData(alt) })
      .catch(() => {
        const rec = data.recommendations.find(r => r.id === +id) || data.recommendations[0]
        setSd({
          recommendation: rec.title,
          approve: { risk_reduction: '82%', business_impact: 'Low', security_benefit: rec.impact },
          reject: { risk_increase: '63%', business_impact: 'High', security_risk: 'Threat remains unresolved' }
        })
        setAltData({ alternatives: [
          { action: 'Monitor for 7 days', risk: 'Medium' },
          { action: 'Pilot deployment', risk: 'Low' },
          { action: 'Escalate to security analyst', risk: 'Very Low' },
        ]})
        setError(true)
      })
  }, [id])

  if (!sd) return <Page><LoadingState /></Page>

  const riskColor = { Low: 'text-emerald-500', Medium: 'text-amber-500', High: 'text-red-500', 'Very Low': 'text-sky-500' }

  return (
    <Page>
      {error && <OfflineBanner />}
      <NavLink to={`/explanation/${id}`} className="inline-flex items-center gap-2 text-xs mb-5 transition hover:opacity-80"
        style={{ color: 'var(--muted)' }}>
        <ArrowLeft size={14} />Back to explanation
      </NavLink>
      <Header eyebrow="DECISION SIMULATOR" title={sd.recommendation}
        desc="Compare projected outcomes before committing to a decision." />
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            <h3 className="font-bold text-emerald-500">If approved</h3>
          </div>
          <div className="space-y-4">
            <SimRow label="Risk reduction" value={sd.approve.risk_reduction} positive />
            <SimRow label="Business impact" value={sd.approve.business_impact} />
            <div className="rounded-lg p-3.5 mt-2" style={{ background: 'var(--sim-approve-bg)' }}>
              <div className="label mb-1.5">Security benefit</div>
              <div className="text-xs text-emerald-500">{sd.approve.security_benefit}</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle size={14} className="text-red-500" />
            </div>
            <h3 className="font-bold text-red-500">If rejected</h3>
          </div>
          <div className="space-y-4">
            <SimRow label="Risk increase" value={sd.reject.risk_increase} negative />
            <SimRow label="Business impact" value={sd.reject.business_impact} />
            <div className="rounded-lg p-3.5 mt-2" style={{ background: 'var(--sim-reject-bg)' }}>
              <div className="label mb-1.5">Security risk</div>
              <div className="text-xs text-red-500">{sd.reject.security_risk}</div>
            </div>
          </div>
        </div>
      </div>
      {altData && (
        <div className="card p-5 mt-5">
          <SectionTitle icon={GitBranch} title="Alternative actions" tag={`${altData.alternatives.length} options`} />
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            {altData.alternatives.map(a => (
              <div key={a.action} className="rounded-lg p-4 border"
                style={{ background: 'var(--alt-bg)', borderColor: 'var(--alt-border)' }}>
                <div className="text-xs font-semibold">{a.action}</div>
                <div className={`text-[10px] mt-2 font-semibold ${riskColor[a.risk] || ''}`}>{a.risk} risk</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <EscalateButton id={id} />
    </Page>
  )
}

function SimRow({ label, value, positive, negative }) {
  return (
    <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--divider)' }}>
      <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{label}</span>
      <span className={`text-sm font-bold ${positive ? 'text-emerald-500' : negative ? 'text-red-500' : ''}`}>{value}</span>
    </div>
  )
}

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
  const pending = data.recommendations.filter(r => !['Approved', 'Rejected'].includes(r.status))
  return (
    <Page>
      <Header eyebrow="HUMAN OVERSIGHT" title="Approval center"
        desc="Review high-impact AI recommendations before execution."
        action={<span className="pill" style={{ background: 'var(--acc-bg)', color: '#91a7ff' }}>{pending.length} awaiting review</span>}
      />
      <div className="grid xl:grid-cols-[1fr_300px] gap-5">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_110px] text-[10px] label px-5 py-3 border-b"
            style={{ borderColor: 'var(--divider)' }}>
            <span>Recommendation</span><span>Confidence</span><span>Decision</span>
          </div>
          {pending.length === 0 ? (
            <div className="p-10 text-center text-sm" style={{ color: 'var(--muted)' }}>
              <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-400 opacity-50" />
              All caught up — no pending recommendations.
            </div>
          ) : pending.map(r => <ApprovalRow key={r.id} r={r} setData={setData} />)}
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <div className="font-semibold text-sm">Oversight policy</div>
            <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
              High-impact changes require one Global Administrator. Critical identity changes require two approvers.
            </p>
            <div className="mt-4 text-[10px] rounded-lg p-3" style={{ background: 'var(--status-bg)', color: 'var(--muted)' }}>
              Policy TL-GOV-04 · Active
            </div>
          </div>
          <div className="card p-5">
            <div className="font-semibold text-sm">This week</div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Mini n="19" l="Approved" /><Mini n="3" l="Rejected" />
              <Mini n="12m" l="Avg. review" /><Mini n="0" l="Bypassed" />
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

function ApprovalRow({ r, setData }) {
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)
  const decide = async (status) => {
    setLoading(true)
    setData(d => ({ ...d, recommendations: d.recommendations.map(x => x.id === r.id ? { ...x, status } : x) }))
    try {
      await apiFetch(`/recommendations/${r.id}/decision`, {
        method: 'POST', body: JSON.stringify({ status, actor: 'Alex Smith' })
      })
    } catch {}
    setLoading(false)
  }
  return (
    <div className="grid grid-cols-[1fr_100px_110px] items-center px-5 py-4 border-b last:border-0"
      style={{ borderColor: 'var(--divider)' }}>
      <button onClick={() => nav(`/explanation/${r.id}`)} className="text-left pr-3">
        <div className="text-xs font-semibold hover:text-[#6f8cff] transition">{r.title}</div>
        <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{r.affected} resources · {r.severity} risk</div>
      </button>
      <div className="text-xs font-bold text-emerald-500">{r.confidence}%</div>
      <div className="flex gap-1.5">
        <button aria-label="Approve" disabled={loading} onClick={() => decide('Approved')}
          className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-40 flex items-center justify-center transition">
          <Check size={14} />
        </button>
        <button aria-label="Reject" disabled={loading} onClick={() => decide('Rejected')}
          className="w-8 h-8 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-40 flex items-center justify-center transition">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------
function Audit({ data }) {
  const [search, setSearch] = useState('')
  const filtered = data.audit.filter(a =>
    [a.actor, a.action, a.target, a.result].some(v => v.toLowerCase().includes(search.toLowerCase()))
  )
  return (
    <Page>
      <Header eyebrow="GOVERNANCE" title="Audit trail"
        desc="A tamper-evident record of every AI and human decision."
        action={
          <button className="border px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition hover:opacity-80"
            style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
            <FileCheck2 size={14} />Export report
          </button>
        }
      />
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat icon={FileText} label="Events today" value="247" delta="Across all systems" color="#6f8cff" />
        <Stat icon={CheckCircle2} label="Successful actions" value="98.4%" delta="No policy violations" color="#50d3a0" />
        <Stat icon={LockKeyhole} label="Integrity status" value="Valid" delta="Last verified 1m ago" color="#aa80ff" />
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b flex gap-3" style={{ borderColor: 'var(--divider)' }}>
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1 max-w-sm"
            style={{ borderColor: 'var(--input-border)', background: 'var(--search-bg)' }}>
            <Search size={14} style={{ color: 'var(--muted)' }} />
            <input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-0 text-xs ml-2 w-full"
              style={{ color: 'var(--text)' }} />
          </div>
          <button className="border px-3 rounded-lg transition hover:opacity-80"
            style={{ borderColor: 'var(--input-border)', color: 'var(--muted)' }}>
            <Filter size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="label border-b" style={{ borderColor: 'var(--table-head-border)' }}>
                {['Time', 'Actor', 'Activity', 'Target', 'Result'].map(x => (
                  <th key={x} className="px-5 py-3 font-semibold">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>No events match your search.</td></tr>
              ) : filtered.map((a, i) => (
                <tr key={i} className="border-b last:border-0 transition"
                  style={{ borderColor: 'var(--divider)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--table-row-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="px-5 py-4 text-[10px] font-mono" style={{ color: 'var(--muted)' }}>{a.time}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 items-center">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: a.type === 'ai' ? 'var(--pill-ai-bg)' : 'var(--pill-human-bg)',
                                 color: a.type === 'ai' ? 'var(--pill-ai-text)' : 'var(--pill-human-text)' }}>
                        {a.type === 'ai' ? <Bot size={13} /> : <UserCheck size={13} />}
                      </div>
                      <span className="text-[11px] font-medium">{a.actor}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[11px]">{a.action}</td>
                  <td className="px-5 py-4 text-[11px]" style={{ color: 'var(--muted)' }}>{a.target}</td>
                  <td className="px-5 py-4">
                    <span className={`pill ${a.type === 'reject' ? 'bg-red-500/10 text-red-500' :
                      a.result === 'Pending review' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {a.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
