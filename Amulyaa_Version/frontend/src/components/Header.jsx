import { Bell, Search } from 'lucide-react'

export default function Header({ title, subtitle }) {
  return (
    <div className="top-bar">
      <div className="page-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="header-actions">
        <button className="btn btn-secondary"><Search size={16} /></button>
        <button className="btn btn-secondary"><Bell size={16} /></button>
      </div>
    </div>
  )
}
