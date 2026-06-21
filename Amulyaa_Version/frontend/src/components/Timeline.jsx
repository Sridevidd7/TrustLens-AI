export default function Timeline({ items = [] }) {
  return <div className="timeline">{items.map((item, i)=><div className="timelineItem" key={i}><span>{i+1}</span><div><strong>{item.title || item.step}</strong><p>{item.detail || item.description}</p></div></div>)}</div>;
}
