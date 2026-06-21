import { Link } from 'react-router-dom';
import { ArrowUpRight, Database, Users } from 'lucide-react';
import ConfidenceBadge from './ConfidenceBadge.jsx';
import SeverityBadge from './SeverityBadge.jsx';

export default function RecommendationCard({ rec }) {
  return (
    <article className="recCard">
      <div className="recTop">
        <SeverityBadge severity={rec.severity} />
        <ConfidenceBadge label={rec.confidence_label} score={rec.confidence_score} />
      </div>
      <h3>{rec.title}</h3>
      <p>{rec.summary}</p>
      <div className="recMeta">
        <span><Users size={15}/> {rec.affected_count} affected</span>
        <span><Database size={15}/> {rec.category}</span>
      </div>
      <Link className="primaryLink" to={`/recommendations/${rec.id}`}>Open trust view <ArrowUpRight size={16}/></Link>
    </article>
  );
}
