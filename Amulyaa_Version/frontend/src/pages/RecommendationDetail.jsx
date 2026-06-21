import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Check, HelpCircle, Route, Send, X } from 'lucide-react';
import { api } from '../api.js';
import GlassPanel from '../components/GlassPanel.jsx';
import ConfidenceBadge from '../components/ConfidenceBadge.jsx';
import SeverityBadge from '../components/SeverityBadge.jsx';
import Timeline from '../components/Timeline.jsx';
import Modal from '../components/Modal.jsx';
import LoadingState from '../components/LoadingState.jsx';

export default function RecommendationDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [rec,setRec]=useState(null); const [modal,setModal]=useState(null); const [reason,setReason]=useState(''); const [reviewer,setReviewer]=useState(''); const [error,setError]=useState('');
  const load=()=>api.recommendation(id).then(setRec).catch(e=>setError(e.message));
  useEffect(load,[id]);
  async function decide(action){
    try{
      await api.decide(id,{ action, reason, actor:'Amulyaa Admin', confirmed: action==='approve' });
      setModal(null); setReason(''); load();
    }catch(e){ alert(e.message); }
  }
  async function escalate(){
    try{ await api.escalate(id,{ reviewer, reason, actor:'Amulyaa Admin' }); setModal(null); navigate('/audit'); }catch(e){ alert(e.message); }
  }
  if(error) return <GlassPanel><h2>Error</h2><p>{error}</p></GlassPanel>;
  if(!rec) return <LoadingState/>;
  return <div className="page fadeIn">
    <div className="detailHero">
      <div><Link className="mutedLink" to="/">← Back to dashboard</Link><h1>{rec.title}</h1><p>{rec.summary}</p><div className="badges"><SeverityBadge severity={rec.severity}/><ConfidenceBadge label={rec.confidence_label} score={rec.confidence_score}/><span className="status">{rec.status}</span></div></div>
      <GlassPanel className="decisionPanel"><h3>Human decision required</h3><p>{rec.confidence_reason}</p><button className="approve" onClick={()=>setModal('approve')}><Check/> Approve</button><button className="reject" onClick={()=>setModal('reject')}><X/> Reject</button><button className="secondary" onClick={()=>setModal('escalate')}><Send/> Escalate</button></GlassPanel>
    </div>
    <div className="gridThree">
      <GlassPanel><h2>Why AI suggested this</h2><Timeline items={(rec.reasoning_steps||[]).map(x=>({title:x.step,detail:x.detail}))}/></GlassPanel>
      <GlassPanel><h2>Evidence used</h2><div className="chipList">{(rec.evidence||[]).map((x,i)=><span key={i}>{x}</span>)}</div><h2>Data sources</h2><div className="sourceList">{(rec.data_sources||[]).map((x,i)=><p key={i}>▸ {x}</p>)}</div></GlassPanel>
      <GlassPanel><h2>Known limitations</h2><ul className="prettyList">{(rec.limitations||[]).map((x,i)=><li key={i}>{x}</li>)}</ul><h2>Alternatives considered</h2><ul className="prettyList">{(rec.alternatives||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></GlassPanel>
    </div>
    <div className="gridTwo">
      <GlassPanel><h2><Route/> Agent handoff timeline</h2><Timeline items={rec.agent_flow||[]}/></GlassPanel>
      <GlassPanel><h2><HelpCircle/> Decision impact</h2><div className="impact approveBox"><strong>If approved</strong><p>{rec.approve_impact}</p></div><div className="impact rejectBox"><strong>If rejected</strong><p>{rec.reject_impact}</p></div><Link to="/simulator" className="primaryLink">Open simulator</Link></GlassPanel>
    </div>
    <Modal open={modal==='approve'} title="Confirm high-impact approval" onClose={()=>setModal(null)}><p>This action will be written to the audit trail. Critical and high-impact actions require confirmation.</p><button className="approve full" onClick={()=>decide('approve')}>Confirm approval</button></Modal>
    <Modal open={modal==='reject'} title="Reject with reason" onClose={()=>setModal(null)}><textarea placeholder="Why are you rejecting this recommendation?" value={reason} onChange={e=>setReason(e.target.value)}/><button className="reject full" onClick={()=>decide('reject')}>Reject recommendation</button></Modal>
    <Modal open={modal==='escalate'} title="Escalate to human review" onClose={()=>setModal(null)}><input placeholder="Reviewer name" value={reviewer} onChange={e=>setReviewer(e.target.value)}/><textarea placeholder="Why should this be escalated?" value={reason} onChange={e=>setReason(e.target.value)}/><button className="secondary full" onClick={escalate}>Send escalation</button></Modal>
  </div>
}
