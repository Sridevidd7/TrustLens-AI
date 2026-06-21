import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingState from '../components/LoadingState'
import { api } from '../api'

export default function IncidentReport() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getIncidents()
        setIncidents(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="app-shell"><Sidebar /><main className="content"><LoadingState /></main></div>

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Header title="Incident Report" subtitle="AI incident review and prevention notes" />
        <div className="recommendation-list">
          {incidents.map((incident) => (
            <section className="glass-panel incident-card" key={incident.id}>
              <h3>{incident.title}</h3>
              <div className="incident-block"><strong>What happened</strong><p>{incident.happened}</p></div>
              <div className="incident-block"><strong>Why it happened</strong><p>{incident.why}</p></div>
              <div className="incident-block"><strong>Safeguard worked or failed</strong><p>{incident.safeguard}</p></div>
              <div className="incident-block"><strong>Human decision taken</strong><p>{incident.human_decision}</p></div>
              <div className="incident-block"><strong>Prevention for next time</strong><p>{incident.prevention}</p></div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
