import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, CheckCircle2, XCircle, ShieldCheck, Clock } from 'lucide-react';
import { recommendations } from '../mock-data';
import ConfirmModal from './ConfirmModal';

const queue = recommendations.filter(r => r.awaitingApproval);

export default function ApprovalCenter() {
  const navigate = useNavigate();
  const [modal, setModal] = useState<{ action: 'approve' | 'reject'; rec: typeof recommendations[0] } | null>(null);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Human Oversight</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Approval center</h1>
          <p className="text-sm text-slate-500 mt-1">Review high-impact AI recommendations before execution.</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
          <Clock className="w-3.5 h-3.5" />
          {queue.length} awaiting review
        </span>
      </div>

      <div className="flex gap-5 items-start">
        {/* Main table */}
        <div className="flex-1 min-w-0 bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_140px_120px] border-b border-[#1F2937]">
            {['Recommendation', 'Confidence', 'Decision'].map(h => (
              <div key={h} className="px-5 py-3 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">{h}</div>
            ))}
          </div>
          {queue.map((rec, i) => (
            <div
              key={rec.id}
              className={`grid grid-cols-[1fr_140px_120px] items-center hover:bg-white/[0.02] transition-colors ${i < queue.length - 1 ? 'border-b border-[#1F2937]' : ''}`}
            >
              <div
                className="px-5 py-4 cursor-pointer"
                onClick={() => navigate(`/explanation/${rec.id}`)}
              >
                <p className="text-sm font-semibold text-white">{rec.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{rec.resourceCount} resource{rec.resourceCount > 1 ? 's' : ''} · {rec.riskLevel} risk</p>
              </div>
              <div className="px-5 py-4">
                <span className="text-sm font-bold text-green-400">{rec.confidencePercent}%</span>
              </div>
              <div className="px-5 py-4 flex items-center gap-2">
                <button
                  onClick={() => setModal({ action: 'approve', rec })}
                  className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                  title="Approve"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </button>
                <button
                  onClick={() => setModal({ action: 'reject', rec })}
                  className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                  title="Reject"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Oversight policy */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Oversight policy</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All Critical and High severity recommendations require explicit administrator approval before execution. Medium recommendations may be auto-approved if confidence ≥ 90%.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-green-400 font-medium">Policy IT-GOV-04 · Active</span>
            </div>
          </div>

          {/* This week */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">This week</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Approved', value: '14', color: 'text-green-400' },
                { label: 'Rejected', value: '3',  color: 'text-red-400'   },
                { label: 'Avg. review time', value: '4m', color: 'text-white' },
                { label: 'Bypassed', value: '0',  color: 'text-white'     },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[#0D1120] border border-[#1F2937] rounded-lg p-3">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <ConfirmModal
          action={modal.action === 'approve' ? 'approve' : 'reject'}
          deviceId={modal.rec.deviceId}
          title={modal.rec.title}
          onClose={() => setModal(null)}
          onConfirm={() => { setModal(null); }}
        />
      )}
    </div>
  );
}
