import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LoadingState from '../components/LoadingState'
import { api } from '../api'

export default function UsabilityReport() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getUsability()
        setRows(data)
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
        <Header title="Usability Report" subtitle="Human-centered design review for the TrustLens AI flow" />
        <section className="glass-panel usability-card">
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#91a8c8' }}>
                  <th align="left">Participant</th>
                  <th align="left">Comprehension</th>
                  <th align="left">Time to decision</th>
                  <th align="left">Confusion points</th>
                  <th align="left">Design improvements</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="usability-row">
                    <td>{row.participant}</td>
                    <td>{row.comprehension_score}%</td>
                    <td>{row.time_to_decision}</td>
                    <td>{row.confusion_points}</td>
                    <td>{row.design_improvements}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
