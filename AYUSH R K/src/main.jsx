import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Activity, AlertTriangle, ArrowLeft, Bell, Bot, Check, CheckCircle2, ChevronRight, CircleGauge, Clock3, Database, ExternalLink, FileCheck2, FileText, Filter, LayoutDashboard, LockKeyhole, Menu, Network, Search, Settings, ShieldCheck, Sparkles, UserCheck, X } from 'lucide-react'
import './index.css'

const transparency = {
  1: {
    why: 'Privileged accounts have elevated blast radius and the current controls do not meet the phishing-resistant authentication baseline.',
    weaknesses: ['Break-glass accounts are intentionally excluded', 'Location anomalies can include legitimate travel'],
    confidenceFactors: ['96% tenant data completeness', '91% agreement across three agents', 'Strong NIST policy match'],
    alternatives: [
      { name: 'Enforce phishing-resistant MFA', confidence: 94, reason: 'Best reduction in takeover risk with a controlled rollout.', selected: true },
      { name: 'Require standard push MFA', confidence: 71, reason: 'Rejected because push fatigue remains exploitable.' },
      { name: 'Monitor privileged sign-ins only', confidence: 43, reason: 'Rejected because monitoring does not prevent compromise.' }
    ]
  },
  2: {
    why: 'Actively exploited vulnerabilities were correlated across Defender, Intune inventory, and the CISA KEV catalog.',
    weaknesses: ['Five devices have stale telemetry', 'Pilot compatibility may not cover every legacy app'],
    confidenceFactors: ['93% endpoint telemetry coverage', '89% threat-source agreement', 'Successful pilot deployment'],
    alternatives: [
      { name: 'Staged security update rollout', confidence: 89, reason: 'Balances rapid remediation with application safety.', selected: true },
      { name: 'Immediate broad deployment', confidence: 68, reason: 'Rejected due to business continuity risk.' },
      { name: 'Isolate vulnerable devices', confidence: 57, reason: 'Rejected as too disruptive for all affected users.' }
    ]
  },
  3: {
    why: 'Guest identities retain access despite prolonged inactivity, creating unnecessary standing privilege.',
    weaknesses: ['Activity outside Microsoft 365 is not visible'],
    confidenceFactors: ['Complete directory audit', 'Two-agent agreement', '90-day policy match'],
    alternatives: [
      { name: 'Revoke inactive guest access', confidence: 82, reason: 'Best balance of security and reversibility.', selected: true },
      { name: 'Ask sponsors to re-attest', confidence: 70, reason: 'Rejected because it delays risk reduction.' },
      { name: 'Shorten guest session lifetime', confidence: 48, reason: 'Rejected because stale access remains assigned.' }
    ]
  },
  4: {
    why: 'Long-inactive device objects reduce inventory accuracy and can distort compliance reporting.',
    weaknesses: ['Offline warehouse devices may be misclassified'],
    confidenceFactors: ['Single authoritative inventory', '120-day inactivity threshold'],
    alternatives: [
      { name: 'Retire inactive device records', confidence: 76, reason: 'Improves reporting with a recoverable action.', selected: true },
      { name: 'Tag records for manual review', confidence: 63, reason: 'Rejected because it preserves inventory noise.' },
      { name: 'Delete records permanently', confidence: 35, reason: 'Rejected because the action is difficult to reverse.' }
    ]
  }
}

const sprintInsights = {
  1: {
    prosecution: ['Privileged roles have the highest blast radius in the tenant.', '12 of 18 privileged accounts still allow weaker sign-in paths.', 'Three accounts show unfamiliar-location sign-ins.'],
    defense: ['Two break-glass accounts are intentionally excluded.', 'Travel and emergency access can create legitimate exceptions.', 'A rushed rollout could lock out administrators.'],
    verdict: 'Approve with a staged rollout and break-glass exception review.',
    simulation: {
      approved: { riskReduction: 'High — closes the most likely takeover path', securityBenefit: 'Phishing-resistant MFA protects privileged access', operationalImpact: 'Medium — admins may need enrollment support' },
      rejected: { riskIncrease: 'High — privileged takeover remains plausible', threatExposure: 'Password and push-fatigue attacks remain viable', operationalImpact: 'Low now, higher if incident response is triggered' }
    },
    override: { example: 'Two break-glass accounts are intentionally excluded.', delta: -4, reason: 'Valid emergency-access context lowers confidence slightly but does not overturn the recommendation.' },
    agentVotes: [{ name: 'Identity Agent', vote: 'Approve' }, { name: 'Risk Agent', vote: 'Approve' }, { name: 'Compliance Agent', vote: 'Review Further' }],
    readiness: { dataQuality: 96, evidenceStrength: 94, humanAgreement: 82, agentConsensus: 67 }
  },
  2: {
    prosecution: ['CISA KEV correlation indicates active exploitation.', '38 devices missed the latest quality update.', 'Pilot ring completed with strong compatibility results.'],
    defense: ['Five devices have stale telemetry.', 'Legacy applications may not be represented in the pilot ring.', 'Broad deployment can disrupt critical operations.'],
    verdict: 'Approve a staged deployment with monitoring for stale devices.',
    simulation: {
      approved: { riskReduction: 'High — removes known exploited CVEs', securityBenefit: 'Reduces endpoint compromise and lateral movement risk', operationalImpact: 'Medium — reboot windows and app validation required' },
      rejected: { riskIncrease: 'High — exploitable CVEs remain open', threatExposure: 'Known attacker playbooks remain applicable', operationalImpact: 'Low immediately, severe if devices are exploited' }
    },
    override: { example: 'Five devices are lab machines isolated from production.', delta: -6, reason: 'Isolation context reduces urgency for a subset but still supports patching.' },
    agentVotes: [{ name: 'Endpoint Agent', vote: 'Approve' }, { name: 'Threat Agent', vote: 'Approve' }, { name: 'Deployment Agent', vote: 'Review Further' }],
    readiness: { dataQuality: 93, evidenceStrength: 91, humanAgreement: 78, agentConsensus: 67 }
  },
  3: {
    prosecution: ['24 guest identities are inactive for 90+ days.', 'Seven guests retain access to confidential groups.', 'Standing external access increases unnecessary exposure.'],
    defense: ['Some partner work may happen outside Microsoft 365.', 'Sponsor confirmation may be needed for sensitive projects.', 'Revocation can interrupt dormant-but-valid collaboration.'],
    verdict: 'Approve revocation with a sponsor notification window.',
    simulation: {
      approved: { riskReduction: 'Medium — reduces stale external access', securityBenefit: 'Shrinks identity attack surface and license exposure', operationalImpact: 'Low — access can be restored if needed' },
      rejected: { riskIncrease: 'Medium — dormant external access persists', threatExposure: 'Compromised guest accounts retain standing permissions', operationalImpact: 'Low now, moderate during access reviews' }
    },
    override: { example: 'A partner project restarts next week.', delta: -8, reason: 'Near-term business context supports manual review for affected guests.' },
    agentVotes: [{ name: 'Identity Agent', vote: 'Approve' }, { name: 'Access Agent', vote: 'Approve' }, { name: 'Business Context Agent', vote: 'Review Further' }],
    readiness: { dataQuality: 90, evidenceStrength: 84, humanAgreement: 76, agentConsensus: 67 }
  },
  4: {
    prosecution: ['61 devices have not checked in for 120 days.', 'Inactive records distort compliance reporting.', 'Inventory noise weakens operational decisions.'],
    defense: ['Warehouse devices may be intentionally offline.', 'Retirement could hide assets that return seasonally.', 'The action is low-risk but still needs operational context.'],
    verdict: 'Review context, then approve cleanup for non-exempt devices.',
    simulation: {
      approved: { riskReduction: 'Low — primarily improves hygiene', securityBenefit: 'Cleaner inventory and compliance reporting', operationalImpact: 'Low to medium if offline devices are misclassified' },
      rejected: { riskIncrease: 'Low — inventory uncertainty remains', threatExposure: 'Stale assets may mask unmanaged devices', operationalImpact: 'Low now, recurring reporting friction later' }
    },
    override: { example: 'Warehouse devices are intentionally offline.', delta: -12, reason: 'Known operational context materially lowers confidence and favors human review.' },
    agentVotes: [{ name: 'Inventory Agent', vote: 'Approve' }, { name: 'Risk Agent', vote: 'Review Further' }, { name: 'Operations Agent', vote: 'Review Further' }],
    readiness: { dataQuality: 84, evidenceStrength: 76, humanAgreement: 70, agentConsensus: 33 }
  }
}

