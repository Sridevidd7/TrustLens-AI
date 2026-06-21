import type { ConfidenceLevel } from '../mock-data';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  percent: number;
  variant?: 'pill' | 'headline';
}

const cfg = {
  high:   { label: 'High Confidence',               dot: 'bg-green-500',  text: 'text-green-400',  bg: 'bg-green-500/10 border border-green-500/20' },
  review: { label: 'Review Recommended',            dot: 'bg-amber-500',  text: 'text-amber-400',  bg: 'bg-amber-500/10 border border-amber-500/20' },
  low:    { label: 'Low Confidence – Needs Review', dot: 'bg-red-500',    text: 'text-red-400',    bg: 'bg-red-500/10 border border-red-500/20'     },
};

export default function ConfidenceBadge({ level, percent, variant = 'pill' }: ConfidenceBadgeProps) {
  const c = cfg[level];
  if (variant === 'headline') {
    return (
      <div className="flex items-center gap-3">
        <span className={`text-4xl font-bold ${c.text}`}>{percent}%</span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.text} ${c.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          {c.label}
        </span>
      </div>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.text} ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
      <span className="opacity-60 ml-0.5">{percent}%</span>
    </span>
  );
}
