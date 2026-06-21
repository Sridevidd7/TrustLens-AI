import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingState from '../components/LoadingState'
import { api } from '../api'

export default function Simulator() {
  const [recommendations, setRecommendations] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [sim, setSim] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getRecommendations()
        setRecommendations(data)
        if (data.length > 0) {
          setSelectedId(data[0].id)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const loadSim = async () => {
      const data = await api.getSimulate(selectedId)
      setSim(data)
    }
    loadSim()
  }, [selectedId])

  if (loading) return <div className="app-shell"><Sidebar /><main className="content"><LoadingState /></main></div>

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Header title="Decision Simulator" subtitle="See likely outcomes before approving or rejecting" />
        <section className="glass-panel simulator-card">
          <label>Select recommendation</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {recommendations.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          {sim && (
            <div className="content-grid" style={{ marginTop: 18 }}>
              <div className="glass-panel" style={{ padding: 18 }}>
                <h3>If approved</h3>
                <p>{sim.if_approved}</p>
              </div>
              <div className="glass-panel" style={{ padding: 18 }}>
                <h3>If rejected</h3>
                <p>{sim.if_rejected}</p>
              </div>
            </div>
          )}
          {sim && (
            <div className="stats-grid" style={{ marginTop: 16 }}>
              <div className="glass-panel stat-card"><p>Security impact</p><h3>{sim.security_impact}</h3></div>
              <div className="glass-panel stat-card"><p>Business impact</p><h3>{sim.business_impact}</h3></div>
              <div className="glass-panel stat-card"><p>User disruption</p><h3>{sim.disruption_level}</h3></div>
              <div className="glass-panel stat-card"><p>Safer path</p><h3>{sim.recommended_path}</h3></div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