const getSprint = r => sprintInsights[r?.id] || {
  prosecution: r?.evidence || [],
  defense: [r?.limitation || 'Additional human context may change the interpretation.'],
  verdict: r?.title || 'Review recommendation',
  simulation: {
    approved: { riskReduction: 'Medium', securityBenefit: r?.impact || 'Improves security posture', operationalImpact: 'Managed change required' },
    rejected: { riskIncrease: 'Medium', threatExposure: 'Existing exposure remains', operationalImpact: 'No immediate operational change' }
  },
  override: { example: 'Add business context here.', delta: -5, reason: 'New context changes confidence but does not execute any action.' },
  agentVotes: (r?.agents || ['TrustLens Agent']).map(name => ({ name, vote: 'Approve' })),
  readiness: { dataQuality: 85, evidenceStrength: 82, humanAgreement: 75, agentConsensus: 80 }
}

const baseRecommendations = [
  { id: 1, title: 'Enforce MFA for privileged accounts', summary: '12 administrator accounts are not covered by a phishing-resistant MFA policy.', severity: 'Critical', confidence: 94, status: 'Needs approval', category: 'Identity', affected: 12, time: '8 min ago', risk: 'High', sources: ['Microsoft Entra ID sign-in logs', 'Conditional Access policies', 'NIST SP 800-63B'], limitation: '2 break-glass accounts were excluded from the analysis.', impact: 'Reduces account takeover risk across privileged roles.', evidence: ['12 of 18 privileged accounts lack phishing-resistant MFA', '3 accounts showed sign-ins from unfamiliar locations', 'Current policy allows SMS as a fallback method'], agents: ['Identity Analyst', 'Policy Validator', 'Risk Assessor'] },
  { id: 2, title: 'Patch critical Windows vulnerabilities', summary: 'Deploy the June security baseline to 38 devices with actively exploited CVEs.', severity: 'High', confidence: 89, status: 'Needs approval', category: 'Endpoints', affected: 38, time: '21 min ago', risk: 'High', sources: ['Microsoft Defender Vulnerability Management', 'Intune device inventory', 'CISA KEV catalog'], limitation: 'Five devices have not checked in for more than 48 hours.', impact: 'Closes 4 known exploited vulnerabilities.', evidence: ['CVE-2026-31201 detected on 31 devices', '38 devices missed the latest quality update', 'Pilot ring completed with 99.2% app compatibility'], agents: ['Endpoint Scanner', 'Threat Correlator', 'Deployment Planner'] },
  { id: 3, title: 'Remove stale guest access', summary: 'Revoke access for 24 guest identities inactive for more than 90 days.', severity: 'Medium', confidence: 82, status: 'Ready to review', category: 'Identity', affected: 24, time: '1 hr ago', risk: 'Medium', sources: ['Entra ID directory audit', 'Teams activity data'], limitation: 'External activity outside Microsoft 365 is not visible.', impact: 'Reduces standing external access and license exposure.', evidence: ['24 guests inactive for 90+ days', '7 guests retain access to confidential groups'], agents: ['Identity Analyst', 'Access Reviewer'] },
  { id: 4, title: 'Optimize inactive device cleanup', summary: 'Retire 61 devices that have not checked in for 120 days.', severity: 'Low', confidence: 76, status: 'Draft', category: 'Devices', affected: 61, time: '3 hr ago', risk: 'Low', sources: ['Intune managed device inventory'], limitation: 'Offline warehouse devices may be incorrectly classified.', impact: 'Improves inventory accuracy and reporting.', evidence: ['61 devices exceed the cleanup threshold'], agents: ['Inventory Agent'] }
]

const withTransparency = recs => recs.map(r => ({ ...r, ...(transparency[r.id] || {}) }))

const fallback = {
  stats: { open: 7, highConfidence: 18, awaiting: 4, automated: 142 },
  recommendations: withTransparency(baseRecommendations),
  audit: [
    { time: '10:42:18', actor: 'Priya Sharma', action: 'Approved recommendation', target: 'Block legacy authentication', result: 'Success', type: 'approval', reason: '' },
    { time: '10:31:04', actor: 'TrustLens AI', action: 'Generated recommendation', target: 'Enforce MFA for privileged accounts', result: 'Pending review', type: 'ai', reason: '' },
    { time: '10:29:51', actor: 'Risk Assessor', action: 'Raised confidence score', target: 'Patch critical Windows vulnerabilities', result: '89%', type: 'ai', reason: '' },
    { time: '09:58:22', actor: 'Marcus Chen', action: 'Rejected recommendation', target: 'Disable removable storage', result: 'Reason recorded', type: 'reject', reason: 'Blocked pending replacement media-control policy.' },
    { time: '09:44:10', actor: 'System', action: 'Data source synchronized', target: 'Microsoft Intune', result: '1,842 records', type: 'system', reason: '' },
    { time: '09:32:44', actor: 'Elena Rossi', action: 'Modified deployment scope', target: 'Browser security baseline', result: 'Pilot group only', type: 'edit', reason: '' }
  ]
}

const navItems = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/explanation/1', 'Explanation', Sparkles],
  ['/courtroom/1', 'AI Courtroom', ShieldCheck],
  ['/simulator/1', 'Decision Simulator', CircleGauge],
  ['/approvals', 'Approval center', UserCheck],
  ['/audit', 'Audit trail', FileText]
]

const severityTone = {
  Critical: 'bg-red-500/10 text-red-300 border-red-500/20',
  High: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  Medium: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  Low: 'bg-sky-500/10 text-sky-300 border-sky-500/20'
}

const statusTone = {
  Approved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-300 border-red-500/20',
  Escalated: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
}

