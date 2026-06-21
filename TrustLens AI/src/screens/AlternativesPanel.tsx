import type { Alternative } from '../mock-data';
import { X, MinusCircle } from 'lucide-react';

interface Props {
  alternatives: Alternative[];
  onClose: () => void;
}

export default function AlternativesPanel({ alternatives, onClose }: Props) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#111827] border-l border-[#1F2937] z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1F2937]">
          <h2 className="text-sm font-semibold text-white">Alternatives considered</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {alternatives.map((alt, i) => (
            <div key={i} className="flex gap-3 bg-[#0D1120] border border-[#1F2937] rounded-xl p-4">
              <MinusCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-200">{alt.action}</p>
                <p className="text-xs text-slate-500 mt-1">{alt.rejectionReason}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-[#1F2937]">
          <button onClick={onClose} className="w-full py-2 text-sm font-medium border border-[#1F2937] text-slate-400 rounded-lg hover:bg-white/5 transition-colors">
            Close
          </button>
        </div>
      </div>
    </>
  );
}
