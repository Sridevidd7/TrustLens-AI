import type { Priority } from '../mock-data';

const cfg: Record<Priority, { text: string; bg: string }> = {
  Critical: { text: 'text-red-400',    bg: 'bg-red-500/10 border border-red-500/20'    },
  High:     { text: 'text-amber-400',  bg: 'bg-amber-500/10 border border-amber-500/20' },
  Medium:   { text: 'text-yellow-400', bg: 'bg-yellow-500/10 border border-yellow-500/20' },
  Low:      { text: 'text-slate-400',  bg: 'bg-slate-500/10 border border-slate-500/20'  },
};

const dots: Record<Priority, string> = {
  Critical: 'bg-red-500',
  High: 'bg-amber-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-slate-500',
};

export default function SeverityPill({ priority }: { priority: Priority }) {
  const c = cfg[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${c.text} ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[priority]}`} />
      {priority}
    </span>
  );
}
