'use client';
import React, { useState, useEffect } from 'react';

// ── Storage (safe for SSR) ────────────────────────────────────
const db = {
  get:(k,d)=>{ if(typeof window==='undefined')return d; try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;} },
  set:(k,v)=>{ if(typeof window==='undefined')return; try{localStorage.setItem(k,JSON.stringify(v));}catch{} }
};

const INIT_PLAYERS = [
  {id:1,name:'Player 1',coins:0,tickets:0,eliteTickets:0},
  {id:2,name:'Player 2',coins:0,tickets:0,eliteTickets:0},
];

const INIT_CARDS = [
  {id:'c1',title:'Setup auth',desc:'',list:'todo',diff:'easy',image:''},
  {id:'c2',title:'Build dashboard',desc:'',list:'todo',diff:'medium',image:''},
];

const INIT_REG_SEGS = [
  {id:0,label:'50 Coins',type:'coins',val:50,weight:30,color:'#4ECDC4',image:''},
  {id:1,label:'100 Coins',type:'coins',val:100,weight:25,color:'#FFE66D',image:''},
  {id:2,label:'200 Coins',type:'coins',val:200,weight:20,color:'#95E1D3',image:''},
  {id:3,label:'500 Coins',type:'coins',val:500,weight:12,color:'#FF8B94',image:''},
  {id:4,label:'+2 Tickets',type:'tickets',val:2,weight:8,color:'#C7CEEA',image:''},
  {id:5,label:'⭐ ELITE',type:'elite_ticket',val:1,weight:5,color:'#FF6B6B',image:''},
];

const INIT_ELITE_SEGS = [
  {id:0,label:'1K Coins',type:'coins',val:1000,weight:35,color:'#4ECDC4',image:''},
  {id:1,label:'2.5K',type:'coins',val:2500,weight:25,color:'#FFE66D',image:''},
  {id:2,label:'5K Coins',type:'coins',val:5000,weight:15,color:'#95E1D3',image:''},
  {id:3,label:'🎁 Prize',type:'custom',val:'Boss buys lunch!',weight:13,color:'#C7CEEA',image:''},
  {id:4,label:'10K Coins',type:'coins',val:10000,weight:8,color:'#FF8B94',image:''},
  {id:5,label:'💎 JACKPOT',type:'jackpot',val:25000,weight:4,color:'#FF6B6B',image:''},
];

function pickWeighted(segs){
  const tot=segs.reduce((s,x)=>s+x.weight,0);
  let r=Math.random()*tot;
  for(let i=0;i<segs.length;i++){r-=segs[i].weight;if(r<=0)return i;}
  return segs.length-1;
}

function calcRot(curr,idx,n){
  const sa=360/n, sc=idx*sa+sa/2;
  const base=(270-sc+720)%360;
  const mod=((curr%360)+360)%360;
  let delta=base-mod; if(delta<0)delta+=360; if(delta<30)delta+=360;
  return curr+delta+6*360;
}

function Wheel({segs,rot,spinning,size=280}){
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
          {s.image?(<text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
            style={{fontSize:size*0.08,pointerEvents:'none'}}
            transform={`rotate(${mx+90} ${tx} ${ty})`}>{s.image}</text>):(
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
              style={{fontSize:size<260?8:10,fontWeight:'bold',fill:'#111',pointerEvents:'none'}}
              transform={`rotate(${mx+90} ${tx} ${ty})`}>
              {s.label.length>8?s.label.slice(0,7)+'…':s.label}
            </text>
          )}
        </g>);
      })}
      <circle cx={cx} cy={cy} r={size*0.09} fill="#080e18" stroke="#fff" strokeWidth="2.5"/>
      <text x={cx} y={cy+2} textAnchor="middle" dominantBaseline="middle"
        style={{fontSize:size*0.065,pointerEvents:'none'}}>💰</text>
    </svg>
  );
}

