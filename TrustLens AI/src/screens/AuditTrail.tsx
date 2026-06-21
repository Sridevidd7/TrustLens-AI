import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Download, Search, User, Bot, CheckCircle2, ShieldCheck } from 'lucide-react';
import { auditLog } from '../mock-data';
import StatCard from '../components/StatCard';

const resultCfg = {
  success:  { text: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  pending:  { text: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  rejected: { text: 'text-red-400',    bg: 'bg-red-500/10   border-red-500/20'   },
};

export default function AuditTrail() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = auditLog.filter(row => {
    const s = row.activity.toLowerCase().includes(search.toLowerCase()) ||
              row.target.toLowerCase().includes(search.toLowerCase()) ||
              row.actor.toLowerCase().includes(search.toLowerCase());
    const f = filter === 'all' || row.result === filter;
    return s && f;
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Governance</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit trail</h1>
          <p className="text-sm text-slate-500 mt-1">A tamper-evident record of every AI and human decision.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1F2937] text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors">
          <Download className="w-4 h-4" />
          Export report
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Events today" value={6} caption="Across all systems"
          icon={<BookOpen className="w-4 h-4 text-indigo-400" />} iconBg="bg-indigo-500/10" />
        <StatCard label="Successful actions" value="78%" caption="No policy violations"
          icon={<CheckCircle2 className="w-4 h-4 text-green-400" />} iconBg="bg-green-500/10" />
        <StatCard label="Integrity status" value="Valid" caption="Last verified 4m ago"
          icon={<ShieldCheck className="w-4 h-4 text-green-400" />} iconBg="bg-green-500/10" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full bg-[#111827] border border-[#1F2937] rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
        >
          <option value="all">All results</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[160px_1fr_2fr_120px_140px] border-b border-[#1F2937]">
          {['Time', 'Actor', 'Activity', 'Target', 'Result'].map(h => (
            <div key={h} className="px-4 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">{h}</div>
          ))}
        </div>
        {filtered.map((row, i) => {
          const rc = resultCfg[row.result];
          return (
            <div
              key={row.id}
              onClick={() => navigate(`/explanation/${row.recId}`)}
              className={`grid grid-cols-[160px_1fr_2fr_120px_140px] items-center cursor-pointer hover:bg-white/[0.03] transition-colors ${i < filtered.length - 1 ? 'border-b border-[#1F2937]' : ''}`}
            >
              <div className="px-4 py-3 text-xs text-slate-500">{row.time}</div>
              <div className="px-4 py-3 flex items-center gap-2">
                {row.actorType === 'human'
                  ? <User className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  : <Bot className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                <span className="text-xs text-slate-300 font-medium">{row.actor}</span>
              </div>
              <div className="px-4 py-3 text-xs text-slate-400">{row.activity}</div>
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
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-slate-600 text-sm">No events match your search.</div>
        )}
      </div>
    </div>
  );
}
