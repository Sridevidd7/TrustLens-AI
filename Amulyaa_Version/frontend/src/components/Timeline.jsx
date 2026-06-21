export default function Timeline({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="timeline-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <strong>{item.label}</strong>
            <span style={{ color: '#91a8c8' }}>{item.time}</span>
          </div>
          <p style={{ margin: '8px 0 0', color: '#91a8c8' }}>{item.detail}</p>
        </div>
      ))}
    </div>
  )
}