function App() {
  const [data, setData] = useState(fallback)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        setData({ ...d, recommendations: withTransparency(d.recommendations || []) })
        setConnected(true)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-[232px] border-r border-[#202c40] bg-[#0a111e]/95 flex-col fixed inset-y-0 z-20">
        <div className="h-[70px] flex items-center gap-3 px-5 border-b border-[#202c40]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5578ff] to-[#3452d4] flex items-center justify-center shadow-lg shadow-blue-900/30"><ShieldCheck size={21} /></div>
          <div>
            <div className="font-bold tracking-tight">TrustLens <span className="text-[#6f8cff]">AI</span></div>
            <div className="text-[10px] text-[#71819b] uppercase tracking-[.16em]">Decision intelligence</div>
          </div>
        </div>
        <div className="px-3 pt-5">
          <div className="label px-3 mb-2">Workspace</div>
          {navItems.map(([to, label, Icon]) => (
            <NavLink key={label} to={to} end={to === '/'} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] mb-1 transition ${isActive ? 'bg-[#263c76]/45 text-white border border-[#3859aa]/40' : 'text-[#91a0b7] hover:bg-white/5 hover:text-white'}`}>
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </div>
        <div className="mt-auto p-3">
          <div className="card p-3.5 mb-3 bg-[#101b2c]">
            <div className="flex items-center gap-2 text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-[#36c690] live" />AI systems operational</div>
            <div className="text-[10px] muted mt-2">8 agents · Last sync 2m ago</div>
          </div>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[#5b4296] flex items-center justify-center text-xs font-bold">AS</div>
            <div className="min-w-0">
              <div className="text-xs font-semibold">Alex Smith</div>
              <div className="text-[10px] muted">Global Administrator</div>
            </div>
            <Settings size={15} className="ml-auto muted" />
          </div>
        </div>
      </aside>
      <main className="md:ml-[232px] flex-1 min-w-0">
        <TopBar connected={connected} />
        <Routes>
          <Route path="/" element={<Dashboard data={data} />} />
          <Route path="/explanation/:id" element={<Explanation data={data} setData={setData} />} />
          <Route path="/courtroom/:id" element={<Courtroom data={data} />} />
          <Route path="/simulator/:id" element={<DecisionSimulator data={data} />} />
          <Route path="/approvals" element={<Approvals data={data} setData={setData} />} />
          <Route path="/audit" element={<Audit data={data} />} />
        </Routes>
      </main>
    </div>
  )
}

function TopBar({ connected }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  return (
    <header className="h-[70px] border-b border-[#202c40] flex items-center px-5 md:px-8 sticky top-0 bg-[#080d18]/90 backdrop-blur-xl z-10">
      <Menu className="md:hidden mr-4" />
      <form onSubmit={e => { e.preventDefault(); navigate(`/?search=${encodeURIComponent(search)}`) }} className="hidden sm:flex items-center bg-[#111a2a] border border-[#28364d] rounded-lg px-3 py-2 w-[300px]">
        <Search size={15} className="muted" />
        <input value={search} onChange={e => setSearch(e.target.value)} aria-label="Search" placeholder="Search recommendations, devices..." className="bg-transparent border-0 outline-0 text-xs ml-2 w-full placeholder:text-[#65738b]" />
        <button type="submit" className="text-[9px] border border-[#37445a] rounded px-1.5 py-0.5 muted">Enter</button>
      </form>
      <div className="ml-auto flex items-center gap-4">
        <span className={`hidden sm:flex pill ${connected ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />{connected ? 'Live data' : 'Demo data'}
        </span>
        <Bell size={18} className="muted" />
        <div className="w-8 h-8 rounded-lg bg-[#1b2940] flex items-center justify-center"><Bot size={17} className="text-[#6f8cff]" /></div>
      </div>
    </header>
  )
}

function Header({ eyebrow = 'IT OPERATIONS', title, desc, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between mb-7">
      <div>
        <div className="label text-[#6689ff] mb-2">{eyebrow}</div>
        <h1 className="text-2xl md:text-[28px] font-bold tracking-tight">{title}</h1>
        <p className="muted text-sm mt-1.5">{desc}</p>
      </div>
      {action}
    </div>
  )
}

function Dashboard({ data }) {
  const [filters, setFilters] = useState({ severity: 'All', status: 'All', category: 'All', confidence: 'All' })
  const [analyzing, setAnalyzing] = useState(false)
  const location = useLocation()
  const search = new URLSearchParams(location.search).get('search')?.toLowerCase() || ''
  const categories = useMemo(() => ['All', ...new Set(data.recommendations.map(r => r.category))], [data.recommendations])
  const statuses = useMemo(() => ['All', ...new Set(data.recommendations.map(r => r.status))], [data.recommendations])
  const confidenceBands = ['All', '90%+', '80-89%', '<80%']
  const setFilter = (key, value) => setFilters(current => ({ ...current, [key]: value }))
  const resetFilters = () => setFilters({ severity: 'All', status: 'All', category: 'All', confidence: 'All' })

  const shown = data.recommendations.filter(r => {
    const matchesSearch = [r.title, r.summary, r.category, r.status, r.risk].some(v => String(v || '').toLowerCase().includes(search))
    const matchesConfidence = filters.confidence === 'All' ||
      (filters.confidence === '90%+' && r.confidence >= 90) ||
      (filters.confidence === '80-89%' && r.confidence >= 80 && r.confidence < 90) ||
      (filters.confidence === '<80%' && r.confidence < 80)
    return matchesSearch &&
      (filters.severity === 'All' || r.severity === filters.severity) &&
      (filters.status === 'All' || r.status === filters.status) &&
      (filters.category === 'All' || r.category === filters.category) &&
      matchesConfidence
  })

  const run = () => {
    setAnalyzing(true)
    setTimeout(() => setAnalyzing(false), 1400)
  }

  return (
    <Page>
      <Header title="Recommendation dashboard" desc="AI-assisted decisions, with evidence you can inspect." action={<button onClick={run} disabled={analyzing} className="bg-[#3156d9] disabled:opacity-60 hover:bg-[#3d64ec] px-4 py-2.5 rounded-lg text-xs font-semibold flex gap-2 items-center trust-button"><Sparkles size={15} />{analyzing ? 'Analyzing tenant…' : 'Run new analysis'}</button>} />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5 mb-6">
        <Stat icon={AlertTriangle} label="Open recommendations" value={data.stats.open} delta="2 added today" color="#f4a94b" />
        <Stat icon={CircleGauge} label="High confidence" value={data.stats.highConfidence} delta="≥ 85% confidence" color="#50d3a0" />
        <Stat icon={Clock3} label="Awaiting approval" value={data.stats.awaiting} delta="Oldest: 3h 24m" color="#6f8cff" />
        <Stat icon={Activity} label="Automated actions" value={data.stats.automated} delta="Last 7 days" color="#aa80ff" />
      </div>
      <div className="grid xl:grid-cols-[1fr_300px] gap-5">
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-[#26344d]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <div className="font-semibold text-sm">Priority recommendations</div>
                <div className="text-[11px] muted mt-1">{shown.length} shown · filtered by severity, status, category and confidence</div>
              </div>
              <button onClick={resetFilters} className="text-[10px] px-2.5 py-1.5 rounded-md border border-[#34435b] muted hover:text-white flex items-center gap-1.5 self-start sm:self-auto"><Filter size={12} />Reset filters</button>
            </div>
            <div className="grid sm:grid-cols-4 gap-2 mt-4">
              <FilterSelect label="Severity" value={filters.severity} onChange={value => setFilter('severity', value)} options={['All', 'Critical', 'High', 'Medium', 'Low']} />
              <FilterSelect label="Status" value={filters.status} onChange={value => setFilter('status', value)} options={statuses} />
              <FilterSelect label="Category" value={filters.category} onChange={value => setFilter('category', value)} options={categories} />
              <FilterSelect label="Confidence" value={filters.confidence} onChange={value => setFilter('confidence', value)} options={confidenceBands} />
            </div>
          </div>
          <div>{shown.length ? shown.map(r => <Recommendation key={r.id} r={r} />) : <div className="p-10 text-center text-xs muted">No recommendations match the current search and filters.</div>}</div>
        </div>
        <div className="space-y-5"><TrustReadinessScore data={data} /><AutonomyDial /><TrustScore /><AgentSummary data={data} /></div>
      </div>
    </Page>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="label block mb-1.5">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="filter-select w-full bg-[#111a2a] border border-[#314057] px-3 py-2 rounded-lg text-[11px] outline-none">
        {options.map(x => <option key={x} value={x}>{x}</option>)}
      </select>
    </label>
  )
}

function Stat({ icon: Icon, label, value, delta, color }) {
  return (
    <div className="card p-4 trust-fade">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] muted">{label}</div>
          <div className="text-2xl font-bold mt-2">{value}</div>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}><Icon size={18} /></div>
      </div>
      <div className="text-[10px] mt-3 muted">{delta}</div>
    </div>
  )
}

function Recommendation({ r }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(`/explanation/${r.id}`)} className="recommendation-row w-full text-left p-4 border-b border-[#202d42] last:border-0 hover:bg-[#172238]/60 transition group">
      <div className="flex gap-3">
        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${r.severity === 'Critical' ? 'bg-red-400' : r.severity === 'High' ? 'bg-orange-400' : r.severity === 'Medium' ? 'bg-amber-400' : 'bg-sky-400'}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold text-[13px]">{r.title}</div>
            <span className={`pill border !py-0.5 ${severityTone[r.severity]}`}>{r.severity}</span>
            <span className={`pill border !py-0.5 ${statusTone[r.status] || 'bg-[#24334b] text-[#a9b8d0] border-[#364860]'}`}>{r.status}</span>
          </div>
          <p className="text-[11px] muted mt-1.5 line-clamp-1">{r.summary}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] muted">
            <span className="flex gap-1.5 items-center"><CircleGauge size={12} className="text-emerald-400" />{r.confidence}% confidence</span>
            <span>{r.affected} affected</span>
            <span>{r.category}</span>
            <span>{r.time}</span>
          </div>
        </div>
        <ChevronRight size={16} className="muted group-hover:text-white mt-4" />
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
          <div className="text-[11px] muted mt-1">Across active decisions</div>
        </div>
        <ShieldCheck size={20} className="text-emerald-400" />
      </div>
      <div className="flex items-center gap-4 mt-5">
        <div className="relative w-20 h-20 rounded-full flex items-center justify-center trust-orbit" style={{ background: 'conic-gradient(#46c99a 0 88%, #243149 88%)' }}>
          <div className="absolute inset-[7px] rounded-full bg-[#101a2b]" />
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

function TrustReadinessScore({ data }) {
  const recs = data.recommendations.length ? data.recommendations : fallback.recommendations
  const avg = key => Math.round(recs.reduce((sum, r) => sum + getSprint(r).readiness[key], 0) / recs.length)
  const inputs = [
    ['Data Quality', avg('dataQuality')],
    ['Evidence Strength', avg('evidenceStrength')],
    ['Human Agreement', avg('humanAgreement')],
    ['Agent Consensus', avg('agentConsensus')]
  ]
  const score = Math.round(inputs.reduce((sum, [, n]) => sum + n, 0) / inputs.length)

  return (
    <div className="card p-5">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-sm">Trust readiness score</div>
          <div className="text-[11px] muted mt-1">Evidence, humans and agents aligned</div>
        </div>
        <span className="pill bg-emerald-500/10 text-emerald-300">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#263249] mt-4 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#6689ff] to-[#50d3a0] trust-meter" style={{ width: `${score}%` }} />
      </div>
      <div className="mt-4 space-y-2">
        {inputs.map(([label, n]) => <Meter key={label} label={label} n={n} />)}
      </div>
    </div>
  )
}

function AutonomyDial() {
  const [level, setLevel] = useState('Recommend Only')
  const options = [
    { label: 'Always Ask Me', desc: 'TrustLens waits for explicit human approval on every recommendation.' },
    { label: 'Recommend Only', desc: 'TrustLens explains and ranks actions without executing them.' },
    { label: 'Auto Approve Low Risk', desc: 'Low-risk recommendations can be marked ready while higher risk stays gated.' }
  ]

  return (
    <div className="card p-5">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-semibold text-sm">Autonomy dial</div>
          <div className="text-[11px] muted mt-1">Visual policy preview only</div>
        </div>
        <CircleGauge size={19} className="text-[#8ca4ff]" />
      </div>
      <div className="grid gap-2 mt-4">
        {options.map((o, i) => <button key={o.label} onClick={() => setLevel(o.label)} className={`text-left rounded-lg border p-2.5 transition trust-button ${level === o.label ? 'border-[#6689ff] bg-[#294582]/35' : 'border-[#30405a] bg-[#0d1727]'}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${level === o.label ? 'bg-emerald-400 live' : 'bg-[#53627a]'}`} />
            <span className="text-[11px] font-semibold">{o.label}</span>
          </div>
          <div className="text-[9px] muted mt-1">{o.desc}</div>
        </button>)}
      </div>
      <div className="mt-4 rounded-lg border border-[#2d3e58] bg-[#0b1725] p-3 text-[10px] text-[#b8c5db]">
        Current posture: <span className="text-[#9cb2ff] font-semibold">{level}</span>. Automation remains simulated for this sprint.
      </div>
    </div>
  )
}

function Meter({ label, n }) {
  return (
    <div>
      <div className="flex text-[9px] justify-between muted"><span>{label}</span><span>{n}%</span></div>
      <div className="h-1 bg-[#263249] rounded mt-1"><div className="h-full bg-[#5b7fff] rounded trust-meter" style={{ width: `${n}%` }} /></div>
    </div>
  )
}

function AgentSummary() {
  return (
    <div className="card p-5">
      <div className="flex justify-between">
        <div>
          <div className="font-semibold text-sm">Active AI agents</div>
          <div className="text-[11px] muted mt-1">8 collaborating now</div>
        </div>
        <Network size={18} className="text-[#718cff]" />
      </div>
      <div className="mt-4 space-y-3">{['Identity Analyst', 'Risk Assessor', 'Policy Validator', 'Endpoint Scanner'].map(x => <div className="flex items-center gap-2.5" key={x}><div className="w-7 h-7 bg-[#1c2a43] rounded-lg flex items-center justify-center"><Bot size={13} className="text-[#7491ff]" /></div><div className="text-[11px] flex-1">{x}</div><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live" /></div>)}</div>
      <NavLink to="/explanation/1" className="block text-center mt-4 text-[11px] text-[#7993ff] border-t border-[#26344d] pt-3">View transparency map →</NavLink>
    </div>
  )
}

function Explanation({ data, setData }) {
  const { id } = useParams()
  const r = data.recommendations.find(x => x.id === +id) || data.recommendations[0]
  const trace = ['Telemetry received', 'Threat detected', 'Policy validation', 'Risk assessment', 'Recommendation generated']

  return (
    <Page>
      <NavLink to="/" className="inline-flex items-center gap-2 text-xs muted hover:text-white mb-5"><ArrowLeft size={14} />Back to recommendations</NavLink>
      <Header eyebrow={`${r.category} · ${r.severity} risk`} title={r.title} desc={r.summary} />
      <div className="grid xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <section className="card p-5">
            <SectionTitle icon={Sparkles} title="Why TrustLens recommends this" tag="Reasoning trace" />
            <div className="grid sm:grid-cols-5 gap-2 mt-5 mb-5">{trace.map((x, i) => <div key={x} className="trace-step rounded-lg border border-[#2b3b56] bg-[#111e31] p-2.5" style={{ animationDelay: `${i * 130}ms` }}><CheckCircle2 size={13} className="text-emerald-400 mb-2" /><div className="text-[9px] font-semibold">{x}</div></div>)}</div>
            <div className="pl-3 border-l-2 border-[#4e6bd0] space-y-5">{r.evidence.map((e, i) => <div key={e} className="trace-step" style={{ animationDelay: `${700 + i * 120}ms` }}><div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#284486] text-[#9cb2ff] flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span><div><div className="text-xs font-medium">{e}</div><div className="text-[10px] muted mt-1">Verified against current tenant data · {i === 2 ? 'Policy simulation' : 'Direct observation'}</div></div></div></div>)}</div>
            <div className="mt-5 bg-[#0b1725] border border-[#253955] rounded-lg p-3.5 trust-glow">
              <div className="label mb-1.5">Expected impact</div>
              <div className="text-xs text-emerald-200">{r.impact}</div>
            </div>
          </section>
          <Sources r={r} />
          <AgentMap r={r} />
        </div>
        <div className="space-y-5">
          <Confidence n={r.confidence} />
          <Warning text={r.limitation} />
          <HumanContextOverride r={r} />
          <Decision r={r} data={data} setData={setData} />
        </div>
      </div>
    </Page>
  )
}

function SectionTitle({ icon: Icon, title, tag }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-[#294582]/50 flex items-center justify-center text-[#82a0ff]"><Icon size={16} /></div><div className="font-semibold text-sm">{title}</div></div>
      {tag && <span className="pill bg-[#284170]/45 text-[#91aaff]">{tag}</span>}
    </div>
  )
}

function Sources({ r }) {
  return (
    <section className="card p-5">
      <SectionTitle icon={Database} title="Data sources & attribution" tag={`${r.sources.length} sources`} />
      <div className="grid sm:grid-cols-2 gap-3 mt-4">{r.sources.map((s, i) => <div key={s} className="border border-[#2a3950] rounded-lg p-3 flex gap-3 items-center trust-fade"><div className="w-8 h-8 rounded bg-[#182a40] flex items-center justify-center"><Database size={14} className="text-sky-300" /></div><div className="min-w-0 flex-1"><div className="text-[11px] font-medium truncate">{s}</div><div className="text-[9px] muted mt-1">Synced {i ? '14 min' : '2 min'} ago · Verified</div></div><ExternalLink size={12} className="muted" /></div>)}</div>
    </section>
  )
}

function AgentMap({ r }) {
  const agents = r.agents || []
  const votes = getSprint(r).agentVotes
  const support = votes.filter(a => a.vote === 'Approve').length
  const consensus = votes.length ? Math.round((support / votes.length) * 100) : 0

  return (
    <section className="card p-5">
      <SectionTitle icon={Network} title="Agent disagreement visualization" tag={`${support} of ${votes.length} support action`} />
      <p className="text-[11px] muted mt-3">Agents can agree, disagree or request more context before a human approves the action.</p>
      <div className="flex items-center justify-center gap-2 mt-6 overflow-x-auto pb-2">{votes.map((a, i) => <React.Fragment key={a.name}><div className="agent-active min-w-[135px] border border-[#304264] rounded-lg p-3 text-center bg-[#121f33]" style={{ '--delay': `${i * .55}s` }}><div className="w-8 h-8 bg-[#263d76] rounded-full flex items-center justify-center mx-auto"><Bot size={15} /></div><div className="text-[10px] mt-2 font-semibold">{a.name}</div><div className={`text-[9px] mt-1 ${a.vote === 'Approve' ? 'text-emerald-300' : 'text-amber-300'}`}>{a.vote}</div></div>{i < votes.length - 1 && <div className="relative w-7 h-px bg-[#425372] shrink-0 overflow-visible"><span className="absolute w-1.5 h-1.5 rounded-full bg-[#7290ff] -top-[3px] left-0 live" /></div>}</React.Fragment>)}</div>
      <div className="mt-5 rounded-lg border border-[#2d3e58] bg-[#0b1725] p-3">
        <div className="flex justify-between text-[10px] muted"><span>Consensus level</span><span>{consensus}%</span></div>
        <div className="h-1.5 bg-[#263249] rounded mt-2 overflow-hidden"><div className="h-full bg-[#6f8cff] rounded trust-meter" style={{ width: `${consensus}%` }} /></div>
      </div>
    </section>
  )
}

function Confidence({ n }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    let start
    const tick = t => {
      start ??= t
      const p = Math.min((t - start) / 850, 1)
      setShown(Math.round(n * p))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [n])

  return (
    <div className="card p-5">
      <SectionTitle icon={CircleGauge} title="Confidence" />
      <div className="flex items-end gap-2 mt-5"><span className="text-4xl font-bold">{shown}%</span><span className="pill bg-emerald-500/10 text-emerald-300 mb-1">High</span></div>
      <div className="h-2 rounded-full bg-[#263249] mt-4"><div className="h-full rounded-full bg-gradient-to-r from-[#4f79ff] to-[#45cf9c] transition-[width] duration-1000" style={{ width: `${shown}%` }} /></div>
      <div className="grid grid-cols-3 mt-4 text-center"><div><b className="text-[11px]">96%</b><div className="text-[9px] muted">Data quality</div></div><div className="border-x border-[#2a374c]"><b className="text-[11px]">91%</b><div className="text-[9px] muted">Consensus</div></div><div><b className="text-[11px]">95%</b><div className="text-[9px] muted">Policy match</div></div></div>
    </div>
  )
}

function Warning({ text }) {
  return (
    <div className="rounded-xl p-4 bg-amber-500/[.07] border border-amber-400/25">
      <div className="flex gap-2 text-amber-300 text-xs font-semibold"><AlertTriangle size={15} />Known limitation</div>
      <p className="text-[10px] text-amber-100/65 mt-2 leading-relaxed">{text}</p>
      <button className="text-[10px] text-amber-300 mt-2">View all assumptions →</button>
    </div>
  )
}

function HumanContextOverride({ r }) {
  const insight = getSprint(r)
  const [context, setContext] = useState('')
  const applied = context.trim().length > 0
  const updated = Math.max(35, Math.min(99, r.confidence + (applied ? insight.override.delta : 0)))

  return (
    <div className="card p-5">
      <SectionTitle icon={UserCheck} title="Human context override" tag="Simulated" />
      <p className="text-[10px] muted mt-3">Administrators can add operational context before approval. This recalculates confidence visually only.</p>
      <textarea value={context} onChange={e => setContext(e.target.value)} rows="3" placeholder={`Example: ${insight.override.example}`} className="w-full mt-4 bg-[#0c1524] border border-[#34435b] rounded-lg p-3 text-xs outline-none focus:border-[#6787f3]" />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <Mini n={`${r.confidence}%`} l="Original confidence" />
        <Mini n={`${updated}%`} l="Updated confidence" />
      </div>
      <div className="mt-3 rounded-lg border border-[#2d3e58] bg-[#0b1725] p-3">
        <div className="label mb-1">Reason for change</div>
        <div className="text-[10px] muted">{applied ? insight.override.reason : 'Enter context to simulate a confidence adjustment.'}</div>
      </div>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="card w-full max-w-lg p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between"><div className="font-semibold">{title}</div><button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center"><X size={16} /></button></div>
        {children}
      </div>
    </div>
  )
}

function Decision({ r, data, setData }) {
  const [mode, setMode] = useState(null)
  const [reason, setReason] = useState('')
  const [reviewer, setReviewer] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const latestAudit = data.audit.find(a => a.target === r.title && ['reject', 'escalation', 'approval'].includes(a.type))

  const addAudit = (status, why, result, type) => ({ id: Date.now(), time: new Date().toLocaleTimeString([], { hour12: false }), actor: 'Alex Smith', action: status === 'Escalated' ? 'Escalated to human review' : `${status} recommendation`, target: r.title, result, type, reason: why })

  const decide = async (status, why = '') => {
    if (status === 'Rejected' && !why.trim()) {
      setError('Please provide a rejection reason.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/recommendations/${r.id}/decision`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, reason: why }) })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      setData(d => ({ ...d, recommendations: d.recommendations.map(x => x.id === r.id ? { ...x, status } : x), audit: [addAudit(status, why, 'Decision recorded', status === 'Rejected' ? 'reject' : 'approval'), ...d.audit] }))
      setMode(null)
      setReason('')
    } catch (e) {
      setError(e.message || 'Could not save the decision.')
    } finally {
      setBusy(false)
    }
  }

  const escalate = async () => {
    if (!reviewer.trim() || !reason.trim()) {
      setError('Reviewer and escalation reason are required.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/recommendations/${r.id}/escalate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviewer, reason }) })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      setData(d => ({ ...d, recommendations: d.recommendations.map(x => x.id === r.id ? { ...x, status: 'Escalated' } : x), audit: [addAudit('Escalated', reason, `Reviewer: ${reviewer}`, 'escalation'), ...d.audit] }))
      setMode(null)
      setReason('')
      setReviewer('')
    } catch (e) {
      setError(e.message || 'Could not escalate.')
    } finally {
      setBusy(false)
    }
  }

  const decisionState = r.status === 'Approved' ? { tone: 'emerald', text: 'Approved for staged rollout' } :
    r.status === 'Rejected' ? { tone: 'red', text: 'Rejected with reason recorded' } :
    r.status === 'Escalated' ? { tone: 'amber', text: latestAudit?.result || 'Escalated to human review' } : null

  return (
    <>
      <div className="card p-5 decision-card">
        <SectionTitle icon={UserCheck} title="Human decision" />
        <p className="text-[10px] muted mt-3">No action will be taken without administrator approval. Explanations, alternatives and rejection reasons are preserved.</p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={() => setMode('why')} className="border border-[#38475f] py-2 rounded-lg text-[10px] hover:text-white trust-button">Ask Why</button>
          <button onClick={() => setMode('alternatives')} className="border border-[#38475f] py-2 rounded-lg text-[10px] hover:text-white trust-button">See Alternatives</button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <NavLink to={`/courtroom/${r.id}`} className="text-center border border-[#38475f] py-2 rounded-lg text-[10px] muted hover:text-white trust-button">AI Courtroom</NavLink>
          <NavLink to={`/simulator/${r.id}`} className="text-center border border-[#38475f] py-2 rounded-lg text-[10px] muted hover:text-white trust-button">Simulator</NavLink>
        </div>
        {decisionState && (
          <div className={`decision-success mt-3 rounded-lg p-3 text-xs flex gap-2 ${decisionState.tone === 'emerald' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : decisionState.tone === 'red' ? 'bg-red-500/10 border border-red-500/20 text-red-300' : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'}`}>
            <CheckCircle2 size={16} />{decisionState.text}
          </div>
        )}
        {latestAudit?.reason && ['Rejected', 'Escalated'].includes(r.status) && <div className="mt-2 text-[10px] muted bg-[#0c1524] border border-[#27364d] rounded-lg p-2.5">Reason: {latestAudit.reason}</div>}
        {r.status !== 'Approved' && (
          <div className="space-y-2 mt-3">
            <button disabled={busy || r.status === 'Rejected'} onClick={() => decide('Approved')} className="w-full bg-[#3159db] disabled:opacity-60 hover:bg-[#4068e9] py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"><Check size={15} />Approve recommendation</button>
            <button disabled={busy || r.status === 'Rejected'} onClick={() => { setError(''); setMode('reject') }} className="w-full border border-[#38475f] disabled:opacity-60 py-2.5 rounded-lg text-xs muted hover:text-white flex items-center justify-center gap-2"><X size={14} />Reject with reason</button>
            <button disabled={busy || r.status === 'Escalated' || r.status === 'Rejected'} onClick={() => { setError(''); setMode('escalate') }} className="w-full border border-amber-500/30 disabled:opacity-60 text-amber-300 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2"><UserCheck size={14} />Escalate to human review</button>
          </div>
        )}
        <div className="flex gap-2 mt-4 text-[9px] muted"><LockKeyhole size={12} />Decision is signed and added to the audit trail.</div>
      </div>
      {mode === 'why' && <WhyModal r={r} onClose={() => setMode(null)} />}
      {mode === 'alternatives' && <AlternativesModal r={r} onClose={() => setMode(null)} />}
      {mode === 'reject' && <Modal title="Reject recommendation" onClose={() => setMode(null)}><label className="label block mt-4 mb-2">Rejection reason</label><textarea autoFocus value={reason} onChange={e => { setReason(e.target.value); setError('') }} rows="4" placeholder="Explain why this recommendation should not proceed…" className="w-full bg-[#0c1524] border border-[#34435b] rounded-lg p-3 text-xs outline-none focus:border-[#6787f3]" />{error && <div className="text-[10px] text-red-300 mt-2">{error}</div>}<button disabled={busy} onClick={() => decide('Rejected', reason)} className="w-full mt-4 bg-red-500/15 text-red-200 border border-red-500/30 py-2.5 rounded-lg text-xs font-semibold">{busy ? 'Saving…' : 'Confirm rejection'}</button></Modal>}
      {mode === 'escalate' && <Modal title="Escalate to human review" onClose={() => setMode(null)}><label className="label block mt-4 mb-2">Reviewer name</label><input value={reviewer} onChange={e => { setReviewer(e.target.value); setError('') }} placeholder="e.g. Priya Sharma" className="w-full bg-[#0c1524] border border-[#34435b] rounded-lg p-3 text-xs outline-none focus:border-[#6787f3]" /><label className="label block mt-4 mb-2">Escalation reason</label><textarea value={reason} onChange={e => { setReason(e.target.value); setError('') }} rows="4" placeholder="Why is additional human review needed?" className="w-full bg-[#0c1524] border border-[#34435b] rounded-lg p-3 text-xs outline-none focus:border-[#6787f3]" />{error && <div className="text-[10px] text-red-300 mt-2">{error}</div>}<button disabled={busy} onClick={escalate} className="w-full mt-4 bg-amber-500/15 text-amber-200 border border-amber-500/30 py-2.5 rounded-lg text-xs font-semibold">{busy ? 'Escalating…' : 'Submit escalation'}</button></Modal>}
    </>
  )
}

function WhyModal({ r, onClose }) {
  return (
    <Modal title="Why this recommendation?" onClose={onClose}>
      <p className="text-xs leading-relaxed mt-4 text-[#b6c3d8]">{r.why || r.summary}</p>
      <div className="label mt-5 mb-2">Key evidence</div>
      {r.evidence.map(x => <div key={x} className="text-[11px] flex gap-2 mb-2"><CheckCircle2 size={13} className="text-emerald-400 shrink-0" />{x}</div>)}
      <div className="label mt-5 mb-2">Confidence factors</div>
      {(r.confidenceFactors || ['Tenant data quality', 'Agent consensus', 'Policy alignment']).map(x => <div key={x} className="text-[11px] muted mb-1.5">• {x}</div>)}
      <div className="label mt-5 mb-2">Potential weaknesses</div>
      {(r.weaknesses || [r.limitation]).map(x => <div key={x} className="text-[11px] text-amber-200/70 mb-1.5">• {x}</div>)}
    </Modal>
  )
}

function AlternativesModal({ r, onClose }) {
  const options = r.alternatives || []
  return (
    <Modal title="Options considered" onClose={onClose}>
      <p className="text-[11px] muted mt-3">TrustLens compared these actions before making its recommendation. Lower-scoring options stay visible so reviewers can challenge the model.</p>
      <div className="space-y-3 mt-4">
        {options.length ? options.map((a, i) => <div key={a.name} className={`alternative-card rounded-lg border p-3 ${a.selected ? 'border-emerald-500/35 bg-emerald-500/[.06]' : 'border-[#2d3c54]'}`}><div className="flex justify-between gap-3"><div className="text-xs font-semibold">{a.selected ? 'Recommended action' : `Alternative ${i}`}: {a.name}</div><span className="text-xs font-bold text-emerald-300">{a.confidence}%</span></div><p className="text-[10px] muted mt-2">{a.reason}</p></div>) : <div className="text-[11px] muted border border-[#2d3c54] rounded-lg p-3">No alternate actions were attached to this recommendation.</div>}
      </div>
    </Modal>
  )
}

function Courtroom({ data }) {
  const { id } = useParams()
  const r = data.recommendations.find(x => x.id === +id) || data.recommendations[0]
  const insight = getSprint(r)

  return (
    <Page>
      <NavLink to={`/explanation/${r.id}`} className="inline-flex items-center gap-2 text-xs muted hover:text-white mb-5"><ArrowLeft size={14} />Back to explanation</NavLink>
      <Header eyebrow="AI COURTROOM" title={r.title} desc="The recommendation is challenged before approval: evidence argues for action, defense raises constraints, and the verdict stays reviewable." />
      <div className="grid xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <section className="card p-5">
            <SectionTitle icon={ShieldCheck} title="Recommendation on trial" tag={r.severity} />
            <div className="mt-4 rounded-lg border border-[#2d3e58] bg-[#0b1725] p-4">
              <div className="label mb-1">Recommendation</div>
              <div className="text-sm font-semibold">{r.title}</div>
              <p className="text-[11px] muted mt-2">{r.summary}</p>
            </div>
          </section>
          <div className="grid lg:grid-cols-2 gap-5">
            <section className="card p-5 courtroom-column">
              <SectionTitle icon={CheckCircle2} title="Prosecution evidence" tag="Supports action" />
              <div className="mt-4 space-y-3">{insight.prosecution.map((x, i) => <EvidenceLine key={x} n={i + 1} text={x} tone="emerald" />)}</div>
            </section>
            <section className="card p-5 courtroom-column">
              <SectionTitle icon={AlertTriangle} title="Defense arguments" tag="Challenges action" />
              <div className="mt-4 space-y-3">{insight.defense.map((x, i) => <EvidenceLine key={x} n={i + 1} text={x} tone="amber" />)}</div>
            </section>
          </div>
          <section className="card p-5">
            <SectionTitle icon={FileText} title="Limitations" tag="Known boundaries" />
            <div className="mt-4 text-xs text-amber-100/70 leading-relaxed">{r.limitation}</div>
          </section>
        </div>
        <div className="space-y-5">
          <Confidence n={r.confidence} />
          <div className="card p-5 trust-glow">
            <div className="label mb-2">Verdict</div>
            <div className="text-sm font-semibold text-emerald-200">{insight.verdict}</div>
            <p className="text-[10px] muted mt-3">Courtroom verdicts are advisory. The human approval gate remains in control.</p>
            <NavLink to={`/simulator/${r.id}`} className="mt-4 inline-flex w-full justify-center border border-[#38475f] py-2.5 rounded-lg text-xs muted hover:text-white trust-button">Run what-if simulator →</NavLink>
          </div>
          <AgentVerdict r={r} />
        </div>
      </div>
    </Page>
  )
}

function EvidenceLine({ n, text, tone }) {
  return (
    <div className="trace-step flex gap-3 rounded-lg border border-[#2c3c55] bg-[#101b2d] p-3">
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>{n}</span>
      <span className="text-[11px] leading-relaxed">{text}</span>
    </div>
  )
}

function AgentVerdict({ r }) {
  const votes = getSprint(r).agentVotes
  const support = votes.filter(v => v.vote === 'Approve').length
  return (
    <div className="card p-5">
      <SectionTitle icon={Network} title="Agent verdict" tag={`${support} of ${votes.length}`} />
      <div className="mt-4 space-y-2">{votes.map(v => <div key={v.name} className="flex items-center justify-between rounded-lg bg-[#0d1727] border border-[#2d3e58] px-3 py-2"><span className="text-[11px]">{v.name}</span><span className={`pill !py-1 ${v.vote === 'Approve' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>{v.vote}</span></div>)}</div>
    </div>
  )
}

function DecisionSimulator({ data }) {
  const { id } = useParams()
  const r = data.recommendations.find(x => x.id === +id) || data.recommendations[0]
  const sim = getSprint(r).simulation

  return (
    <Page>
      <NavLink to={`/explanation/${r.id}`} className="inline-flex items-center gap-2 text-xs muted hover:text-white mb-5"><ArrowLeft size={14} />Back to explanation</NavLink>
      <Header eyebrow="DECISION SIMULATOR" title={`What if: ${r.title}`} desc="Structured outcome preview only. No AI call and no real automation is performed." />
      <div className="grid xl:grid-cols-2 gap-5">
        <ScenarioCard title="If approved" tone="emerald" items={[
          ['Risk Reduction', sim.approved.riskReduction],
          ['Security Benefit', sim.approved.securityBenefit],
          ['Operational Impact', sim.approved.operationalImpact]
        ]} />
        <ScenarioCard title="If rejected" tone="red" items={[
          ['Risk Increase', sim.rejected.riskIncrease],
          ['Threat Exposure', sim.rejected.threatExposure],
          ['Operational Impact', sim.rejected.operationalImpact]
        ]} />
      </div>
      <div className="grid xl:grid-cols-[1fr_320px] gap-5 mt-5">
        <section className="card p-5">
          <SectionTitle icon={Sparkles} title="Decision timeline" tag="Simulated" />
          <div className="grid md:grid-cols-4 gap-2 mt-5">{['Human reviews context', 'Courtroom challenge', 'Decision recorded', 'Audit trail updated'].map((x, i) => <div key={x} className="trace-step rounded-lg border border-[#2b3b56] bg-[#111e31] p-3" style={{ animationDelay: `${i * 120}ms` }}><CheckCircle2 size={13} className="text-emerald-400 mb-2" /><div className="text-[10px] font-semibold">{x}</div></div>)}</div>
        </section>
        <div className="card p-5">
          <div className="label mb-2">Recommended next step</div>
          <div className="text-sm font-semibold">{getSprint(r).verdict}</div>
          <NavLink to={`/courtroom/${r.id}`} className="mt-4 inline-flex w-full justify-center border border-[#38475f] py-2.5 rounded-lg text-xs muted hover:text-white trust-button">Challenge in AI Courtroom</NavLink>
        </div>
      </div>
    </Page>
  )
}

function ScenarioCard({ title, tone, items }) {
  return (
    <section className={`card p-5 scenario-card ${tone}`}>
      <SectionTitle icon={tone === 'emerald' ? CheckCircle2 : AlertTriangle} title={title} tag={tone === 'emerald' ? 'Action taken' : 'Action deferred'} />
      <div className="mt-5 space-y-3">{items.map(([label, value]) => <div key={label} className="rounded-lg border border-[#2d3e58] bg-[#0b1725] p-3"><div className="label mb-1">{label}</div><div className="text-xs leading-relaxed">{value}</div></div>)}</div>
    </section>
  )
}

function Approvals({ data, setData }) {
  const pending = data.recommendations.filter(r => !['Approved', 'Rejected'].includes(r.status))
  const escalated = pending.filter(r => r.status === 'Escalated').length
  return (
    <Page>
      <Header eyebrow="HUMAN OVERSIGHT" title="Approval center" desc="Review high-impact AI recommendations before execution." action={<span className="pill bg-[#4e6ee5]/15 text-[#91a7ff]">{pending.length} awaiting review · {escalated} escalated</span>} />
      <div className="grid xl:grid-cols-[1fr_300px] gap-5">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_130px] text-[10px] label px-5 py-3 border-b border-[#26344d]"><span>Recommendation</span><span>Confidence</span><span>Decision</span></div>
          {pending.map(r => <ApprovalRow key={r.id} r={r} setData={setData} />)}
          {!pending.length && <div className="p-10 text-center text-xs muted">No recommendations are awaiting review.</div>}
        </div>
        <div className="space-y-4">
          <div className="card p-5"><div className="font-semibold text-sm">Oversight policy</div><p className="text-[11px] muted mt-2 leading-relaxed">High-impact changes require one Global Administrator. Critical identity changes require two approvers.</p><div className="mt-4 text-[10px] bg-[#15213a] rounded-lg p-3 text-[#9db0d1]">Policy TL-GOV-04 · Active</div></div>
          <div className="card p-5"><div className="font-semibold text-sm">This week</div><div className="grid grid-cols-2 gap-3 mt-4"><Mini n="19" l="Approved" /><Mini n="3" l="Rejected" /><Mini n="12m" l="Avg. review" /><Mini n="0" l="Bypassed" /></div></div>
        </div>
      </div>
    </Page>
  )
}

function ApprovalRow({ r, setData }) {
  const navigate = useNavigate()
  const approve = async () => {
    const res = await fetch(`/api/recommendations/${r.id}/decision`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Approved' }) })
    if (res.ok) setData(d => ({ ...d, recommendations: d.recommendations.map(x => x.id === r.id ? { ...x, status: 'Approved' } : x), audit: [{ id: Date.now(), time: new Date().toLocaleTimeString([], { hour12: false }), actor: 'Alex Smith', action: 'Approved recommendation', target: r.title, result: 'Decision recorded', type: 'approval', reason: '' }, ...d.audit] }))
  }
  return (
    <div className="grid grid-cols-[1fr_100px_130px] items-center px-5 py-4 border-b border-[#26344d] last:border-0">
      <button onClick={() => navigate(`/explanation/${r.id}`)} className="text-left pr-3"><div className="text-xs font-semibold hover:text-[#8ca4ff]">{r.title}</div><div className="text-[10px] muted mt-1">{r.affected} resources · {r.severity} risk · {r.status}</div></button>
      <div className="text-xs font-bold text-emerald-300">{r.confidence}%</div>
      <div className="flex gap-1.5 items-center">
        {r.status === 'Escalated' && <span className="pill !py-1 bg-amber-500/10 text-amber-300">Escalated</span>}
        <button aria-label="Approve" onClick={approve} className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 flex items-center justify-center"><Check size={14} /></button>
        <button aria-label="Review and reject" title="Review and provide rejection reason" onClick={() => navigate(`/explanation/${r.id}`)} className="w-8 h-8 rounded-md bg-red-500/10 text-red-300 hover:bg-red-500/20 flex items-center justify-center"><X size={14} /></button>
      </div>
    </div>
  )
}

function Mini({ n, l }) {
  return <div className="bg-[#111d30] rounded-lg p-3"><div className="font-bold">{n}</div><div className="text-[9px] muted mt-1">{l}</div></div>
}

function Audit({ data }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const normalized = query.toLowerCase()
  const rows = data.audit.filter(a => (type === 'All' || a.type === type) && [a.time, a.actor, a.action, a.target, a.result, a.reason, a.type].some(v => String(v || '').toLowerCase().includes(normalized)))
  const exportCsv = () => {
    const clean = v => `"${String(v || '').replaceAll('"', '""')}"`
    const csv = ['Time,Actor,Action,Target,Result,Type,Reason', ...rows.map(a => [a.time, a.actor, a.action, a.target, a.result, a.type, a.reason].map(clean).join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'trustlens-audit.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Page>
      <Header eyebrow="GOVERNANCE" title="Audit trail" desc="A tamper-evident record of every AI and human decision." action={<button onClick={exportCsv} className="border border-[#3a4961] px-3 py-2 rounded-lg text-xs flex items-center gap-2 trust-button"><FileCheck2 size={14} />Export filtered report</button>} />
      <div className="grid grid-cols-3 gap-3 mb-5"><Stat icon={FileText} label="Events today" value={data.audit.length} delta="Across all systems" color="#6f8cff" /><Stat icon={CheckCircle2} label="Successful actions" value="98.4%" delta="No policy violations" color="#50d3a0" /><Stat icon={LockKeyhole} label="Integrity status" value="Valid" delta="Last verified 1m ago" color="#aa80ff" /></div>
      <IncidentReports audit={data.audit} />
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[#26344d] flex flex-col sm:flex-row gap-3">
          <div className="flex items-center border border-[#314057] rounded-lg px-3 py-2 flex-1 max-w-sm"><Search size={14} className="muted" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search time, actor, action, target, result or reason…" className="bg-transparent outline-0 text-xs ml-2 w-full" /></div>
          <select aria-label="Filter audit event type" value={type} onChange={e => setType(e.target.value)} className="bg-[#111a2a] border border-[#314057] px-3 py-2 rounded-lg text-[10px] outline-none">
            <option>All</option><option value="approval">Approvals</option><option value="reject">Rejections</option><option value="escalation">Escalations</option><option value="ai">AI events</option><option value="system">System</option><option value="edit">Edits</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead><tr className="label border-b border-[#26344d]">{['Time', 'Actor', 'Activity', 'Target', 'Result'].map(x => <th key={x} className="px-5 py-3 font-semibold">{x}</th>)}</tr></thead>
            <tbody>{rows.map((a, i) => <tr key={a.id || `${a.time}-${i}`} className="audit-entry border-b border-[#202d42] last:border-0 hover:bg-white/[.02]"><td className="px-5 py-4 text-[10px] muted font-mono">{a.time}</td><td className="px-5 py-4"><div className="flex gap-2 items-center"><div className={`w-7 h-7 rounded-lg flex items-center justify-center ${a.type === 'ai' ? 'bg-[#294480] text-[#91a8ff]' : 'bg-[#1d2b40] text-[#9babc2]'}`}>{a.type === 'ai' ? <Bot size={13} /> : <UserCheck size={13} />}</div><span className="text-[11px] font-medium">{a.actor}</span></div></td><td className="px-5 py-4 text-[11px]">{a.action}{a.reason && <div className="text-[9px] text-amber-200/65 mt-1 max-w-[250px]">Reason: {a.reason}</div>}</td><td className="px-5 py-4 text-[11px] muted">{a.target}</td><td className="px-5 py-4"><span className={`pill ${a.type === 'reject' ? 'bg-red-500/10 text-red-300' : a.type === 'escalation' || a.result === 'Pending review' ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{a.result}</span></td></tr>)}
            {!rows.length && <tr><td colSpan="5" className="p-10 text-center text-xs muted">No audit events match your search.</td></tr>}</tbody>
          </table>
        </div>
      </div>
    </Page>
  )
}

function IncidentReports({ audit }) {
  const incidents = audit.filter(a => ['reject', 'escalation'].includes(a.type)).slice(0, 4)
  if (!incidents.length) return null

  return (
    <section className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-semibold text-sm">AI incident report cards</div>
          <div className="text-[11px] muted mt-1">Generated when a recommendation is rejected or escalated.</div>
        </div>
        <span className="pill bg-amber-500/10 text-amber-300">{incidents.length} active</span>
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        {incidents.map((a, i) => <div key={a.id || `${a.time}-${i}`} className="card p-4 incident-card">
          <div className="flex items-center justify-between gap-3"><div className="text-xs font-semibold">{a.type === 'reject' ? 'Recommendation rejected' : 'Escalated to human review'}</div><span className={`pill !py-1 ${a.type === 'reject' ? 'bg-red-500/10 text-red-300' : 'bg-amber-500/10 text-amber-300'}`}>{a.time}</span></div>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <IncidentField label="What happened" value={`${a.actor} ${a.action.toLowerCase()} for ${a.target}.`} />
            <IncidentField label="Why it happened" value={a.reason || a.result || 'Reason not recorded.'} />
            <IncidentField label="Potential consequences" value={a.type === 'reject' ? 'Original risk may persist until a compensating control is chosen.' : 'Decision latency increases, but accountability and business context improve.'} />
            <IncidentField label="Suggested follow-up" value={a.type === 'reject' ? 'Review alternatives and document the compensating control.' : 'Assign reviewer, capture context, then approve or reject with reason.'} />
          </div>
        </div>)}
      </div>
    </section>
  )
}

function IncidentField({ label, value }) {
  return <div className="rounded-lg bg-[#0b1725] border border-[#2d3e58] p-3"><div className="label mb-1">{label}</div><div className="text-[10px] muted leading-relaxed">{value}</div></div>
}

function Page({ children }) {
  return <div className="p-5 md:p-8 max-w-[1480px] mx-auto">{children}</div>
}

createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>)
