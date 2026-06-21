import { Search, Bell, BriefcaseBusiness } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-14 border-b border-[#1F2937] bg-[#0A0E1A]/80 backdrop-blur sticky top-0 z-30 flex items-center px-6 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        <input
          type="text"
          placeholder="Search recommendations, devices..."
          className="w-full bg-[#111827] border border-[#1F2937] rounded-lg pl-9 pr-16 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 bg-[#1F2937] border border-[#374151] rounded px-1.5 py-0.5 font-mono">⏎</kbd>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Live data pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-xs text-green-400 font-medium">Live data</span>
        </div>
        <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
          <BriefcaseBusiness className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
