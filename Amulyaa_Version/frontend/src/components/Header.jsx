import { Bell, Search, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="topbar">
      <div className="searchBox"><Search size={18}/><span>Search recommendation, source, audit action...</span></div>
      <div className="topActions">
        <span className="aiPill"><Sparkles size={16}/> Demo Mode Ready</span>
        <button className="iconBtn" aria-label="Notifications"><Bell size={18}/></button>
      </div>
    </header>
  );
}
