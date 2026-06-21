import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, ShieldCheck, Clock, Zap, Network, CheckCircle2, ChevronRight, Users } from 'lucide-react';
import { recommendations } from '../mock-data';
import type { Priority } from '../mock-data';
import StatCard from '../components/StatCard';
import SeverityPill from '../components/SeverityPill';
import CircularProgressRing from '../components/CircularProgressRing';

const filters: (Priority | 'All')[] = ['All', 'Critical', 'High', 'Medium', 'Low'];

const agents = [
  { name: 'Identity Analyst', icon: Users },
  { name: 'Risk Assessor',    icon: AlertCircle },
  { name: 'Policy Validator', icon: ShieldCheck },
  { name: 'Endpoint Scanner', icon: Zap },
];

function AnimatedBar({ value }: { value: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <div
      className="h-full gradient-bg rounded-full"
      style={{ width: `${width}%`, transition: 'width 1s cubic-bezier(0.25, 1, 0.5, 1)' }}
    />
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Priority | 'All'>('All');

  const highConf = recommendations.filter(r => r.confidenceLevel === 'high').length;
  const awaiting = recommendations.filter(r => r.awaitingApproval).length;
  const displayed = activeFilter === 'All' ? recommendations : recommendations.filter(r => r.priority === activeFilter);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1">IT Operations</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recommendation dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">AI-assisted decisions, with evidence you can inspect.</p>
        </div>
        <button
          onClick={() => navigate('/explanation')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
        >
          <Sparkles className="w-4 h-4" />
          Run new analysis
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Open recommendations" value={recommendations.length} caption="3 added today"
          icon={<AlertCircle className="w-4 h-4 text-amber-400" />} iconBg="bg-amber-500/10" />
        <StatCard label="High confidence" value={highConf} caption="≥85% confidence"
          icon={<ShieldCheck className="w-4 h-4 text-green-400" />} iconBg="bg-green-500/10" />
        <StatCard label="Awaiting approval" value={awaiting} caption="Oldest: 8h 34m ago"
          icon={<Clock className="w-4 h-4 text-indigo-400" />} iconBg="bg-indigo-500/10" />
        <StatCard label="Automated actions" value={12} caption="Last 7 days"
          icon={<Zap className="w-4 h-4 text-purple-400" />} iconBg="bg-purple-500/10" />
      </div>

      <div className="flex gap-5">
        {/* Main list */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]">
              <div>
                <h2 className="text-sm font-semibold text-white">Priority recommendations</h2>
                <p className="text-xs text-slate-500 mt-0.5">{displayed.length} shown · ranked by risk, impact and confidence</p>
              </div>
              <div className="flex items-center gap-1">
                {filters.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeFilter === f ? 'gradient-bg text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              {displayed.map((rec, i) => (
                <div
                  key={rec.id}
                  onClick={() => navigate(`/explanation/${rec.id}`)}
                  className={`px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors group ${i < displayed.length - 1 ? 'border-b border-[#1F2937]' : ''}`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    rec.priority === 'Critical' ? 'bg-red-500' :
                    rec.priority === 'High' ? 'bg-amber-500' :
                    rec.priority === 'Medium' ? 'bg-yellow-500' : 'bg-slate-500'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white truncate">{rec.title}</span>
                      <SeverityPill priority={rec.priority} />
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-2">{rec.description}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        {rec.confidencePercent}% confidence
                      </span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-slate-500">{rec.resourceCount} affected</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-indigo-400/80 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">{rec.category}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-slate-600">{rec.timestamp}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">
          {/* Trust readiness */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Trust readiness</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Across active decisions</p>
            <div className="flex justify-center mb-4">
              <CircularProgressRing score={88} />
            </div>
            <div className="space-y-3">
              {[['Explainability', 91], ['Source quality', 86], ['Human oversight', 88]].map(([label, val]) => (
                <div key={String(label)}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-300 font-medium">{val}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                    <AnimatedBar value={Number(val)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active AI agents */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Active AI agents</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">4 collaborating now</p>
            <div className="space-y-2.5">
              {agents.map(({ name, icon: Icon }) => (
                <div key={name} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <span className="text-xs text-slate-300 flex-1">{name}</span>
                  <span className="flex items-center gap-1 text-[10px] text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    active
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View transparency map →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
