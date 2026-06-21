import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import SeverityBadge from '../components/SeverityBadge'
import ConfidenceBadge from '../components/ConfidenceBadge'
import LoadingState from '../components/LoadingState'
import { api } from '../api'

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getDashboard()
        setDashboard(data)
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [])

  if (!dashboard) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="content">
          <Header title="Dashboard" subtitle="AI Recommendations Awaiting Human Judgment" />
          <LoadingState message={error || 'Connecting to backend…'} />
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Header title="Dashboard" subtitle="AI Recommendations Awaiting Human Judgment" />
        <section className="glass-panel hero-panel">
          <div className="hero-grid">
            <div>
              <span className="hero-badge">Backend live • {dashboard.pending_approval} pending</span>
              <h2>AI Recommendations Awaiting Human Judgment</h2>
              <p>Transparent AI guidance for safer IT decisions, with clear reasoning, confidence, and human review checkpoints.</p>
              <div className="hero-actions">
                <Link className="btn btn-primary" to="/approval-center">Review approvals</Link>
                <Link className="btn btn-secondary" to="/simulator">Open simulator</Link>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#91a8c8' }}>Trust score</span>
                <strong>{dashboard.trust_score}%</strong>
              </div>
              <div className="score-ring" style={{ marginTop: 12 }}>{dashboard.transparency_score}%</div>
            </div>
          </div>
        </section>
        <section className="stats-grid">
          <StatCard label="Total recommendations" value={dashboard.total_recommendations} />
          <StatCard label="Pending approval" value={dashboard.pending_approval} />
          <StatCard label="Critical risks" value={dashboard.critical_risks} />
          <StatCard label="Decisions logged" value={dashboard.decisions_logged} />
        </section>
        <section className="content-grid">
          <div>
            <div className="heat-strip">
              <div className="heat-block" style={{ background: 'linear-gradient(90deg, #22c55e, #5ae0ff)' }} />
              <div className="heat-block" style={{ background: 'linear-gradient(90deg, #f5b942, #ff5b73)' }} />
              <div className="heat-block" style={{ background: 'linear-gradient(90deg, #ff5b73, #9a6bff)' }} />
            </div>
            <div className="recommendation-list">
              {dashboard.recommendations.map((item) => (
                <div className="glass-panel recommendation-card" key={item.id}>
                  <div className="card-top">
                    <div>
                      <h3>{item.title}</h3>
                      <div className="card-meta">
                        <SeverityBadge severity={item.severity} />
                        <ConfidenceBadge confidence={item.confidence_score} />
                      </div>
                    </div>
                    <span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span>
                  </div>
                  <p className="summary">{item.summary}</p>
                  <div className="detail-row">
                    <span>{item.category}</span>
                    <span>{item.affected_count} affected</span>
                  </div>
                  <div className="hero-actions">
                    <Link className="btn btn-primary" to={`/recommendation/${item.id}`}>Open detail</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel-column">
            <div className="glass-panel activity-card">
              <h3 style={{ marginTop: 0 }}>Recent activity</h3>
              {dashboard.activity_preview.map((item, index) => (
                <div className="activity-item" key={index}>
                  <div className="activity-dot" />
                  <div>
                    <strong>{item.title}</strong>
                    <p style={{ margin: '6px 0 0', color: '#91a8c8' }}>{item.detail}</p>
                    <span style={{ color: '#5ae0ff' }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-panel trust-card">
              <h3 style={{ marginTop: 0 }}>Transparency snapshot</h3>
              <p style={{ color: '#91a8c8' }}>The AI explains its rationale, highlights its blind spots, and shows safer alternatives before any high-impact action.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
