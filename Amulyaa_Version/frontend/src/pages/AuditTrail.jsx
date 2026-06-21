import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import GlassPanel from '../components/GlassPanel.jsx';
import EmptyState from '../components/EmptyState.jsx';
const filters=['All','AI','Approval','Rejection','Escalation','System','Override'];
export default function AuditTrail(){
 const [logs,setLogs]=useState([]),[q,setQ]=useState(''),[filter,setFilter]=useState('All');
 useEffect(()=>{api.audit().then(d=>setLogs(d.logs||[]))},[]);
 const filtered=useMemo(()=>logs.filter(l=>(filter==='All'||l.type===filter)&&JSON.stringify(l).toLowerCase().includes(q.toLowerCase())),[logs,q,filter]);
 return <div className="page fadeIn"><div className="pageTitle"><h1>Searchable Audit Trail</h1><p>Every AI suggestion and human decision is recorded in plain language.</p></div><GlassPanel><div className="toolbar"><input placeholder="Search audit logs..." value={q} onChange={e=>setQ(e.target.value)}/><div className="filterPills">{filters.map(f=><button key={f} className={filter===f?'activePill':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>{filtered.length===0?<EmptyState/>:<div className="auditTimeline">{filtered.map(log=><div className="auditItem" key={log.id}><span className="auditDot"/><div><strong>{log.action}</strong><p>{log.message}</p><small>{log.timestamp} • {log.actor} • {log.result}</small>{log.reason&&<em>Reason: {log.reason}</em>}</div></div>)}</div>}</GlassPanel></div>
}
