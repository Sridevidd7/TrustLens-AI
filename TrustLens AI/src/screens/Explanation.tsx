import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertTriangle, User, Network, Lock, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { recommendations } from '../mock-data';
import ConfidenceBadge from '../components/ConfidenceBadge';
import AlternativesPanel from './AlternativesPanel';
import ConfirmModal from './ConfirmModal';

// Sub-metric card with animated fill bar beneath the %
function SubMetricBar({ label, value }: { label: string; value: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <div className="bg-[#0D1120] border border-[#1F2937] rounded-lg p-2 text-center">
      <p className="text-sm font-bold text-white">{value}%</p>
      <p className="text-[10px] text-slate-600 mt-0.5 mb-1.5 leading-tight">{label}</p>
      <div className="h-1 bg-[#1F2937] rounded-full overflow-hidden">
        <div
          className="h-full gradient-bg rounded-full"
          style={{ width: `${width}%`, transition: 'width 1s cubic-bezier(0.25, 1, 0.5, 1)' }}
        />
      </div>
    </div>
  );
}

export default function Explanation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rec = recommendations.find(r => r.id === id) ?? recommendations[0];

  const [panel, setPanel] = useState(false);
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null);
  const [agentsExpanded, setAgentsExpanded] = useState(false);

  // Confidence bar animation
  const [confWidth, setConfWidth] = useState(0);
  const confColor =
    rec.confidenceLevel === 'high'   ? 'bg-green-500' :
    rec.confidenceLevel === 'review' ? 'bg-amber-500' : 'bg-red-500';
  useEffect(() => {
    const id = requestAnimationFrame(() => setConfWidth(rec.confidencePercent));
    return () => cancelAnimationFrame(id);
  }, [rec.confidencePercent, rec.id]);


  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-5 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to recommendations
      </button>

      {/* Page header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1">
          {rec.category} · {rec.riskLevel} Risk
        </p>
        <h1 className="text-2xl font-bold text-white tracking-tight">{rec.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{rec.description}</p>
      </div>

      <div className="flex gap-5 items-start">
        {/* Main panel */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Why card */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Why TrustLens recommends this</h2>
              </div>
              <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                Reasoning trace
              </span>
            </div>

            {/* Pipeline strip */}
            <div className="flex items-center mb-6 overflow-x-auto pb-1">
              {rec.pipelineSteps.map((step, i) => (
                <div key={i} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] text-slate-500 text-center max-w-[80px] leading-tight">{step.label}</span>
                  </div>
                  {i < rec.pipelineSteps.length - 1 && (
                    <div className="w-8 h-px bg-[#1F2937] mx-2 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Reasoning steps */}
            <ol className="space-y-4">
              {rec.reasoningSteps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{step.text}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{step.verificationMethod}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Expected impact */}
            <div className="mt-5 pt-4 border-t border-[#1F2937]">
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Expected Impact</p>
              <p className="text-sm text-slate-300">{rec.expectedImpact}</p>
            </div>
          </div>

          {/* Multi-agent transparency */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
            <button
              onClick={() => setAgentsExpanded(v => !v)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Multi-agent transparency</h2>
                <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  {rec.agentsInvolved.length} agents
                </span>
              </div>
              {agentsExpanded
                ? <ChevronUp className="w-4 h-4 text-slate-500" />
                : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
            <p className="text-xs text-slate-500 mt-2">
              {rec.agentsInvolved.join(', ')} independently contributed evidence and reached consensus on this recommendation.
            </p>
            {agentsExpanded && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {rec.agentsInvolved.map(agent => (
                  <div key={agent} className="flex items-center gap-2 bg-[#0D1120] border border-[#1F2937] rounded-lg px-3 py-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="text-xs text-slate-300">{agent}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Confidence card */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-semibold text-white">Confidence</h3>
            </div>
            <ConfidenceBadge level={rec.confidenceLevel} percent={rec.confidencePercent} variant="headline" />

            {/* Animated confidence bar */}
            <div className="mt-3 h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${confColor}`}
                style={{ width: `${confWidth}%`, transition: 'width 1s cubic-bezier(0.25, 1, 0.5, 1)' }}
              />
            </div>

            {/* Sub-metric animated bars */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <SubMetricBar label="Data quality" value={rec.confidenceBreakdown.dataQuality} />
              <SubMetricBar label="Consensus"    value={rec.confidenceBreakdown.consensus} />
              <SubMetricBar label="Policy match" value={rec.confidenceBreakdown.policyMatch} />
            </div>
          </div>

          {/* Known limitation */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Known limitation</h3>
            </div>
            <p className="text-xs text-amber-200/70">{rec.limitations}</p>
            <button className="mt-2 text-xs text-amber-400/70 hover:text-amber-400 transition-colors">
              View all assumptions →
            </button>
          </div>

          {/* Human decision */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Human decision</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">No action will be taken without administrator approval.</p>

            <div className="flex gap-2 mb-3">
              <button onClick={() => setPanel(true)} className="flex-1 px-3 py-2 text-xs font-medium border border-[#1F2937] text-slate-300 rounded-lg hover:bg-white/5 transition-colors">
                Ask Why
              </button>
              <button onClick={() => setPanel(true)} className="flex-1 px-3 py-2 text-xs font-medium border border-[#1F2937] text-slate-300 rounded-lg hover:bg-white/5 transition-colors">
                See Alternatives
              </button>
            </div>

            <button
              onClick={() => setModal('approve')}
              className="w-full py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold mb-2 hover:opacity-90 transition-opacity"
            >
              ✓ Approve recommendation
            </button>
            <button
              onClick={() => setModal('reject')}
              className="w-full py-2.5 rounded-xl border border-[#1F2937] text-slate-300 text-sm font-medium mb-2 hover:bg-white/5 transition-colors"
            >
              ✕ Reject with reason
            </button>
            <button className="w-full py-2.5 rounded-xl border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/5 transition-colors">
              ⚑ Escalate to human review
            </button>

            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#1F2937]">
              <Lock className="w-3 h-3 text-slate-600" />
              <p className="text-[10px] text-slate-600">Decision is signed and added to the audit trail.</p>
            </div>
          </div>
        </div>
      </div>

      {panel && <AlternativesPanel alternatives={rec.alternatives} onClose={() => setPanel(false)} />}
      {modal && (
        <ConfirmModal
          action={modal}
          deviceId={rec.deviceId}
          title={rec.title}
          onClose={() => setModal(null)}
          onConfirm={() => { setModal(null); navigate('/audit'); }}
        />
      )}
    </div>
  );
}
