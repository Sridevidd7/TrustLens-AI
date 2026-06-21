import { useEffect, useState } from 'react';
import { api } from '../api.js';
import GlassPanel from '../components/GlassPanel.jsx';
const modes=['Always ask me','Suggest only','Auto-approve low-risk only','Act and notify'];
export default function Settings(){
 const [mode,setMode]=useState(modes[0]),[saved,setSaved]=useState('');
 useEffect(()=>{api.autonomy().then(d=>setMode(d.mode||modes[0]))},[]);
 async function save(m){setMode(m);await api.setAutonomy({mode:m});setSaved('Saved. Critical and high-impact actions still require human confirmation.');}
 return <div className="page fadeIn"><div className="pageTitle"><h1>Autonomy Dial</h1><p>Set how much freedom the AI agent has while keeping safety guardrails visible.</p></div><GlassPanel><div className="dialGrid">{modes.map(m=><button key={m} onClick={()=>save(m)} className={mode===m?'dial active':'dial'}><strong>{m}</strong><span>{m==='Always ask me'?'AI pauses for every action':m==='Suggest only'?'AI explains but never acts':m==='Auto-approve low-risk only'?'Low risk can move faster':'AI can act and report back'}</span></button>)}</div><div className="safetyNote">Critical and high-impact actions always require human confirmation.</div>{saved&&<p className="saved">{saved}</p>}</GlassPanel></div>
}
