import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil, ShieldCheck, Smartphone, Monitor, Laptop, LogOut,
  AlertTriangle, Lock, User, ChevronRight, TrendingUp,
} from 'lucide-react';
import { currentUser, auditLog } from '../mock-data';
import CircularProgressRing from '../components/CircularProgressRing';

// ── tiny helpers ────────────────────────────────────────────────────────────
const resultCfg = {
  success:  { text: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20'  },
  pending:  { text: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20'  },
  rejected: { text: 'text-red-400',    bg: 'bg-red-500/10   border-red-500/20'    },
};

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${on ? 'gradient-bg' : 'bg-[#1F2937]'}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#111827] border border-[#1F2937] rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-4">{children}</p>;
}

// ── Mini sparkline for override accuracy trend (animates draw on mount) ─────
function TrendSparkline({ data }: { data: { month: string; accuracy: number }[] }) {
  const W = 260, H = 64, pad = 4;
  const min = Math.min(...data.map(d => d.accuracy)) - 5;
  const max = Math.max(...data.map(d => d.accuracy)) + 5;
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (W - pad * 2));
  const ys = data.map(d => H - pad - ((d.accuracy - min) / (max - min)) * (H - pad * 2));

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const areaPath = `${linePath} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`;

  // Measure line length to drive stroke-dashoffset animation
  const lineRef = useRef<SVGPathElement>(null);
  const [lineLen, setLineLen] = useState(0);
  const [drawn,   setDrawn]   = useState(false);

  useEffect(() => {
    if (lineRef.current) {
      const len = lineRef.current.getTotalLength();
      setLineLen(len);
      // Kick the animation on next frame
      requestAnimationFrame(() => setDrawn(true));
    }
  }, [linePath]);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16 overflow-visible">
        <defs>
          <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#4F46E5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </linearGradient>
          <clipPath id="spark-clip">
            <rect
              x="0" y="0" height={H}
              width={drawn ? W : 0}
              style={{ transition: 'width 1.2s cubic-bezier(0.25, 1, 0.5, 1)' }}
            />
          </clipPath>
        </defs>
        {/* Area — clipped so it reveals left-to-right */}
        <g clipPath="url(#spark-clip)">
          <path d={areaPath} fill="url(#spark-grad)" />
        </g>
        {/* Line — stroke-dashoffset draw-on */}
        <path
          ref={lineRef}
          d={linePath}
          fill="none"
          stroke="#4F46E5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={lineLen || 1000}
          strokeDashoffset={drawn ? 0 : lineLen || 1000}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 1, 0.5, 1)' }}
        />
        {/* Dots — fade in after line */}
        {data.map((_d, i) => (
          <circle
            key={i}
            cx={xs[i]} cy={ys[i]} r="3" fill="#4F46E5"
            style={{
              opacity: drawn ? 1 : 0,
              transition: `opacity 0.3s ease ${0.8 + i * 0.06}s`,
            }}
          />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map(d => (
          <span key={d.month} className="text-[10px] text-slate-600">{d.month}</span>
        ))}
      </div>
    </div>
  );
}

// Animated horizontal bar (0 → value on mount)
function AnimatedBar({ value, className }: { value: number; className: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <div
      className={`h-full rounded-full ${className}`}
      style={{ width: `${width}%`, transition: 'width 1s cubic-bezier(0.25, 1, 0.5, 1)' }}
    />
  );
}

