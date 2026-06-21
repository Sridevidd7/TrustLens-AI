import { useEffect, useState } from 'react';
import { api } from '../api.js';
import GlassPanel from '../components/GlassPanel.jsx';
import SeverityBadge from '../components/SeverityBadge.jsx';
import ConfidenceBadge from '../components/ConfidenceBadge.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function ApprovalCenter(){
 const [items,setItems]=useState([]),[selected,setSelected]=useState(null),[mode,setMode]=useState(''),[reason,setReason]=useState(''),[reviewer,setReviewer]=useState('');
 const load=()=>api.recommendations().then(d=>setItems((d.recommendations||[]).filter(x=>x.status==='Pending')));
 useEffect(load,[]);
 async function submit(){
  try{ if(mode==='escalate') await api.escalate(selected.id,{reviewer,reason,actor:'Amulyaa Admin'}); else await api.decide(selected.id,{action:mode,reason,actor:'Amulyaa Admin',confirmed:mode==='approve'}); setSelected(null); setReason(''); setReviewer(''); load(); }catch(e){alert(e.message)}
 }
 return <div className="page fadeIn"><div className="pageTitle"><h1>Approval Center</h1><p>Consequential actions stay paused until a human approves, rejects, or escalates.</p></div>
 <div className="approvalList">{items.length===0 && <EmptyState title="No pending approvals" text="All recommendations have been decided or escalated."/>}{items.map(rec=><GlassPanel key={rec.id} className="approvalItem"><div><div className="badges"><SeverityBadge severity={rec.severity}/><ConfidenceBadge label={rec.confidence_label} score={rec.confidence_score}/></div><h2>{rec.title}</h2><p>{rec.summary}</p></div><div className="buttonRow"><button className="approve" onClick={()=>{setSelected(rec);setMode('approve')}}>Approve</button><button className="reject" onClick={()=>{setSelected(rec);setMode('reject')}}>Reject</button><button className="secondary" onClick={()=>{setSelected(rec);setMode('escalate')}}>Escalate</button></div></GlassPanel>)}</div>
 <Modal open={!!selected} title={`${mode} ${selected?.title||''}`} onClose={()=>setSelected(null)}>{mode==='approve' && <p>This approval will be logged with your name and timestamp.</p>}{mode!=='approve' && <textarea placeholder="Reason required" value={reason} onChange={e=>setReason(e.target.value)}/>} {mode==='escalate' && <input placeholder="Reviewer name" value={reviewer} onChange={e=>setReviewer(e.target.value)}/>}<button className="primary full" onClick={submit}>Submit decision</button></Modal>
 </div>
}
