'use client';
import React, { useState, useEffect } from 'react';

// ── Safe storage (fixes Next.js SSR build crash) ───────────────────────────
const db = {
  get:(k,d)=>{ if(typeof window==='undefined')return d; try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;} },
  set:(k,v)=>{ if(typeof window==='undefined')return; try{localStorage.setItem(k,JSON.stringify(v));}catch{} }
};

// ── Wheel segment definitions ──────────────────────────────────────────────
// weight = internal probability (NOT shown to players, visually all equal size)
const DEFAULT_REG = [
  {id:0,label:'50 Coins',  type:'coins',       val:50,   weight:30,color:'#4ECDC4'},
  {id:1,label:'100 Coins', type:'coins',       val:100,  weight:25,color:'#FFE66D'},
  {id:2,label:'200 Coins', type:'coins',       val:200,  weight:20,color:'#95E1D3'},
  {id:3,label:'500 Coins', type:'coins',       val:500,  weight:12,color:'#FF8B94'},
  {id:4,label:'+2 Tickets',type:'tickets',     val:2,    weight:8, color:'#C7CEEA'},
  {id:5,label:'⭐ ELITE',  type:'elite_ticket',val:1,    weight:5, color:'#FF6B6B'},
];
const DEFAULT_ELITE = [
  {id:0,label:'1K Coins',  type:'coins',  val:1000, weight:35,color:'#4ECDC4'},
  {id:1,label:'2.5K',      type:'coins',  val:2500, weight:25,color:'#FFE66D'},
  {id:2,label:'5K Coins',  type:'coins',  val:5000, weight:15,color:'#95E1D3'},
  {id:3,label:'🎁 Prize',  type:'custom', val:'Boss buys lunch!',weight:13,color:'#C7CEEA'},
  {id:4,label:'10K Coins', type:'coins',  val:10000,weight:8, color:'#FF8B94'},
  {id:5,label:'💎 JACKPOT',type:'jackpot',val:25000,weight:4, color:'#FF6B6B'},
];
const INIT_PLAYERS = [
  {id:1,name:'Player 1',coins:0,tickets:0,eliteTickets:0},
  {id:2,name:'Player 2',coins:0,tickets:0,eliteTickets:0},
];

// ── Weighted random (equal visual size, unequal probability) ──────────────
function pickWeighted(segs){
  const tot=segs.reduce((s,x)=>s+x.weight,0);
  let r=Math.random()*tot;
  for(let i=0;i<segs.length;i++){r-=segs[i].weight;if(r<=0)return i;}
  return segs.length-1;
}

// ── Rotation math: land exactly on picked segment ─────────────────────────
// SVG segments start at 0° (right). Pointer is at top = 270°.
// To land segment i (center at i*(360/n)+half) under pointer:
//   rotate so (segCenter + R) % 360 = 270
function calcRot(curr,idx,n){
  const sa=360/n, sc=idx*sa+sa/2;
  const base=(270-sc+720)%360;
  const mod=((curr%360)+360)%360;
  let delta=base-mod; if(delta<0)delta+=360; if(delta<30)delta+=360;
  return curr+delta+6*360;  // 6 full spins before landing
}

