import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../api.js';
import GlassPanel from '../components/GlassPanel.jsx';
import StatCard from '../components/StatCard.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';
import LoadingState from '../components/LoadingState.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.dashboard(), api.health()])
      .then(([dashboard]) => { setData(dashboard); setHealth(true); })
      .catch(err => setError(err.message));
  }, []);

  if (error) return <GlassPanel><h2>Backend offline</h2><p>{error}</p><p>Start Flask on port 5001, then refresh.</p></GlassPanel>;
  if (!data) return <LoadingState />;
  const recs = data.recommendations || [];
  const activity = data.recent_activity || [];

  return (
    <div className="page fadeIn">
      <section className="hero">
        <div>
          <span className="eyebrow">AI governance command center</span>
          <h1>AI recommendations awaiting human judgment</h1>
          <p>Every action includes reasoning, confidence, evidence, limitations, alternatives, and a clear human approval path.</p>
        </div>
        <div className="heroCard">
          <span className={health ? 'onlineDot' : 'offlineDot'} /> Backend live
          <h2>{data.trust_score}%</h2>
          <p>Transparency score</p>
        </div>
      </section>

      <div className="statsGrid">
        <StatCard label="Total recommendations" value={data.stats.total} hint="AI items generated" icon={<Activity/>}/>
        <StatCard label="Pending approval" value={data.stats.pending} hint="Need admin decision" icon={<ShieldCheck/>}/>
        <StatCard label="Critical risks" value={data.stats.critical} hint="High-impact actions" icon={<AlertTriangle/>}/>
        <StatCard label="Decisions logged" value={data.stats.decisions} hint="Audit-ready records" icon={<CheckCircle2/>}/>
      </div>

      <div className="gridTwo">
        <GlassPanel className="wide">
          <div className="sectionHead"><h2>Priority recommendation cards</h2><p>Open a card to inspect the complete trust view.</p></div>
          <div className="cardGrid">{recs.map(rec => <RecommendationCard rec={rec} key={rec.id}/>)}</div>
        </GlassPanel>
        <GlassPanel>
          <div className="sectionHead"><h2>Risk heat strip</h2><p>Critical actions stay locked until confirmation.</p></div>
          <div className="heatStrip">{recs.map(r => <span key={r.id} className={`heat ${r.severity.toLowerCase()}`} title={r.title}/>)}</div>
          <h3>Recent activity</h3>
          <div className="miniTimeline">{activity.map((a,i)=><div key={i}><strong>{a.action}</strong><span>{a.time}</span><p>{a.detail}</p></div>)}</div>
        </GlassPanel>
      </div>
    </div>
  );
}