export default function DevWheel(){
  const [ok,setOk] = useState(false);
  const [isAdmin,setIsAdmin] = useState(false);
  const [adminPass,setAdminPass] = useState('');
  const [passInput,setPassInput] = useState('');
  const [players,setPlayers] = useState(INIT_PLAYERS);
  const [pid,setPid] = useState(1);
  const [cards,setCards] = useState(INIT_CARDS);
  const [regSegs,setRegSegs] = useState(INIT_REG_SEGS);
  const [elSegs,setElSegs] = useState(INIT_ELITE_SEGS);
  const [regRot,setRegRot] = useState(0);
  const [elRot,setElRot] = useState(0);
  const [regSpin,setRegSpin] = useState(false);
  const [elSpin,setElSpin] = useState(false);
  const [popup,setPopup] = useState(null);
  const [dragCard,setDragCard] = useState(null);
  const [editCard,setEditCard] = useState(null);
  const [editWt,setEditWt] = useState(false);

  useEffect(()=>{
    setPlayers(db.get('dw-players',INIT_PLAYERS));
    setCards(db.get('dw-cards',INIT_CARDS));
    setRegSegs(db.get('dw-rsegs',INIT_REG_SEGS));
    setElSegs(db.get('dw-esegs',INIT_ELITE_SEGS));
    setAdminPass(db.get('dw-pass','admin'));
    setOk(true);
  },[]);

  useEffect(()=>{if(ok){db.set('dw-players',players);db.set('dw-cards',cards);
    db.set('dw-rsegs',regSegs);db.set('dw-esegs',elSegs);db.set('dw-pass',adminPass);}},[players,cards,regSegs,elSegs,adminPass,ok]);

  const me=players.find(p=>p.id===pid)??players[0];
  const upd=(id,fn)=>setPlayers(prev=>prev.map(p=>p.id===id?fn(p):p));
  const pop=(label,emoji,big=false)=>{setPopup({label,emoji,big});setTimeout(()=>setPopup(null),big?4000:2800);};

  const moveCard=(cardId,newList)=>{
    const card=cards.find(c=>c.id===cardId);
    if(!card)return;
    if(newList==='done'){
      const tix=card.diff==='epic'?3:card.diff==='hard'?2:1;
      upd(pid,p=>({...p,tickets:(p.tickets??0)+tix}));
      pop(`+${tix} Ticket${tix>1?'s':''} claimed!`,'🎫');
    }
    setCards(prev=>prev.map(c=>c.id===cardId?{...c,list:newList}:c));
  };

  const doReg=()=>{
    if(regSpin||elSpin)return;
    const p=players.find(x=>x.id===pid);
    if(!p||(p.tickets??0)<1){alert('No tickets! Complete a task first.');return;}
    upd(pid,x=>({...x,tickets:x.tickets-1}));
    setRegSpin(true);setPopup(null);
    const idx=pickWeighted(regSegs);
    const seg=regSegs[idx];
    setRegRot(prev=>calcRot(prev,idx,regSegs.length));
    setTimeout(()=>{
      if(seg.type==='coins'){
        upd(pid,x=>({...x,coins:x.coins+seg.val}));
        pop(`+${seg.val.toLocaleString()} Coins`,'💰');
      } else if(seg.type==='tickets'){
        upd(pid,x=>({...x,tickets:(x.tickets??0)+seg.val}));
        pop(`+${seg.val} Bonus Tickets!`,'🎫');
      } else if(seg.type==='elite_ticket'){
        upd(pid,x=>({...x,eliteTickets:(x.eliteTickets??0)+1}));
        pop('⭐ ELITE TICKET!','🌟',true);
      }
      setRegSpin(false);
    },3700);
  };

  const doElite=()=>{
    if(regSpin||elSpin)return;
    const p=players.find(x=>x.id===pid);
    if(!p||(p.eliteTickets??0)<1){alert('No Elite Tickets! Win one on the Regular Wheel.');return;}
    upd(pid,x=>({...x,eliteTickets:x.eliteTickets-1}));
    setElSpin(true);setPopup(null);
    const idx=pickWeighted(elSegs);
    const seg=elSegs[idx];
    setElRot(prev=>calcRot(prev,idx,elSegs.length));
    setTimeout(()=>{
      if(seg.type==='coins'||seg.type==='jackpot'){
        upd(pid,x=>({...x,coins:x.coins+seg.val}));
        pop(seg.type==='jackpot'?`💎 JACKPOT! +${seg.val.toLocaleString()}`:`+${seg.val.toLocaleString()} Coins`,seg.type==='jackpot'?'💎':'💰',seg.type==='jackpot');
      } else if(seg.type==='custom'){
        pop(String(seg.val),'🎁',true);
      }
      setElSpin(false);
    },3700);
  };

  const totR=regSegs.reduce((s,x)=>s+x.weight,0);
  const totE=elSegs.reduce((s,x)=>s+x.weight,0);

  if(!ok)return<div style={{minHeight:'100vh',background:'#050810',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{color:'#4ECDC4',fontSize:22}}>🎡 Loading…</span></div>;

  // ─── PUBLIC VIEW ──────────────────────────────────────────────
  if(!isAdmin){
    return(
      <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#050810,#0a0f1a)',color:'#fff',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',padding:'20px',display:'flex',flexDirection:'column',gap:16,maxWidth:600,margin:'0 auto'}}>
        <style>{`*{box-sizing:border-box}@keyframes pop{0%{opacity:0;transform:scale(.75)}100%{opacity:1;transform:scale(1)}}@keyframes glow{0%,100%{box-shadow:0 0 12px rgba(255,215,0,.2)}50%{box-shadow:0 0 32px rgba(255,215,0,.65)}}`}</style>
        
        {popup&&(<div style={{position:'fixed',top:50,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#1a0a00,#2a1500)',border:'2px solid #FFE66D',borderRadius:16,padding:'20px 40px',textAlign:'center',zIndex:9999,minWidth:200,boxShadow:'0 12px 50px rgba(255,215,0,.2)',animation:'pop .4s ease'}}><div style={{fontSize:popup.big?52:40,marginBottom:6}}>{popup.emoji}</div><div style={{fontSize:popup.big?22:18,fontWeight:800,color:'#FFE66D'}}>{popup.label}</div></div>)}

        <div style={{textAlign:'center',marginBottom:10}}>
          <h1 style={{fontSize:36,margin:'0 0 3px',fontWeight:800,background:'linear-gradient(45deg,#4ECDC4,#FFE66D)',backgroundClip:'text',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>🎡 DevWheel</h1>
          <p style={{fontSize:13,color:'#888',margin:0}}>Complete tasks • Earn tickets • Spin & win</p>
        </div>

        {/* Player selector */}
        <select value={pid} onChange={e=>setPid(Number(e.target.value))} style={{padding:'10px 12px',background:'#0f3460',border:'2px solid #4ECDC4',borderRadius:8,color:'#fff',fontSize:14,cursor:'pointer'}}>
          {players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {/* Ticket display */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div style={{padding:'16px',background:'linear-gradient(135deg,#4ECDC4,#44A08D)',borderRadius:12,textAlign:'center',boxShadow:'0 6px 20px rgba(78,205,196,.2)'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.8)',marginBottom:5,fontWeight:600}}>Regular Tickets</div>
            <div style={{fontSize:42,fontWeight:800,color:'#fff',lineHeight:1}}>🎫 {me.tickets??0}</div>
          </div>
          <div style={{padding:'16px',background:'linear-gradient(135deg,#FFE66D,#FF8B94)',borderRadius:12,textAlign:'center',boxShadow:'0 6px 20px rgba(255,230,109,.2)'}}>
            <div style={{fontSize:11,color:'rgba(0,0,0,.7)',marginBottom:5,fontWeight:600}}>Elite Tickets</div>
            <div style={{fontSize:42,fontWeight:800,color:'#222',lineHeight:1}}>⭐ {me.eliteTickets??0}</div>
          </div>
        </div>

        {/* Coins display */}
        <div style={{padding:'16px',background:'rgba(255,230,109,.08)',border:'2px solid #FFE66D',borderRadius:12,textAlign:'center'}}>
          <div style={{fontSize:11,color:'#FFE66D',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Total Coins</div>
          <div style={{fontSize:48,fontWeight:800,color:'#FFE66D'}}>{me.coins.toLocaleString()}</div>
        </div>

        {/* Wheels */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {/* Regular wheel */}
          <div style={{padding:'16px',background:'rgba(255,255,255,.02)',borderRadius:12,border:'1px solid #1a2535',textAlign:'center',display:'flex',flexDirection:'column',gap:12}}>
            <div style={{fontSize:13,fontWeight:700,color:'#4ECDC4'}}>🎡 Regular</div>
            <div style={{position:'relative',width:200,height:200,margin:'0 auto'}}>
              <Wheel segs={regSegs} rot={regRot} spinning={regSpin} size={200}/>
              <div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',fontSize:24,color:'#4ECDC4'}}>▼</div>
            </div>
            <button onClick={doReg} disabled={regSpin||(me.tickets??0)<1}
              style={{padding:'10px 16px',background:regSpin||(me.tickets??0)<1?'#111':'linear-gradient(135deg,#FFE66D,#FF8B94)',border:'none',borderRadius:8,color:regSpin||(me.tickets??0)<1?'#444':'#111',fontSize:13,fontWeight:700,cursor:regSpin||(me.tickets??0)<1?'not-allowed':'pointer'}}>
              {regSpin?'Spinning…':(me.tickets??0)<1?'Need tickets':'Spin (1 🎫)'}
            </button>
          </div>

          {/* Elite wheel */}
          <div style={{padding:'16px',background:'rgba(255,255,255,.02)',borderRadius:12,border:'1px solid #1a2535',textAlign:'center',display:'flex',flexDirection:'column',gap:12}}>
            <div style={{fontSize:13,fontWeight:700,color:'#FFE66D'}}>⭐ Elite</div>
            <div style={{position:'relative',width:200,height:200,margin:'0 auto'}}>
              <Wheel segs={elSegs} rot={elRot} spinning={elSpin} size={200}/>
              <div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',fontSize:24,color:'#FFE66D'}}>▼</div>
            </div>
            <button onClick={doElite} disabled={elSpin||(me.eliteTickets??0)<1}
              style={{padding:'10px 16px',background:elSpin||(me.eliteTickets??0)<1?'#111':'linear-gradient(135deg,#FFE66D,#FF6B6B)',border:'none',borderRadius:8,color:elSpin||(me.eliteTickets??0)<1?'#444':'#111',fontSize:13,fontWeight:700,cursor:elSpin||(me.eliteTickets??0)<1?'not-allowed':'pointer'}}>
              {elSpin?'Spinning…':(me.eliteTickets??0)<1?'Need tickets':'Spin (1 ⭐)'}
            </button>
          </div>
        </div>

        {/* Admin login */}
        <div style={{marginTop:10,padding:'12px',background:'rgba(255,255,255,.02)',borderRadius:8,border:'1px dashed #333',display:'flex',gap:8}}>
          <input type="password" placeholder="Admin password" value={passInput} onChange={e=>setPassInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&passInput===adminPass&&(setIsAdmin(true),setPassInput(''))}
            style={{flex:1,padding:'8px 12px',background:'#080d17',border:'1px solid #333',borderRadius:4,color:'#fff',fontSize:12}}/>
          <button onClick={()=>{if(passInput===adminPass){setIsAdmin(true);setPassInput('');}}}
            style={{padding:'8px 12px',background:'#4ECDC4',border:'none',borderRadius:4,color:'#111',fontSize:12,fontWeight:700,cursor:'pointer'}}>
            🔓 Admin
          </button>
        </div>
      </div>
    );
  }

  // ─── ADMIN VIEW ───────────────────────────────────────────────
  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#050810,#0a0f1a)',color:'#fff',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',padding:'20px'}}>
      <style>{`*{box-sizing:border-box}.kb-list{background:rgba(255,255,255,.03);border:1px solid #1a2535;borderRadius:8;padding:12px;minHeight:400px;display:flex;flexDirection:column;gap:8}.kb-card{background:#0f3460;border:2px solid #4ECDC4;borderRadius:8;padding:12px;cursor:grab;transition:all .2s}.kb-card:hover{background:#1a4a7a}.kb-card.dragging{opacity:.5}.kb-card-header{fontSize:13;fontWeight:700;color:#fff;marginBottom:6}.kb-card-meta{fontSize:11;color:#888;display:flex;gap:8;margin-top:6}`}</style>

      <div style={{maxWidth:1400,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h1 style={{fontSize:28,margin:0,color:'#4ECDC4'}}>⚙️ Admin Panel</h1>
          <button onClick={()=>{setIsAdmin(false);setPassInput('');}}>
            style={{padding:'8px 16px',background:'#FF6B6B',border:'none',borderRadius:8,color:'#fff',fontWeight:700,cursor:'pointer'}}>
            🚪 Logout
          </button>
        </div>

        {/* Kanban board */}
        <div style={{marginBottom:30}}>
          <h2 style={{fontSize:18,margin:'0 0 16px',color:'#FFE66D'}}>📋 Kanban Board</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
            {['todo','inprogress','review','done'].map(listId=>(
              <div key={listId} className="kb-list"
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{e.preventDefault();moveCard(dragCard,listId);}}>
                <div style={{fontSize:12,fontWeight:700,color:'#4ECDC4',marginBottom:8,textTransform:'uppercase'}}>
                  {listId==='todo'?'📝 To Do':listId==='inprogress'?'🔄 In Progress':listId==='review'?'👀 Review':'✅ Done'}
                </div>
                {cards.filter(c=>c.list===listId).map(card=>(
                  <div key={card.id} className="kb-card" draggable
                    onDragStart={()=>setDragCard(card.id)}
                    onDragEnd={()=>setDragCard(null)}>
                    <div className="kb-card-header">{card.title}</div>
                    {card.image&&<div style={{fontSize:20,marginBottom:6}}>{card.image}</div>}
                    <div className="kb-card-meta">
                      <span style={{background:'rgba(78,205,196,.1)',padding:'2px 6px',borderRadius:4,fontSize:10,color:'#4ECDC4'}}>
                        {card.diff.toUpperCase()}
                      </span>
                      {listId==='done'&&<span style={{color:'#FFE66D',fontSize:10,fontWeight:700}}>+{card.diff==='epic'?3:card.diff==='hard'?2:1} 🎫</span>}
                    </div>
                  </div>
                ))}
                <button onClick={()=>setEditCard({list:listId,title:'',desc:'',diff:'easy',image:''})}
                  style={{marginTop:'auto',padding:'8px',background:'rgba(78,205,196,.1)',border:'1px dashed #4ECDC4',borderRadius:8,color:'#4ECDC4',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  + Add Card
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add/edit card modal */}
        {editCard&&(
          <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
            <div style={{background:'#0a0f1a',border:'2px solid #4ECDC4',borderRadius:12,padding:20,maxWidth:400,width:'100%'}}>
              <h3 style={{margin:'0 0 16px',color:'#4ECDC4'}}>Add Card</h3>
              <input placeholder="Card title" value={editCard.title} onChange={e=>setEditCard({...editCard,title:e.target.value})}
                style={{width:'100%',padding:'10px',background:'#0f3460',border:'1px solid #333',borderRadius:8,color:'#fff',marginBottom:12,fontSize:14}}/>
              <input placeholder="Emoji/image (e.g. 🚀)" value={editCard.image} onChange={e=>setEditCard({...editCard,image:e.target.value})}
                style={{width:'100%',padding:'10px',background:'#0f3460',border:'1px solid #333',borderRadius:8,color:'#fff',marginBottom:12,fontSize:14}}/>
              <select value={editCard.diff} onChange={e=>setEditCard({...editCard,diff:e.target.value})}
                style={{width:'100%',padding:'10px',background:'#0f3460',border:'1px solid #333',borderRadius:8,color:'#fff',marginBottom:12,fontSize:14}}>
                <option>easy</option><option>medium</option><option>hard</option><option>epic</option>
              </select>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>{
                  const newCard={id:'c'+Date.now(),...editCard};
                  setCards([...cards,newCard]);
                  setEditCard(null);
                }}
                  style={{flex:1,padding:'10px',background:'#4ECDC4',border:'none',borderRadius:8,color:'#111',fontWeight:700,cursor:'pointer'}}>
                  Create
                </button>
                <button onClick={()=>setEditCard(null)}
                  style={{flex:1,padding:'10px',background:'#333',border:'none',borderRadius:8,color:'#fff',fontWeight:700,cursor:'pointer'}}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wheel odds editor */}
        <div style={{background:'rgba(255,255,255,.02)',border:'1px solid #1a2535',borderRadius:12,padding:16,marginTop:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h2 style={{margin:0,fontSize:18,color:'#FFE66D'}}>🎰 Wheel Odds</h2>
            <button onClick={()=>setEditWt(!editWt)}
              style={{padding:'6px 14px',background:'#4ECDC4',border:'none',borderRadius:8,color:'#111',fontWeight:700,fontSize:12,cursor:'pointer'}}>
              {editWt?'✓ Save':'Edit'}
            </button>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {/* Regular */}
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'#4ECDC4',textTransform:'uppercase',marginBottom:12}}>Regular (sum={totR})</div>
              {regSegs.map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:12,height:12,borderRadius:2,background:s.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:12,color:'#aaa'}}>{s.label}</span>
                  {editWt
                    ?<input type="number" min="1" value={s.weight}
                        onChange={e=>setRegSegs(prev=>prev.map((x,j)=>j===i?{...x,weight:Math.max(1,Number(e.target.value)||1)}:x))}
                        style={{width:60,padding:'4px 8px',background:'#080d17',border:'1px solid #333',borderRadius:4,color:'#fff',fontSize:12}}/>
                    :<span style={{color:'#FFE66D',fontWeight:700,fontSize:12,minWidth:50,textAlign:'right'}}>{((s.weight/totR)*100).toFixed(1)}%</span>
                  }
                </div>
              ))}
            </div>

            {/* Elite */}
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'#FFE66D',textTransform:'uppercase',marginBottom:12}}>Elite (sum={totE})</div>
              {elSegs.map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:12,height:12,borderRadius:2,background:s.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:12,color:'#aaa'}}>{s.label}</span>
                  {editWt
                    ?<input type="number" min="1" value={s.weight}
                        onChange={e=>setElSegs(prev=>prev.map((x,j)=>j===i?{...x,weight:Math.max(1,Number(e.target.value)||1)}:x))}
                        style={{width:60,padding:'4px 8px',background:'#080d17',border:'1px solid #333',borderRadius:4,color:'#fff',fontSize:12}}/>
                    :<span style={{color:'#FFE66D',fontWeight:700,fontSize:12,minWidth:50,textAlign:'right'}}>{((s.weight/totE)*100).toFixed(1)}%</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Players */}
        <div style={{background:'rgba(255,255,255,.02)',border:'1px solid #1a2535',borderRadius:12,padding:16,marginTop:20}}>
          <h2 style={{margin:'0 0 16px',fontSize:18,color:'#4ECDC4'}}>👥 Players</h2>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {players.map(p=>(
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px',background:'rgba(78,205,196,.05)',borderRadius:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700}}>{p.name}</div>
                  <div style={{fontSize:11,color:'#888'}}>💰{p.coins} · 🎫{p.tickets??0} · ⭐{p.eliteTickets??0}</div>
                </div>
                <button onClick={()=>upd(p.id,x=>({...x,coins:0,tickets:0,eliteTickets:0}))}
                  style={{padding:'6px 12px',background:'#FF6B6B',border:'none',borderRadius:6,color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                  Reset
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