// ── Reusable Wheel SVG ────────────────────────────────────────────────────
function Wheel({segs,rot,spinning,size=300}){
  const N=segs.length,cx=size/2,cy=size/2,r=size*0.4,tr=size*0.265;
  const rad=d=>d*Math.PI/180;
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{filter:'drop-shadow(0 0 18px rgba(78,205,196,.3))',
        transform:`rotate(${rot}deg)`,
        transition:spinning?'transform 3.5s cubic-bezier(0.17,0.67,0.12,0.99)':'none',
        userSelect:'none'}}>
      {segs.map((s,i)=>{
        const a0=(i/N)*360,a1=((i+1)/N)*360;
        const x1=cx+r*Math.cos(rad(a0)),y1=cy+r*Math.sin(rad(a0));
        const x2=cx+r*Math.cos(rad(a1)),y2=cy+r*Math.sin(rad(a1));
        const mx=(a0+a1)/2,tx=cx+tr*Math.cos(rad(mx)),ty=cy+tr*Math.sin(rad(mx));
        return(<g key={i}>
          <path d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}Z`}
            fill={s.color} stroke="#080e18" strokeWidth="2.5"/>
          <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
            style={{fontSize:size<260?9:11,fontWeight:'bold',fill:'#111',pointerEvents:'none'}}
            transform={`rotate(${mx+90} ${tx} ${ty})`}>
            {s.label.length>9?s.label.slice(0,8)+'…':s.label}
          </text>
        </g>);
      })}
      <circle cx={cx} cy={cy} r={size*0.09} fill="#080e18" stroke="#fff" strokeWidth="2.5"/>
      <text x={cx} y={cy+2} textAnchor="middle" dominantBaseline="middle"
        style={{fontSize:size*0.065,pointerEvents:'none'}}>💰</text>
    </svg>
  );
}

// ── Ticket card widget ─────────────────────────────────────────────────────
function TicketCard({count,label,sub,color,glow}){
  return(
    <div style={{padding:'18px 12px',borderRadius:12,textAlign:'center',background:'#080e18',
      border:`2px solid ${color}`,transition:'box-shadow .3s',
      ...(glow&&count>0?{boxShadow:`0 0 28px ${color}66`}:{})}}>
      <div style={{fontSize:28,marginBottom:4}}>{sub}</div>
      <div style={{fontSize:38,fontWeight:800,color,lineHeight:1.1}}>{count}</div>
      <div style={{fontSize:11,color:'#555',marginTop:4,textTransform:'uppercase',letterSpacing:1}}>{label}</div>
    </div>
  );
}

// ── Main app ───────────────────────────────────────────────────────────────
export default function DevWheel(){
  const [ok,setOk]           = useState(false);
  const [tab,setTab]         = useState('tasks');
  const [players,setPlayers] = useState(INIT_PLAYERS);
  const [pid,setPid]         = useState(1);
  const [regSegs,setRegSegs] = useState(DEFAULT_REG);
  const [elSegs,setElSegs]   = useState(DEFAULT_ELITE);
  const [regRot,setRegRot]   = useState(0);
  const [elRot,setElRot]     = useState(0);
  const [regSpin,setRegSpin] = useState(false);
  const [elSpin,setElSpin]   = useState(false);
  const [popup,setPopup]     = useState(null);
  const [task,setTask]       = useState('');
  const [diff,setDiff]       = useState('medium');
  const [hist,setHist]       = useState([]);
  const [editWt,setEditWt]   = useState(false);
  const [editId,setEditId]   = useState(null);
  const [editNm,setEditNm]   = useState('');
  const [trKey,setTrKey]     = useState('');
  const [trTok,setTrTok]     = useState('');
  const [trBrd,setTrBrd]     = useState('');
  const [trCards,setTrCards] = useState([]);
  const [trLoad,setTrLoad]   = useState(false);
  const [trMsg,setTrMsg]     = useState('');
  const [trErr,setTrErr]     = useState(false);

  // Hydrate only on client
  useEffect(()=>{
    const saved=db.get('dw-players',INIT_PLAYERS);
    setPlayers(saved.map(p=>({...INIT_PLAYERS[0],...p})));
    setHist(db.get('dw-hist',[]));
    setRegSegs(db.get('dw-rsegs',DEFAULT_REG));
    setElSegs(db.get('dw-esegs',DEFAULT_ELITE));
    setTrKey(db.get('dw-trk',''));
    setTrTok(db.get('dw-trt',''));
    setTrBrd(db.get('dw-trb',''));
    setOk(true);
  },[]);

  useEffect(()=>{if(ok)db.set('dw-players',players);},[players,ok]);
  useEffect(()=>{if(ok)db.set('dw-hist',hist);},[hist,ok]);
  useEffect(()=>{if(ok){db.set('dw-rsegs',regSegs);db.set('dw-esegs',elSegs);}},[regSegs,elSegs,ok]);
  useEffect(()=>{if(ok){db.set('dw-trk',trKey);db.set('dw-trt',trTok);db.set('dw-trb',trBrd);}},[trKey,trTok,trBrd,ok]);

  const me=players.find(p=>p.id===pid)??players[0];
  const upd=(id,fn)=>setPlayers(prev=>prev.map(p=>p.id===id?fn(p):p));
  const pop=(label,emoji,big=false)=>{setPopup({label,emoji,big});setTimeout(()=>setPopup(null),big?4000:2800);};

  // Complete task → earn ticket(s)
  const doTask=()=>{
    if(!task.trim())return;
    const tix=diff==='epic'?3:diff==='hard'?2:1;
    upd(pid,p=>({...p,tickets:(p.tickets??0)+tix}));
    setHist(prev=>[{id:Date.now(),task,player:me.name,tickets:tix,diff,date:new Date().toLocaleDateString()},...prev].slice(0,150));
    pop(`+${tix} Ticket${tix>1?'s':''}!`,'🎫');
    setTask('');
  };

  // Spin regular wheel (costs 1 ticket)
  const doReg=()=>{
    if(regSpin||elSpin)return;
    const p=players.find(x=>x.id===pid);
    if(!p||(p.tickets??0)<1){alert('No tickets! Complete a task first.');return;}
    const pName=p.name;
    upd(pid,x=>({...x,tickets:x.tickets-1}));
    setRegSpin(true);setPopup(null);
    const idx=pickWeighted(regSegs);
    const seg=regSegs[idx];
    setRegRot(prev=>calcRot(prev,idx,regSegs.length));
    setTimeout(()=>{
      if(seg.type==='coins'){
        upd(pid,x=>({...x,coins:x.coins+seg.val}));
        pop(`+${seg.val.toLocaleString()} Coins`,'💰');
        setHist(prev=>[{id:Date.now(),task:`Wheel → ${seg.label}`,player:pName,coins:seg.val,type:'spin',date:new Date().toLocaleDateString()},...prev].slice(0,150));
      } else if(seg.type==='tickets'){
        upd(pid,x=>({...x,tickets:(x.tickets??0)+seg.val}));
        pop(`+${seg.val} Bonus Tickets!`,'🎫');
      } else if(seg.type==='elite_ticket'){
        upd(pid,x=>({...x,eliteTickets:(x.eliteTickets??0)+1}));
        pop('⭐ ELITE TICKET! Use it on the Elite Wheel!','🌟',true);
      }
      setRegSpin(false);
    },3700);
  };

  // Spin elite wheel (costs 1 elite ticket)
  const doElite=()=>{
    if(regSpin||elSpin)return;
    const p=players.find(x=>x.id===pid);
    if(!p||(p.eliteTickets??0)<1){alert('No Elite Tickets! Win one on the Regular Wheel.');return;}
    const pName=p.name;
    upd(pid,x=>({...x,eliteTickets:x.eliteTickets-1}));
    setElSpin(true);setPopup(null);
    const idx=pickWeighted(elSegs);
    const seg=elSegs[idx];
    setElRot(prev=>calcRot(prev,idx,elSegs.length));
    setTimeout(()=>{
      if(seg.type==='coins'||seg.type==='jackpot'){
        upd(pid,x=>({...x,coins:x.coins+seg.val}));
        const isJP=seg.type==='jackpot';
        pop(isJP?`💎 JACKPOT! +${seg.val.toLocaleString()}`:`+${seg.val.toLocaleString()} Coins`,isJP?'💎':'💰',isJP);
        setHist(prev=>[{id:Date.now(),task:`Elite Wheel → ${seg.label}`,player:pName,coins:seg.val,type:'elite',date:new Date().toLocaleDateString()},...prev].slice(0,150));
      } else if(seg.type==='custom'){
        pop(String(seg.val),'🎁',true);
      }
      setElSpin(false);
    },3700);
  };

  // Trello
  const fetchTrello=async()=>{
    if(!trKey||!trTok||!trBrd){setTrMsg('Fill in all three fields first.');setTrErr(true);return;}
    setTrLoad(true);setTrMsg('');setTrCards([]);setTrErr(false);
    try{
      const res=await fetch(`https://api.trello.com/1/boards/${trBrd}/lists?key=${trKey}&token=${trTok}`);
      if(!res.ok)throw new Error('Bad credentials or Board ID — check them and try again');
      const lists=await res.json();
      const done=lists.find(l=>l.name.toLowerCase().includes('done'));
      if(!done)throw new Error('No list named "Done" found on this board');
      const cards=await (await fetch(`https://api.trello.com/1/lists/${done.id}/cards?key=${trKey}&token=${trTok}`)).json();
      setTrCards(cards);
      if(!cards.length){setTrMsg('Done list is empty — move cards there first!');setTrErr(true);}
      else{setTrMsg(`${cards.length} card${cards.length!==1?'s':''} found! Tap each to claim tickets.`);setTrErr(false);}
    }catch(e){setTrMsg(e.message);setTrErr(true);}
    setTrLoad(false);
  };
  const claimCard=(card)=>{
    const d=card.labels?.some(l=>l.name.toLowerCase().includes('epic'))?'epic':card.labels?.some(l=>l.name.toLowerCase().includes('hard'))?'hard':'medium';
    const tix=d==='epic'?3:d==='hard'?2:1;
    upd(pid,p=>({...p,tickets:(p.tickets??0)+tix}));
    setTrCards(prev=>prev.filter(c=>c.id!==card.id));
    pop(`+${tix} Ticket${tix>1?'s':''} claimed!`,'🎫');
  };

  const saveName=(id)=>{
    if(editNm.trim())setPlayers(prev=>prev.map(p=>p.id===id?{...p,name:editNm.trim()}:p));
    setEditId(null);setEditNm('');
  };

  const totR=regSegs.reduce((s,x)=>s+x.weight,0);
  const totE=elSegs.reduce((s,x)=>s+x.weight,0);

  if(!ok)return(
    <div style={{minHeight:'100vh',background:'#050810',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <span style={{color:'#4ECDC4',fontSize:22}}>🎡 Loading…</span>
    </div>
  );

  const TABS=[['tasks','🎫 Tasks'],['spin','🎡 Wheel'],['elite','⭐ Elite'],['board','🏆 Board'],['settings','⚙️']];

  return(
    <div style={S.wrap}>
      <style>{`
        *{box-sizing:border-box} body{margin:0}
        input::placeholder{color:#333}
        input:focus,select:focus{outline:none;border-color:#4ECDC4!important}
        .ht:hover{opacity:.8} .bh:hover:not(:disabled){opacity:.88;transform:translateY(-1px)}
        .rh:hover{background:rgba(255,255,255,.07)!important;cursor:pointer}
        @keyframes pop{0%{opacity:0;transform:translateX(-50%) scale(.75)}65%{transform:translateX(-50%) scale(1.06)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
        @keyframes fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 12px rgba(255,215,0,.2)}50%{box-shadow:0 0 32px rgba(255,215,0,.65)}}
        @keyframes shimmer{0%{opacity:.7}50%{opacity:1}100%{opacity:.7}}
      `}</style>

      {/* Floating reward popup */}
      {popup&&(
        <div style={{...S.popup,...(popup.big?{background:'linear-gradient(135deg,#1a0a00,#2a1500)',border:'2px solid #FFE66D',padding:'24px 40px'}:{})}}>
          <div style={{fontSize:popup.big?52:40,marginBottom:6}}>{popup.emoji}</div>
          <div style={{fontSize:popup.big?22:18,fontWeight:800,color:'#FFE66D'}}>{popup.label}</div>
        </div>
      )}

      {/* Header */}
      <div style={{textAlign:'center'}}>
        <h1 style={S.title}>🎡 DevWheel</h1>
        <p style={{color:'#444',fontSize:13,margin:0}}>Project Reward System</p>
      </div>

      {/* Player selector */}
      <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
        {players.map(p=>(
          <button key={p.id} className="ht" onClick={()=>setPid(p.id)}
            style={{...S.pill,...(pid===p.id?S.pillOn:{})}}>
            {p.name}&nbsp;·&nbsp;🎫{p.tickets??0}&nbsp;·&nbsp;⭐{p.eliteTickets??0}
          </button>
        ))}
        <button className="ht" onClick={()=>{
          const nid=Math.max(...players.map(p=>p.id))+1;
          setPlayers(prev=>[...prev,{id:nid,name:`Player ${nid}`,coins:0,tickets:0,eliteTickets:0}]);
        }} style={{...S.pill,borderStyle:'dashed',color:'#333'}}>+ Add</button>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap'}}>
        {TABS.map(([id,lbl])=>(
          <button key={id} className="ht" onClick={()=>setTab(id)}
            style={{...S.tab,...(tab===id?S.tabOn:{})}}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ══ TASKS TAB ══════════════════════════════════════════════════════ */}
      {tab==='tasks'&&(
        <div style={{display:'flex',flexDirection:'column',gap:14,animation:'fd .25s ease'}}>
          <h2 style={S.h2}>🎫 Complete Tasks → Earn Tickets</h2>

          {/* Ticket inventory */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <TicketCard count={me.tickets??0} label="Regular Tickets" sub="🎫" color="#4ECDC4"/>
            <TicketCard count={me.eliteTickets??0} label="Elite Tickets" sub="⭐" color="#FFE66D" glow/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div style={{fontSize:11,color:'#333',textAlign:'center'}}>→ Spend on 🎡 Wheel tab</div>
            <div style={{fontSize:11,color:'#333',textAlign:'center'}}>→ Spend on ⭐ Elite tab</div>
          </div>

          {/* Task input */}
          <input type="text" placeholder="What did you complete? (e.g. Fixed auth bug)"
            value={task} onChange={e=>setTask(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&doTask()} style={S.input}/>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            {[['easy','🟢','×1 ticket'],['medium','🟡','×1 ticket'],['hard','🔴','×2 tickets'],['epic','💜','×3 tickets']].map(([d,em,tip])=>(
              <button key={d} onClick={()=>setDiff(d)}
                style={{...S.diffBtn,...(diff===d?S.diffOn:{})}}>
                <span style={{display:'block',fontSize:16}}>{em}</span>
                <span style={{display:'block',fontWeight:700,fontSize:12,marginTop:2}}>{d[0].toUpperCase()+d.slice(1)}</span>
                <span style={{display:'block',fontSize:10,opacity:.5,marginTop:1}}>{tip}</span>
              </button>
            ))}
          </div>

          <button onClick={doTask} className="bh"
            style={{...S.btn,background:'linear-gradient(135deg,#4ECDC4,#44A08D)',color:'#111'}}>
            ✅ Complete Task → Earn Ticket
          </button>

          {/* Task history */}
          {hist.length>0&&(
            <>
              <div style={{fontSize:11,color:'#333',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginTop:4}}>History</div>
              {hist.slice(0,20).map(h=>(
                <div key={h.id} className="rh" style={S.row}>
                  <span style={{...S.badge,
                    ...(h.type==='spin'?{borderColor:'#FFE66D',color:'#FFE66D',background:'rgba(255,230,109,.08)'}:
                       h.type==='elite'?{borderColor:'#FF8B94',color:'#FF8B94',background:'rgba(255,139,148,.08)'}:{})}}>
                    {h.type==='spin'?'SPIN':h.type==='elite'?'ELITE':(h.diff??'MED').slice(0,3).toUpperCase()}
                  </span>
                  <span style={{flex:1,fontSize:13,color:'#bbb'}}>{h.task}</span>
                  <span style={{fontSize:11,color:'#444'}}>{h.player}</span>
                  {h.tickets&&<span style={{color:'#4ECDC4',fontWeight:700,fontSize:13,whiteSpace:'nowrap'}}>🎫×{h.tickets}</span>}
                  {h.coins&&<span style={{color:'#FFE66D',fontWeight:700,fontSize:13,whiteSpace:'nowrap'}}>+{h.coins.toLocaleString()}</span>}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ══ REGULAR WHEEL ══════════════════════════════════════════════════ */}
      {tab==='spin'&&(
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,animation:'fd .25s ease'}}>
          <h2 style={S.h2}>🎡 Regular Wheel</h2>
          <p style={{color:'#555',fontSize:13,margin:0,textAlign:'center'}}>
            {me.name} · <span style={{color:'#4ECDC4',fontWeight:800,fontSize:17}}>{me.tickets??0}</span> ticket{(me.tickets??0)!==1?'s':''} remaining
          </p>
          <div style={{position:'relative'}}>
            <Wheel segs={regSegs} rot={regRot} spinning={regSpin} size={300}/>
            <div style={S.ptr}>▼</div>
          </div>
          {/* Legend */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,width:'100%',maxWidth:300}}>
            {regSegs.map((s,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#777'}}>
                <div style={{width:9,height:9,borderRadius:2,background:s.color,flexShrink:0}}/>
                {s.label}
              </div>
            ))}
          </div>
          <button onClick={doReg} disabled={regSpin} className="bh"
            style={{...S.btn,maxWidth:300,
              background:regSpin?'#111':'linear-gradient(135deg,#FFE66D,#FF8B94)',
              color:regSpin?'#444':'#111',border:regSpin?'1px solid #222':'none',
              cursor:regSpin?'not-allowed':'pointer'}}>
            {regSpin?'🌀 Spinning…':'🎫 Use 1 Ticket → SPIN'}
          </button>
          <p style={{color:'#333',fontSize:11,margin:0,textAlign:'center'}}>
            Win coins, bonus tickets, or a rare ⭐ Elite Ticket!
          </p>
        </div>
      )}

      {/* ══ ELITE WHEEL ════════════════════════════════════════════════════ */}
      {tab==='elite'&&(
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,animation:'fd .25s ease'}}>
          <h2 style={{...S.h2,background:'linear-gradient(45deg,#FFE66D,#FF8B94)',backgroundClip:'text',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            ⭐ Elite Wheel
          </h2>
          <div style={{textAlign:'center'}}>
            <p style={{color:'#555',fontSize:13,margin:'0 0 4px'}}>
              Requires 1 Elite Ticket — won (rarely) on the Regular Wheel
            </p>
            <p style={{color:'#FFE66D',fontSize:14,margin:0,fontWeight:600}}>
              You have <span style={{fontSize:20}}>{me.eliteTickets??0}</span> Elite Ticket{(me.eliteTickets??0)!==1?'s':''}
            </p>
          </div>
          <div style={{position:'relative'}}>
            <Wheel segs={elSegs} rot={elRot} spinning={elSpin} size={300}/>
            <div style={{...S.ptr,color:'#FFE66D'}}>▼</div>
          </div>
          {/* Legend */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,width:'100%',maxWidth:300}}>
            {elSegs.map((s,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#777'}}>
                <div style={{width:9,height:9,borderRadius:2,background:s.color,flexShrink:0}}/>
                {s.label}
              </div>
            ))}
          </div>
          <button onClick={doElite} disabled={elSpin||(me.eliteTickets??0)<1} className="bh"
            style={{...S.btn,maxWidth:320,
              background:(elSpin||(me.eliteTickets??0)<1)?'#111':'linear-gradient(135deg,#FFE66D,#FF6B6B)',
              color:(elSpin||(me.eliteTickets??0)<1)?'#444':'#111',
              border:(elSpin||(me.eliteTickets??0)<1)?'1px solid #222':'none',
              cursor:(elSpin||(me.eliteTickets??0)<1)?'not-allowed':'pointer'}}>
            {elSpin?'🌀 Spinning…':(me.eliteTickets??0)<1?'⭐ No Elite Tickets — win one on Regular Wheel':'⭐ Use 1 Elite Ticket → SPIN'}
          </button>
          {(me.eliteTickets??0)<1&&(
            <button onClick={()=>setTab('spin')} style={S.ghost}>
              → Go spin the Regular Wheel
            </button>
          )}
        </div>
      )}

      {/* ══ LEADERBOARD ════════════════════════════════════════════════════ */}
      {tab==='board'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10,animation:'fd .25s ease'}}>
          <h2 style={S.h2}>🏆 Leaderboard</h2>
          {[...players].sort((a,b)=>b.coins-a.coins).map((p,i)=>(
            <div key={p.id} className="rh" style={{...S.row,padding:'14px 16px',background:'rgba(78,205,196,.05)',
              borderLeft:`4px solid ${i===0?'#FFE66D':'#4ECDC4'}`,borderRadius:8}}>
              <span style={{fontSize:22,minWidth:36}}>{['🥇','🥈','🥉'][i]??`#${i+1}`}</span>
              <div style={{flex:1}}>
                {editId===p.id
                  ?<input autoFocus value={editNm} onChange={e=>setEditNm(e.target.value)}
                      onBlur={()=>saveName(p.id)} onKeyDown={e=>e.key==='Enter'&&saveName(p.id)}
                      style={{...S.input,width:140,padding:'4px 8px',fontSize:13}}/>
                  :<div style={{fontSize:15,fontWeight:600,cursor:'pointer'}} onClick={()=>{setEditId(p.id);setEditNm(p.name);}}>
                    {p.name} <span style={{fontSize:10,color:'#333'}}>tap to rename</span>
                  </div>
                }
                <div style={{fontSize:11,color:'#333',marginTop:3}}>🎫{p.tickets??0} · ⭐{p.eliteTickets??0}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:20,fontWeight:800,color:'#FFE66D'}}>{p.coins.toLocaleString()}</div>
                <div style={{fontSize:10,color:'#444'}}>coins</div>
              </div>
            </div>
          ))}
          <button onClick={()=>window.confirm('Reset ALL coins and tickets for everyone?')&&
            setPlayers(prev=>prev.map(p=>({...p,coins:0,tickets:0,eliteTickets:0})))}
            style={{...S.ghost,borderColor:'#FF6B6B',color:'#FF6B6B',marginTop:8}}>
            🔄 Reset Everything
          </button>
        </div>
      )}

      {/* ══ SETTINGS ═══════════════════════════════════════════════════════ */}
      {tab==='settings'&&(
        <div style={{display:'flex',flexDirection:'column',gap:20,animation:'fd .25s ease'}}>
          <h2 style={S.h2}>⚙️ Settings</h2>

          {/* Odds editor */}
          <div style={{background:'rgba(255,255,255,.02)',borderRadius:10,padding:'16px',border:'1px solid #1a2535'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:700,color:'#4ECDC4',textTransform:'uppercase',letterSpacing:1}}>
                🎰 Hidden Wheel Odds
              </div>
              <button className="ht" onClick={()=>setEditWt(!editWt)}
                style={{...S.ghost,width:'auto',padding:'5px 12px',fontSize:11}}>
                {editWt?'✓ Save':'Edit Weights'}
              </button>
            </div>
            <p style={{color:'#444',fontSize:12,margin:'0 0 14px',lineHeight:1.6}}>
              All wheel segments <strong style={{color:'#888'}}>look visually equal</strong> to players. Only you see and control the real odds here. Higher weight = more likely to land.
            </p>

            <div style={{fontSize:11,color:'#444',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Regular Wheel (sum={totR})</div>
            {regSegs.map((s,i)=>(
              <div key={s.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:10,height:10,borderRadius:2,background:s.color,flexShrink:0}}/>
                <span style={{flex:1,fontSize:13,color:'#aaa'}}>{s.label}</span>
                {editWt
                  ?<input type="number" min="1" max="999" value={s.weight}
                      onChange={e=>setRegSegs(prev=>prev.map((x,j)=>j===i?{...x,weight:Math.max(1,Number(e.target.value)||1)}:x))}
                      style={{...S.input,width:64,padding:'4px 8px',textAlign:'center'}}/>
                  :<span style={{color:'#FFE66D',fontWeight:700,fontSize:13,minWidth:50,textAlign:'right'}}>
                    {((s.weight/totR)*100).toFixed(1)}%
                  </span>
                }
              </div>
            ))}

            <div style={{fontSize:11,color:'#444',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginTop:14,marginBottom:8}}>Elite Wheel (sum={totE})</div>
            {elSegs.map((s,i)=>(
              <div key={s.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:10,height:10,borderRadius:2,background:s.color,flexShrink:0}}/>
                <span style={{flex:1,fontSize:13,color:'#aaa'}}>{s.label}</span>
                {editWt
                  ?<input type="number" min="1" max="999" value={s.weight}
                      onChange={e=>setElSegs(prev=>prev.map((x,j)=>j===i?{...x,weight:Math.max(1,Number(e.target.value)||1)}:x))}
                      style={{...S.input,width:64,padding:'4px 8px',textAlign:'center'}}/>
                  :<span style={{color:'#FFE66D',fontWeight:700,fontSize:13,minWidth:50,textAlign:'right'}}>
                    {((s.weight/totE)*100).toFixed(1)}%
                  </span>
                }
              </div>
            ))}
            <button onClick={()=>{setRegSegs(DEFAULT_REG);setElSegs(DEFAULT_ELITE);}}
              style={{...S.ghost,marginTop:8,fontSize:11,borderColor:'#333',color:'#444'}}>
              Reset to defaults
            </button>
          </div>

          {/* Trello */}
          <div style={{background:'rgba(255,255,255,.02)',borderRadius:10,padding:'16px',border:'1px solid #1a2535'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#4ECDC4',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>
              🟦 Trello → Auto-Claim Tickets
            </div>
            <p style={{color:'#444',fontSize:12,margin:'0 0 14px',lineHeight:1.6}}>
              Connect your Trello board. Click Done cards to instantly earn tickets — no code on your friend's machine.<br/>
              <a href="https://trello.com/power-ups/admin" target="_blank" rel="noreferrer" style={{color:'#4ECDC4'}}>
                Get free API Key → trello.com/power-ups/admin
              </a>
            </p>
            {[['API Key',trKey,setTrKey,'text','abc123…'],
              ['Token',trTok,setTrTok,'password','your-token'],
              ['Board ID',trBrd,setTrBrd,'text','from: open board URL → add .json → copy top-level "id"']
            ].map(([lbl,val,set,type,ph])=>(
              <div key={lbl} style={{marginBottom:10}}>
                <div style={{fontSize:11,color:'#4ECDC4',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>{lbl}</div>
                <input type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)} style={S.input}/>
              </div>
            ))}
            <button onClick={fetchTrello} disabled={trLoad} className="bh"
              style={{...S.btn,background:trLoad?'#111':'linear-gradient(135deg,#0052CC,#0747A6)',color:trLoad?'#444':'#fff',border:trLoad?'1px solid #222':'none'}}>
              {trLoad?'⏳ Fetching…':'🟦 Fetch Done Cards'}
            </button>
            {trMsg&&(
              <div style={{marginTop:10,fontSize:12,color:trErr?'#FF6B6B':'#4ECDC4'}}>
                {trErr?'⚠️ ':'✅ '}{trMsg}
              </div>
            )}
            {trCards.length>0&&(
              <div style={{marginTop:14,display:'flex',flexDirection:'column',gap:8}}>
                {trCards.map(card=>(
                  <div key={card.id} className="rh" style={S.row} onClick={()=>claimCard(card)}>
                    <span style={{flex:1,fontSize:13}}>{card.name}</span>
                    <span style={{color:'#4ECDC4',fontSize:12,fontWeight:600,whiteSpace:'nowrap'}}>Claim 🎫 →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const S={
  wrap:{minHeight:'100vh',background:'linear-gradient(160deg,#050810 0%,#0a0f1a 50%,#0d1420 100%)',color:'#fff',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',padding:'28px 18px 60px',display:'flex',flexDirection:'column',gap:16,maxWidth:640,margin:'0 auto'},
  title:{fontSize:36,margin:'0 0 3px',fontWeight:800,background:'linear-gradient(45deg,#4ECDC4,#FFE66D)',backgroundClip:'text',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'},
  h2:{fontSize:20,margin:'0 0 16px',fontWeight:700,color:'#eee'},
  pill:{padding:'7px 12px',background:'rgba(255,255,255,.03)',border:'1.5px solid #1a2535',borderRadius:20,color:'#555',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .2s'},
  pillOn:{background:'rgba(78,205,196,.08)',borderColor:'#4ECDC4',color:'#4ECDC4'},
  tab:{padding:'7px 14px',background:'rgba(255,255,255,.03)',border:'1.5px solid transparent',borderRadius:22,color:'#555',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .2s'},
  tabOn:{background:'rgba(78,205,196,.08)',borderColor:'#4ECDC4',color:'#4ECDC4'},
  input:{padding:'10px 12px',background:'#080d17',border:'2px solid #1a2535',borderRadius:8,color:'#fff',fontSize:14,fontFamily:'inherit',transition:'border-color .2s',width:'100%'},
  diffBtn:{padding:'10px 6px',background:'#080d17',border:'2px solid #1a2535',borderRadius:8,color:'#666',cursor:'pointer',transition:'all .2s',textAlign:'center'},
  diffOn:{background:'rgba(78,205,196,.07)',borderColor:'#4ECDC4',color:'#4ECDC4'},
  btn:{padding:'13px 20px',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',transition:'all .2s',width:'100%'},
  ghost:{padding:'10px 14px',background:'transparent',border:'1.5px dashed #4ECDC4',borderRadius:8,color:'#4ECDC4',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .2s',width:'100%'},
  ptr:{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',fontSize:28,color:'#4ECDC4',userSelect:'none'},
  popup:{position:'fixed',top:65,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#0a0f1a,#0d1420)',border:'2px solid #FFE66D',borderRadius:16,padding:'18px 32px',textAlign:'center',zIndex:9999,minWidth:220,boxShadow:'0 12px 50px rgba(255,215,0,.2)',animation:'pop .4s ease'},
  row:{display:'flex',gap:10,alignItems:'center',padding:'10px 12px',background:'rgba(255,255,255,.03)',borderRadius:8,borderLeft:'3px solid #4ECDC4',transition:'background .15s'},
  badge:{padding:'2px 6px',background:'rgba(78,205,196,.08)',border:'1px solid #4ECDC4',borderRadius:4,fontSize:9,fontWeight:700,color:'#4ECDC4',whiteSpace:'nowrap'},
};
