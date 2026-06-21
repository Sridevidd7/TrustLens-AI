import { useEffect, useState } from 'react';
import { api } from '../api.js';
import GlassPanel from '../components/GlassPanel.jsx';
export default function Simulator(){
 const [items,setItems]=useState([]),[id,setId]=useState(''),[sim,setSim]=useState(null);
 useEffect(()=>{api.recommendations().then(d=>{const r=d.recommendations||[];setItems(r); if(r[0]){setId(r[0].id);api.simulate(r[0].id).then(setSim)}})},[]);
 function change(v){setId(v);api.simulate(v).then(setSim)}
 return <div className="page fadeIn"><div className="pageTitle"><h1>Decision Simulator</h1><p>Preview business and security outcomes before touching production systems.</p></div><GlassPanel><select value={id} onChange={e=>change(e.target.value)}>{items.map(i=><option key={i.id} value={i.id}>{i.title}</option>)}</select></GlassPanel>{sim&&<div className="gridTwo"><GlassPanel><h2>If approved</h2><p>{sim.approve_impact}</p><div className="meter"><span style={{width:'86%'}}/></div><strong>Security impact: {sim.security_impact}</strong></GlassPanel><GlassPanel><h2>If rejected</h2><p>{sim.reject_impact}</p><div className="meter danger"><span style={{width:'62%'}}/></div><strong>Business impact: {sim.business_impact}</strong><p>Recommended safer path: {sim.recommended_path}</p></GlassPanel></div>}</div>
}
