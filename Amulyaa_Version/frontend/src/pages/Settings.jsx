import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { api } from '../api'

const options = [
  'Always ask me',
  'Suggest only',
  'Auto-approve low-risk only',
  'Act and notify'
]

export default function Settings() {
  const [autonomy, setAutonomy] = useState('Always ask me')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const data = await api.getAutonomy()
      setAutonomy(data.autonomy || 'Always ask me')
    }
    load()
  }, [])

  const save = async () => {
    try {
      await api.setAutonomy(autonomy)
      setMessage('Settings saved successfully.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <Header title="Settings" subtitle="Operational guardrails and AI autonomy" />
        <section className="glass-panel settings-card">
          <h3>Autonomy Dial</h3>
          {options.map((option) => (
            <label key={option} className="setting-option" style={{ display: 'block', marginBottom: 12 }}>
              <input type="radio" name="autonomy" checked={autonomy === option} onChange={() => setAutonomy(option)} />
              <span style={{ marginLeft: 8 }}>{option}</span>
            </label>
          ))}
          <button className="btn btn-primary" onClick={save}>Save setting</button>
          <p style={{ color: '#91a8c8' }}>{message}</p>
          <div className="glass-panel" style={{ marginTop: 16, padding: 14 }}>
            <strong>Safety note:</strong> Critical and high-impact actions always require human confirmation.
          </div>
        </section>
      </main>
    </div>
  )
}
