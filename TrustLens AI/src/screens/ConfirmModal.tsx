interface Props {
  action: 'approve' | 'reject' | 'override';
  deviceId: string;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

const copy = {
  approve: { verb: 'approve', consequence: 'execute the AI-recommended action immediately on the device.' },
  reject:  { verb: 'reject',  consequence: 'dismiss the recommendation and log your reason in the audit trail.' },
  override:{ verb: 'override',consequence: 'dismiss the AI recommendation and log your manual decision.' },
};

export default function ConfirmModal({ action, deviceId, title, onClose, onConfirm }: Props) {
  const c = copy[action] ?? copy.override;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-white mb-3">Confirm action</h2>
        <p className="text-sm text-slate-400 mb-6">
          You're about to{' '}
          <span className="font-semibold text-white">{c.verb}</span>{' '}
          <span className="font-semibold text-indigo-400">{deviceId}</span>.
          {' '}This will{' '}
          <span className="text-slate-300">{c.consequence}</span>
          <br /><br />
          <span className="text-slate-600 text-xs">{title}</span>
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-[#1F2937] text-slate-400 rounded-lg hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg gradient-bg hover:opacity-90 transition-opacity"
          >
            Confirm {c.verb.charAt(0).toUpperCase() + c.verb.slice(1)}
          </button>
        </div>
      </div>
    </div>
  );
}
