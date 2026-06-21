import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import SeverityBadge from '../components/SeverityBadge'
import LoadingState from '../components/LoadingState'
import Modal from '../components/Modal'
import { api } from '../api'

export default function RecommendationDetail() {
  const { id } = useParams()
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [decisionModal, setDecisionModal] = useState(false)
  const [decisionType, setDecisionType] = useState('approve')
  const [actor, setActor] = useState('Admin User')
  const [reason, setReason] = useState('')
  const [reviewer, setReviewer] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const load = async () => {
    try {
      const data = await api.getRecommendation(id)
      setRecommendation(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const submitDecision = async () => {
    try {
      if (decisionType === 'escalate') {
        await api.postEscalate(id, { reviewer, reason, actor })
      } else {
        await api.postDecision(id, {
          action: decisionType,
          actor,
          reason,
          confirmed: decisionType === 'approve' ? confirmed : false,
        })
      }
      setDecisionModal(false)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="content"><LoadingState /></main>
      </div>
    )
  }

  if (!recommendation) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="content"><Header title="Recommendation" subtitle="Unable to load" />{error && <p>{error}</p>}</main>
      </div>
    )
  }

  const confidenceLabel = recommendation.confidence_label || 'Review recommended'

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Header title="Recommendation Detail" subtitle="Transparent reasoning and decision support" />
        <div className="detail-page">
          <div className="detail-main">
            <section className="glass-panel detail-header">
              <div className="card-top">
                <div>
                  <span className="hero-badge">{recommendation.category}</span>
                  <h2 style={{ margin: '10px 0' }}>{recommendation.title}</h2>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <SeverityBadge severity={recommendation.severity} />
                  <span className="badge confident">{recommendation.confidence_score}%</span>
                </div>
              </div>
              <p style={{ color: '#91a8c8' }}>{recommendation.summary}</p>
              <div className="decision-actions">
                <button className="btn btn-primary" onClick={() => { setDecisionType('approve'); setDecisionModal(true) }}>Approve</button>
                <button className="btn btn-secondary" onClick={() => { setDecisionType('reject'); setDecisionModal(true) }}>Reject</button>
                <button className="btn btn-secondary" onClick={() => { setDecisionType('escalate'); setDecisionModal(true) }}>Escalate</button>
                <button className="btn btn-secondary" onClick={() => { setDecisionType('override'); setDecisionModal(true) }}>Ask Why</button>
                <Link className="btn btn-secondary" to={`/simulator`}>See Alternatives</Link>
                <Link className="btn btn-secondary" to={`/simulator`}>Simulate Decision</Link>
              </div>
            </section>
            <section className="glass-panel" style={{ padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Why the AI suggested this</h3>
              <p style={{ color: '#91a8c8' }}>{recommendation.confidence_reason}</p>
              <h4>Reasoning steps</h4>
              <div className="step-list">{recommendation.reasoning_steps.map((step, i) => <li key={i}>{step}</li>)}</div>
            </section>
            <section className="glass-panel" style={{ padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Evidence</h3>
              <div className="evidence-grid">
                {recommendation.evidence.map((item, i) => <div className="evidence-card" key={i}>{item}</div>)}
              </div>
            </section>
            <section className="glass-panel" style={{ padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Data sources</h3>
              <div className="source-grid">
                {recommendation.data_sources.map((item, i) => <div className="source-card" key={i}>{item}</div>)}
              </div>
            </section>
            <section className="glass-panel" style={{ padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Known limitations</h3>
              <div className="step-list">{recommendation.limitations.map((item, i) => <li key={i}>{item}</li>)}</div>
            </section>
            <section className="glass-panel" style={{ padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Alternatives considered</h3>
              <div className="alts-list">{recommendation.alternatives.map((item, i) => <li key={i}>{item}</li>)}</div>
            </section>
          </div>
          <aside className="detail-side">
            <section className="glass-panel" style={{ padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Confidence</h3>
              <div className="score-ring">{recommendation.confidence_score}%</div>
              <p style={{ color: '#91a8c8' }}>{confidenceLabel}</p>
              <p style={{ color: '#91a8c8' }}>The AI is confident because the evidence aligns and the impact is clear.</p>
            </section>
            <section className="glass-panel" style={{ padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Agent handoff</h3>
              <div className="timeline-item"><strong>Signal collected</strong><p>{recommendation.agent_flow[0]}</p></div>
              <div className="timeline-item"><strong>Risk evaluated</strong><p>{recommendation.agent_flow[1]}</p></div>
              <div className="timeline-item"><strong>Decision checkpoint</strong><p>{recommendation.agent_flow[2]}</p></div>
            </section>
          </aside>
        </div>
      </main>
      <Modal open={decisionModal} title={decisionType === 'escalate' ? 'Escalate recommendation' : 'Confirm decision'} onClose={() => setDecisionModal(false)}>
        {decisionType === 'approve' ? (
          <>
            <label>Actor</label>
            <input value={actor} onChange={(e) => setActor(e.target.value)} />
            <br />
            <label style={{ display: 'block', marginTop: 10 }}>Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              I confirm this high-impact action
            </label>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={submitDecision}>Confirm approval</button>
            </div>
          </>
        ) : decisionType === 'reject' ? (
          <>
            <label>Actor</label>
            <input value={actor} onChange={(e) => setActor(e.target.value)} />
            <label style={{ display: 'block', marginTop: 10 }}>Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" />
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={submitDecision}>Reject recommendation</button>
            </div>
          </>
        ) : (
          <>
            <label>Reviewer</label>
            <input value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
            <label style={{ display: 'block', marginTop: 10 }}>Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" />
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={submitDecision}>Escalate</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
