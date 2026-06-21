import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import { api } from '../api'

const filters = ['All', 'AI', 'Approval', 'Rejection', 'Escalation', 'System']

export default function AuditTrail() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAudit()
        setLogs(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const text = `${log.actor} ${log.action} ${log.target} ${log.reason || ''} ${log.result}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesFilter = filter === 'All' || log.action === filter || (filter === 'AI' && log.action === 'approve') || (filter === 'Approval' && log.action === 'approve') || (filter === 'Rejection' && log.action === 'reject') || (filter === 'Escalation' && log.action === 'Escalation') || (filter === 'System' && log.action === 'override')
      return matchesQuery && matchesFilter
    })
  }, [logs, query, filter])

  if (loading) return <div className="app-shell"><Sidebar /><main className="content"><LoadingState /></main></div>

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Header title="Audit Trail" subtitle="Decision history and review records" />
        <div className="glass-panel" style={{ padding: 16 }}>
          <input className="search-input" placeholder="Search audit trail" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="filter-row" style={{ marginTop: 10 }}>
            {filters.map((item) => (
              <button key={item} className={`filter-pill ${item === filter ? 'active' : ''}`} onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="recommendation-list" style={{ marginTop: 16 }}>
          {filteredLogs.length === 0 ? (
            <EmptyState title="No audit records" message="No matching activity yet." />
          ) : (
            filteredLogs.map((log) => (
              <div className="glass-panel audit-item" key={log.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <strong>{log.action}</strong>
                  <span style={{ color: '#91a8c8' }}>{log.timestamp}</span>
                </div>
                <p style={{ margin: '8px 0' }}><strong>Actor:</strong> {log.actor} • <strong>Target:</strong> {log.target}</p>
                <p style={{ margin: 0, color: '#91a8c8' }}>{log.reason || 'No reason provided'}</p>
                <p style={{ margin: '8px 0 0' }}><strong>Result:</strong> {log.result}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
