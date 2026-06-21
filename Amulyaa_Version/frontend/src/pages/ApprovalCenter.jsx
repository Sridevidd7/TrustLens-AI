import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Modal from '../components/Modal'
import SeverityBadge from '../components/SeverityBadge'
import ConfidenceBadge from '../components/ConfidenceBadge'
import LoadingState from '../components/LoadingState'
import { api } from '../api'

export default function ApprovalCenter() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [actionType, setActionType] = useState('approve')
  const [actor, setActor] = useState('Security Admin')
  const [reason, setReason] = useState('')
  const [reviewer, setReviewer] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const load = async () => {
    try {
      const data = await api.getRecommendations()
      setItems(data.filter((item) => item.status === 'Pending'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openModal = (item, type) => {
    setSelected(item)
    setActionType(type)
    setReason('')
    setActor('Security Admin')
    setReviewer('')
    setConfirmed(false)
    setModalOpen(true)
  }

  const submit = async () => {
    if (!selected) return
    try {
      if (actionType === 'escalate') {
        await api.postEscalate(selected.id, { reviewer, reason, actor })
      } else {
        await api.postDecision(selected.id, {
          action: actionType,
          actor,
          reason,
          confirmed: actionType === 'approve' ? confirmed : false,
        })
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="app-shell"><Sidebar /><main className="content"><LoadingState /></main></div>

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Header title="Approval Center" subtitle="Human confirmation for high-impact actions" />
        {error && <p style={{ color: '#ff95a9' }}>{error}</p>}
        <div className="recommendation-list">
          {items.map((item) => (
            <div className="glass-panel recommendation-card" key={item.id}>
              <div className="card-top">
                <div>
                  <h3>{item.title}</h3>
                  <div className="card-meta">
                    <SeverityBadge severity={item.severity} />
                    <ConfidenceBadge confidence={item.confidence_score} />
                  </div>
                </div>
                <span className="badge pending">Pending</span>
              </div>
              <p className="summary">{item.summary}</p>
              <div className="detail-row">
                <span>{item.category}</span>
                <span>{item.affected_count} affected</span>
              </div>
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={() => openModal(item, 'approve')}>Approve</button>
                <button className="btn btn-secondary" onClick={() => openModal(item, 'reject')}>Reject</button>
                <button className="btn btn-secondary" onClick={() => openModal(item, 'escalate')}>Escalate</button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Modal open={modalOpen} title={actionType === 'escalate' ? 'Escalate recommendation' : 'Confirm action'} onClose={() => setModalOpen(false)}>
        {actionType === 'approve' ? (
          <>
            <label>Actor</label>
            <input value={actor} onChange={(e) => setActor(e.target.value)} />
            <label style={{ display: 'block', marginTop: 10 }}>Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              Confirm this action
            </label>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={submit}>Approve</button>
            </div>
          </>
        ) : actionType === 'reject' ? (
          <>
            <label>Actor</label>
            <input value={actor} onChange={(e) => setActor(e.target.value)} />
            <label style={{ display: 'block', marginTop: 10 }}>Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" />
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={submit}>Reject</button>
            </div>
          </>
        ) : (
          <>
            <label>Reviewer</label>
            <input value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
            <label style={{ display: 'block', marginTop: 10 }}>Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" />
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={submit}>Escalate</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
