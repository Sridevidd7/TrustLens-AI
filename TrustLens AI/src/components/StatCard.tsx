import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  caption: string;
  icon: ReactNode;
  iconBg: string;
}

export default function StatCard({ label, value, caption, icon, iconBg }: StatCardProps) {
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">{label}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{caption}</p>
      </div>
    </div>
  );
}