// ── Session device icon ──────────────────────────────────────────────────────
function DeviceIcon({ device }: { device: string }) {
  if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('mobile'))
    return <Smartphone className="w-4 h-4 text-slate-500 flex-shrink-0" />;
  if (device.toLowerCase().includes('macbook') || device.toLowerCase().includes('laptop'))
    return <Laptop className="w-4 h-4 text-slate-500 flex-shrink-0" />;
  return <Monitor className="w-4 h-4 text-slate-500 flex-shrink-0" />;
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const u = currentUser;

  const [notifs, setNotifs] = useState(u.notifications);
  const [editOpen, setEditOpen] = useState(false);

  // Only show this user's audit entries
  const myLog = auditLog.filter(r => r.actor === 'J. Watson' || r.actor === 'Alex Smith').slice(0, 5);

  const overDiff = u.overrideAccuracy - u.teamAvgOverrideAccuracy;
  const compLine =
    overDiff > 0
      ? `Your override accuracy is ${overDiff}% above the team average of ${u.teamAvgOverrideAccuracy}%.`
      : overDiff < 0
      ? `Your override accuracy is ${Math.abs(overDiff)}% below the team average of ${u.teamAvgOverrideAccuracy}%.`
      : `Your override accuracy is in line with the team average of ${u.teamAvgOverrideAccuracy}%.`;

  const categoryColors: Record<string, string> = {
    Identity: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    Endpoints: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    Network: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    Devices: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-6 pb-12">

      {/* Page header */}
      <div>
        <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Your role, decisions, and trust record.</p>
      </div>

      {/* ── SECTION 1: Identity ─────────────────────────────────────────── */}
      <SectionCard>
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
              <span className="text-xl font-bold text-white">{u.initials}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{u.name}</h2>
              <p className="text-sm text-indigo-400 font-medium">{u.role}</p>
              <p className="text-xs text-slate-500 mt-0.5">{u.org}</p>
              <p className="text-xs text-slate-500">{u.email}</p>
              <p className="text-xs text-slate-600 mt-1">Member since {u.memberSince}.</p>
            </div>
          </div>
          <button
            onClick={() => setEditOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1F2937] text-sm text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit profile
          </button>
        </div>

        {/* Inline edit panel (UI only) */}
        {editOpen && (
          <div className="mt-5 pt-5 border-t border-[#1F2937] grid grid-cols-2 gap-4">
            {[['Display name', u.name], ['Email', u.email], ['Notification email', u.email]].map(([label, val]) => (
              <div key={label}>
                <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                <input
                  defaultValue={val}
                  className="w-full bg-[#0D1120] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            ))}
            <div className="col-span-2 flex gap-2 justify-end">
              <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm border border-[#1F2937] text-slate-400 rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity font-semibold">Save changes</button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── SECTION 2: Trust calibration ────────────────────────────────── */}
      <div>
        <SectionLabel>Your trust calibration</SectionLabel>
        <div className="grid grid-cols-3 gap-4">

          {/* Headline + ring + trend */}
          <div className="col-span-2 bg-[#111827] border border-[#1F2937] rounded-xl p-5 space-y-5">
            {/* Headline stat */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Override accuracy</span>
                </div>
                <p className="text-white font-semibold text-base leading-snug max-w-sm">
                  When you override a recommendation, you've been right{' '}
                  <span className="text-green-400 font-bold text-xl">{u.overrideAccuracy}%</span>{' '}
                  of the time.
                </p>
                <p className="text-xs text-slate-500 mt-2">{compLine}</p>
              </div>
              <CircularProgressRing score={u.overrideAccuracy} size={80} strokeWidth={7} />
            </div>

            {/* Trend sparkline */}
            <div>
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">Override accuracy — last 6 months</p>
              <TrendSparkline data={u.overrideTrend} />
            </div>

            {/* 3 supporting stats */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { label: 'Decisions reviewed', value: u.totalDecisions.toString() },
                { label: 'Agreement rate with AI', value: `${u.agreementRate}%` },
                { label: 'Avg. review time', value: `${u.avgReviewTimeMins}m` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#0D1120] border border-[#1F2937] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: team comparison */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col gap-5">
            <div>
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-3">Team comparison</p>
              {[
                { label: 'You',          value: u.overrideAccuracy,        color: 'gradient-bg'     },
                { label: 'Team avg.',    value: u.teamAvgOverrideAccuracy, color: 'bg-slate-700'    },
                { label: 'Top quartile', value: 92,                        color: 'bg-green-500/30' },
              ].map(({ label, value, color }) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-300 font-medium">{value}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                    <AnimatedBar value={value} className={color} />
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-slate-600 mt-3 leading-relaxed">
                Calibration data is used to personalize how the AI presents evidence to you — not as a performance ranking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Recent activity ───────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Recent activity</SectionLabel>
          <button
            onClick={() => navigate('/audit')}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-4"
          >
            View full audit trail <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[140px_1fr_160px_160px] border-b border-[#1F2937]">
            {['Date', 'Recommendation', 'Decision', 'Outcome'].map(h => (
              <div key={h} className="px-4 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">{h}</div>
            ))}
          </div>
          {myLog.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-600 text-sm">No recent activity found.</div>
          )}
          {myLog.map((row, i) => {
            const rc = resultCfg[row.result];
            return (
              <div
                key={row.id}
                onClick={() => navigate(`/explanation/${row.recId}`)}
                className={`grid grid-cols-[140px_1fr_160px_160px] items-center cursor-pointer hover:bg-white/[0.03] transition-colors ${i < myLog.length - 1 ? 'border-b border-[#1F2937]' : ''}`}
              >
                <div className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{row.time}</div>
                <div className="px-4 py-3 text-xs text-slate-300 font-medium">{row.activity}</div>
                <div className="px-4 py-3">
                  <span className="text-xs font-mono text-slate-400 bg-[#0D1120] border border-[#1F2937] px-2 py-0.5 rounded">{row.target}</span>
                </div>
                <div className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${rc.text} ${rc.bg}`}>
                    {row.resultLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 4: Permissions ───────────────────────────────────────── */}
      <div>
        <SectionLabel>Permissions &amp; autonomy scope</SectionLabel>
        <SectionCard>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-3">Approved categories</p>
              <div className="flex flex-wrap gap-2">
                {u.canApproveCategories.map(cat => (
                  <span key={cat} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColors[cat] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-3">Risk level ceiling</p>
              <p className="text-sm text-slate-300">
                Can approve up to <span className="text-amber-400 font-semibold">High</span> risk.
                <br />
                <span className="text-slate-500">Critical requires a second Global Administrator.</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Approver chain position</p>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-[10px] font-bold text-white">1</span>
                <span className="text-xs text-slate-400">Primary approver</span>
                <span className="text-slate-700 mx-1">→</span>
                <span className="w-6 h-6 rounded-full bg-[#1F2937] flex items-center justify-center text-[10px] font-bold text-slate-500">2</span>
                <span className="text-xs text-slate-600">Secondary (Critical only)</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Governing policy</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-400 font-medium">Policy IT-GOV-04 · Active</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── SECTION 5: Notification preferences ─────────────────────────── */}
      <div>
        <SectionLabel>Notification preferences</SectionLabel>
        <SectionCard>
          <div className="space-y-4">
            {([
              ['highPriority',    'New high-priority recommendation',                'Notified immediately when a Critical or High recommendation is created.'],
              ['slaWarnings',     'SLA / cost-of-inaction warnings',                 'Alerts when a pending recommendation is approaching its review deadline.'],
              ['agentDissent',    'Agent dissent on a recommendation you reviewed',  'Notified if AI agents disagree on a decision you previously approved.'],
              ['weeklySummary',   'Weekly calibration summary',                      'A digest of your decision accuracy and team calibration trends.'],
            ] as [keyof typeof notifs, string, string][]).map(([key, title, desc]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-300 font-medium">{title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                </div>
                <Toggle on={notifs[key]} onChange={v => setNotifs(prev => ({ ...prev, [key]: v }))} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── SECTION 6: Security ─────────────────────────────────────────── */}
      <div>
        <SectionLabel>Security</SectionLabel>
        <div className="space-y-4">

          {/* MFA — amber warning for SMS */}
          {u.mfaMethod === 'sms' && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">Known limitation</p>
                <p className="text-xs text-amber-200/70">
                  Your account currently uses SMS-based MFA. Consider switching to a phishing-resistant method such as a hardware security key or authenticator app.
                </p>
                <button className="mt-2 text-xs text-amber-400/70 hover:text-amber-400 transition-colors">
                  Upgrade MFA method →
                </button>
              </div>
            </div>
          )}

          {/* MFA status card */}
          <SectionCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Multi-factor authentication</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {u.mfaMethod === 'sms' ? 'SMS one-time code (upgrade recommended)' :
                     u.mfaMethod === 'totp' ? 'Authenticator app (TOTP)' : 'Hardware security key'}
                  </p>
                </div>
              </div>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Change method →
              </button>
            </div>
          </SectionCard>

          {/* Active sessions */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Active sessions</h3>
            </div>
            <div className="space-y-3">
              {u.sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DeviceIcon device={session.device} />
                    <div>
                      <p className="text-xs text-slate-300 font-medium">{session.device}</p>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1">
                        {session.current && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
                        {session.lastActive}
                        {session.current && <span className="text-green-400 ml-0.5">· This device</span>}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <button className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-400 transition-colors">
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Password */}
          <SectionCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Password</p>
                  <p className="text-xs text-slate-500 mt-0.5">Last changed 42 days ago</p>
                </div>
              </div>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Change password →
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

    </div>
  );
}
