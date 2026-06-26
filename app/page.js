'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── STORAGE (Claude artifact server) ────────────────────────────────────────
const store = {
  get: async (k, d) => {
    try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : d; }
    catch { return d; }
  },
  set: async (k, v) => {
    try { await window.storage.set(k, JSON.stringify(v)); } catch {}
  }
};

// ─── THEMES ──────────────────────────────────────────────────────────────────
const THEMES = {
  midnight: { id:'midnight', name:'Midnight', bg:'linear-gradient(160deg,#050810,#0a0f1a)', accent:'#4ECDC4', secondary:'#FFE66D', card:'rgba(255,255,255,.03)', border:'#1a2535', text:'#fff', cost:50 },
  crimson:  { id:'crimson',  name:'Crimson Red', bg:'linear-gradient(160deg,#1a0505,#2a0a0a)', accent:'#FF6B6B', secondary:'#FFE66D', card:'rgba(255,100,100,.05)', border:'#3a1515', text:'#fff', cost:50 },
  forest:   { id:'forest',   name:'Dark Green', bg:'linear-gradient(160deg,#051a0a,#0a2010)', accent:'#4CAF50', secondary:'#8BC34A', card:'rgba(76,175,80,.05)', border:'#1a3520', text:'#fff', cost:50 },
  gold:     { id:'gold',     name:'Gold', bg:'linear-gradient(160deg,#1a1500,#2a2000)', accent:'#FFD700', secondary:'#FFA500', card:'rgba(255,215,0,.05)', border:'#3a3000', text:'#fff', cost:50 },
  ocean:    { id:'ocean',    name:'Ocean', bg:'linear-gradient(160deg,#051020,#0a1830)', accent:'#00BCD4', secondary:'#4FC3F7', card:'rgba(0,188,212,.05)', border:'#0a2035', text:'#fff', cost:75 },
  aurora:   { id:'aurora',   name:'Aurora', bg:'linear-gradient(160deg,#0d0520,#150a2a)', accent:'#9C27B0', secondary:'#E91E63', card:'rgba(156,39,176,.05)', border:'#2a1535', text:'#fff', cost:75 },
};

// ─── AVATAR ITEMS ─────────────────────────────────────────────────────────────
const AVATAR_ITEMS = {
  hats: [
    {id:'hat_none',name:'None',emoji:'',type:'hat',rarity:'common',cost:0},
    {id:'hat_red',name:'Red Cap',emoji:'🧢',type:'hat',rarity:'common',cost:80,color:'#e53935'},
    {id:'hat_blue',name:'Blue Cap',emoji:'🧢',type:'hat',rarity:'common',cost:80,color:'#1e88e5'},
    {id:'hat_crown',name:'Crown',emoji:'👑',type:'hat',rarity:'rare',cost:200},
    {id:'hat_dino',name:'Dino Spike',emoji:'🦕',type:'hat',rarity:'rare',cost:300,theme:'dino'},
    {id:'hat_astro',name:'Astronaut',emoji:'👨‍🚀',type:'hat',rarity:'rare',cost:300,theme:'space'},
    {id:'hat_shell',name:'Sea Shell',emoji:'🐚',type:'hat',rarity:'rare',cost:300,theme:'ocean'},
    {id:'hat_top',name:'Top Hat',emoji:'🎩',type:'hat',rarity:'common',cost:150},
    {id:'hat_party',name:'Party Hat',emoji:'🎉',type:'hat',rarity:'common',cost:100},
  ],
  clothes: [
    {id:'shirt_none',name:'None',emoji:'',type:'clothes',rarity:'common',cost:0},
    {id:'shirt_red',name:'Red Tee',emoji:'👕',type:'clothes',rarity:'common',cost:80,color:'#e53935'},
    {id:'shirt_blue',name:'Blue Tee',emoji:'👕',type:'clothes',rarity:'common',cost:80,color:'#1e88e5'},
    {id:'shirt_dino',name:'Dino Jacket',emoji:'🦎',type:'clothes',rarity:'rare',cost:300,theme:'dino'},
    {id:'shirt_space',name:'Space Suit',emoji:'🚀',type:'clothes',rarity:'rare',cost:300,theme:'space'},
    {id:'shirt_ocean',name:'Dive Suit',emoji:'🤿',type:'clothes',rarity:'rare',cost:300,theme:'ocean'},
    {id:'shirt_hoodie',name:'Hoodie',emoji:'🧥',type:'clothes',rarity:'common',cost:120},
    {id:'shirt_suit',name:'Suit',emoji:'👔',type:'clothes',rarity:'common',cost:200},
  ],
  pants: [
    {id:'pants_none',name:'None',emoji:'',type:'pants',rarity:'common',cost:0},
    {id:'pants_red',name:'Red Shorts',emoji:'🩳',type:'pants',rarity:'common',cost:80,color:'#e53935'},
    {id:'pants_blue',name:'Blue Jeans',emoji:'👖',type:'pants',rarity:'common',cost:80,color:'#1e88e5'},
    {id:'pants_dino',name:'Dino Tail',emoji:'🦕',type:'pants',rarity:'rare',cost:300,theme:'dino'},
    {id:'pants_space',name:'Space Boots',emoji:'👩‍🚀',type:'pants',rarity:'rare',cost:300,theme:'space'},
    {id:'pants_ocean',name:'Fins',emoji:'🐟',type:'pants',rarity:'rare',cost:300,theme:'ocean'},
    {id:'pants_jogger',name:'Joggers',emoji:'🩳',type:'pants',rarity:'common',cost:100},
  ],
};

// ─── KANBAN SKINS ─────────────────────────────────────────────────────────────
const KANBAN_SKINS = [
  {id:'kb_plain',name:'Plain',banner:'#1a2535',rarity:'common',cost:0},
  {id:'kb_leaves',name:'Leafy Dreams',banner:'linear-gradient(135deg,#2d5a27,#4a7c59)',emoji:'🌿',rarity:'common',cost:100},
  {id:'kb_teddy',name:'Teddy Town',banner:'linear-gradient(135deg,#8B6914,#c4973a)',emoji:'🧸',rarity:'common',cost:100},
  {id:'kb_flowers',name:'Bloom',banner:'linear-gradient(135deg,#c2185b,#f06292)',emoji:'🌸',rarity:'common',cost:100},
  {id:'kb_birds',name:'Little Birbs',banner:'linear-gradient(135deg,#0288d1,#4fc3f7)',emoji:'🐦',rarity:'common',cost:100},
  {id:'kb_dino',name:'Dino World',banner:'linear-gradient(135deg,#2e7d32,#66bb6a)',emoji:'🦕',rarity:'epic',cost:500,theme:'dino'},
  {id:'kb_space',name:'Cosmic Board',banner:'linear-gradient(135deg,#1a237e,#7c4dff)',emoji:'🌌',rarity:'epic',cost:500,theme:'space'},
  {id:'kb_ocean',name:'Deep Blue',banner:'linear-gradient(135deg,#006064,#00bcd4)',emoji:'🌊',rarity:'epic',cost:500,theme:'ocean'},
];

// ─── MINESWEEPER SKINS ────────────────────────────────────────────────────────
const MINE_SKINS = [
  {id:'ms_classic',name:'Classic',flag:'🚩',bomb:'💣',rarity:'common',cost:0},
  {id:'ms_dino',name:'Dino Sweep',flag:'🦕',bomb:'🥚',rarity:'legendary',cost:800,theme:'dino'},
  {id:'ms_space',name:'Space Sweep',flag:'🛸',bomb:'☄️',rarity:'legendary',cost:800,theme:'space'},
  {id:'ms_ocean',name:'Ocean Sweep',flag:'🐠',bomb:'🦑',rarity:'legendary',cost:800,theme:'ocean'},
  {id:'ms_flower',name:'Flower Sweep',flag:'🌸',bomb:'🌵',rarity:'common',cost:150},
  {id:'ms_fruit',name:'Fruity',flag:'🍓',bomb:'💥',rarity:'common',cost:150},
];

// ─── RARITY CONFIG ────────────────────────────────────────────────────────────
const RARITY = {
  common:    {color:'#ffffff',label:'Common',weight:60},
  rare:      {color:'#4fc3f7',label:'Rare',weight:25},
  epic:      {color:'#ce93d8',label:'Epic',weight:10},
  legendary: {color:'#ffb74d',label:'Legendary',weight:5},
};

// ─── WEIGHTED RANDOM ──────────────────────────────────────────────────────────
function pickWeighted(segs){
  const tot=segs.reduce((s,x)=>s+x.weight,0);
  let r=Math.random()*tot;
  for(let i=0;i<segs.length;i++){r-=segs[i].weight;if(r<=0)return i;}
  return segs.length-1;
}

function calcRot(curr,idx,n){
  const sa=360/n,sc=idx*sa+sa/2;
  const base=(270-sc+720)%360;
  const mod=((curr%360)+360)%360;
  let delta=base-mod;if(delta<0)delta+=360;if(delta<30)delta+=360;
  return curr+delta+6*360;
}

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  // Player
  player: { name:'Employee', coins:0, tickets:0, eliteTickets:0, ownedItems:['hat_none','shirt_none','pants_none','kb_plain','ms_classic'], equippedTheme:'midnight', equippedHat:'hat_none', equippedShirt:'shirt_none', equippedPants:'pants_none', equippedKbSkin:'kb_plain', equippedMsSkin:'ms_classic', skinColor:'#FDBCB4', mineLevel:1, mineWins:0, mineLosses:0, boardsDone:0, notifications:[] },
  // Friend (NPC)
  friend: { name:'Alex', coins:0, tickets:0, eliteTickets:0, mineLevel:1, mineWins:0, messages:[] },
  // Kanban
  cards: [
    {id:'c1',title:'Setup authentication',desc:'Implement login flow',list:'todo',dueDate:'',submittedAt:'',files:[],image:'🔐'},
    {id:'c2',title:'Build dashboard UI',desc:'Main screen layout',list:'inprogress',dueDate:'',submittedAt:'',files:[],image:'📊'},
  ],
  // Wheels
  regSegs: [
    {id:0,label:'50 Coins',type:'coins',val:50,weight:30,color:'#4ECDC4',image:''},
    {id:1,label:'100 Coins',type:'coins',val:100,weight:25,color:'#FFE66D',image:''},
    {id:2,label:'200 Coins',type:'coins',val:200,weight:20,color:'#95E1D3',image:''},
    {id:3,label:'500 Coins',type:'coins',val:500,weight:12,color:'#FF8B94',image:''},
    {id:4,label:'+2 Tickets',type:'tickets',val:2,weight:8,color:'#C7CEEA',image:''},
    {id:5,label:'⭐ ELITE',type:'elite_ticket',val:1,weight:5,color:'#FF6B6B',image:''},
  ],
  eliteSegs: [
    {id:0,label:'1K Coins',type:'coins',val:1000,weight:35,color:'#4ECDC4',image:''},
    {id:1,label:'2.5K Coins',type:'coins',val:2500,weight:25,color:'#FFE66D',image:''},
    {id:2,label:'5K Coins',type:'coins',val:5000,weight:15,color:'#95E1D3',image:''},
    {id:3,label:'🎁 Prize',type:'custom',val:'Boss buys lunch!',weight:13,color:'#C7CEEA',image:''},
    {id:4,label:'10K Coins',type:'coins',val:10000,weight:8,color:'#FF8B94',image:''},
    {id:5,label:'💎 JACKPOT',type:'jackpot',val:25000,weight:4,color:'#FF6B6B',image:''},
  ],
  ultraSegs: [
    {id:0,label:'Prize 1',type:'custom',val:'Day Off!',weight:40,color:'#FFD700',image:''},
    {id:1,label:'Prize 2',type:'custom',val:'Free Lunch!',weight:35,color:'#FF8B94',image:''},
    {id:2,label:'Prize 3',type:'custom',val:'Early Finish!',weight:25,color:'#4ECDC4',image:''},
  ],
  // Shop
  shop: {
    resetTime:'09:00', lastReset:'', stock:[], priceMin:10, priceMax:200,
    lockedSlots:[
      {slots:[3,4],requireType:'tickets',requireAmt:50,label:'Rare Section'},
      {slots:[5],requireType:'eliteTickets',requireAmt:1,label:'Legendary Vault'},
    ],
  },
  // Admin config
  admin: {
    password:'admin',
    onTimeTickets:2, lateTickets:1, veryLateTickets:0,
    minesweeperCost:50, minesweeperReturn:5,
    ultraWheelCost:1,
    themeUnlockCost:50, mineUnlockCost:100, ultraUnlockCost:1,
    themeUnlockType:'tickets', mineUnlockType:'tickets', ultraUnlockType:'eliteTickets',
    boardName:'Dev Board', friendName:'Alex',
  },
  // Locked features
  unlocked: { themes:false, minesweeper:false, ultraWheel:false },
};

// ─── WHEEL SVG ────────────────────────────────────────────────────────────────
function WheelSVG({segs,rot,spinning,size=260}){
  const N=segs.length,cx=size/2,cy=size/2,r=size*0.4,tr=size*0.27;
  const rad=d=>d*Math.PI/180;
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{filter:'drop-shadow(0 0 16px rgba(78,205,196,.25))',transform:`rotate(${rot}deg)`,transition:spinning?'transform 3.5s cubic-bezier(0.17,0.67,0.12,0.99)':'none',userSelect:'none'}}>
      <defs>
        <filter id="segShadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/></filter>
      </defs>
      {segs.map((s,i)=>{
        const a0=(i/N)*360,a1=((i+1)/N)*360;
        const x1=cx+r*Math.cos(rad(a0)),y1=cy+r*Math.sin(rad(a0));
        const x2=cx+r*Math.cos(rad(a1)),y2=cy+r*Math.sin(rad(a1));
        const mx=(a0+a1)/2,tx=cx+tr*Math.cos(rad(mx)),ty=cy+tr*Math.sin(rad(mx));
        return(<g key={i}>
          <path d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}Z`} fill={s.color} stroke="#080e18" strokeWidth="2"/>
          <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
            style={{fontSize:s.image?size*0.07:size<200?8:10,fontWeight:'bold',fill:'#111',pointerEvents:'none'}}
            transform={`rotate(${mx+90} ${tx} ${ty})`}>
            {s.image||( s.label.length>8?s.label.slice(0,7)+'…':s.label)}
          </text>
        </g>);
      })}
      <circle cx={cx} cy={cy} r={size*0.1} fill="#080e18" stroke="#fff" strokeWidth="2.5"/>
      <text x={cx} y={cy+2} textAnchor="middle" dominantBaseline="middle" style={{fontSize:size*0.07,pointerEvents:'none'}}>💰</text>
    </svg>
  );
}

// ─── STICK FIGURE AVATAR ──────────────────────────────────────────────────────
function Avatar({player,size=120}){
  const sc=player.skinColor||'#FDBCB4';
  const hat=AVATAR_ITEMS.hats.find(h=>h.id===player.equippedHat);
  const shirt=AVATAR_ITEMS.clothes.find(c=>c.id===player.equippedShirt);
  const pants=AVATAR_ITEMS.pants.find(p=>p.id===player.equippedPants);
  const s=size/120;
  return(
    <svg width={size} height={size} viewBox="0 0 120 120">
      {/* Shadow */}
      <ellipse cx="60" cy="115" rx="25" ry="5" fill="rgba(0,0,0,.3)"/>
      {/* Legs */}
      <line x1="50" y1="85" x2="40" y2="110" stroke={pants?'#555':'#888'} strokeWidth="7" strokeLinecap="round"/>
      <line x1="70" y1="85" x2="80" y2="110" stroke={pants?'#555':'#888'} strokeWidth="7" strokeLinecap="round"/>
      {/* Pants emoji */}
      {pants?.emoji&&<text x="60" y="105" textAnchor="middle" fontSize="14">{pants.emoji}</text>}
      {/* Body */}
      <rect x="42" y="60" width="36" height="28" rx="8" fill={shirt?.color||'#4ECDC4'}/>
      {shirt?.emoji&&<text x="60" y="78" textAnchor="middle" fontSize="14">{shirt.emoji}</text>}
      {/* Arms */}
      <line x1="42" y1="68" x2="28" y2="82" stroke={sc} strokeWidth="7" strokeLinecap="round"/>
      <line x1="78" y1="68" x2="92" y2="82" stroke={sc} strokeWidth="7" strokeLinecap="round"/>
      {/* Neck */}
      <line x1="60" y1="60" x2="60" y2="50" stroke={sc} strokeWidth="7" strokeLinecap="round"/>
      {/* Head */}
      <circle cx="60" cy="40" r="18" fill={sc} stroke="rgba(0,0,0,.1)" strokeWidth="1"/>
      {/* Face */}
      <circle cx="54" cy="37" r="2.5" fill="#333"/>
      <circle cx="66" cy="37" r="2.5" fill="#333"/>
      <path d="M 53 44 Q 60 50 67 44" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Hat */}
      {hat?.emoji&&<text x="60" y="22" textAnchor="middle" fontSize="18">{hat.emoji}</text>}
    </svg>
  );
}

// ─── MINESWEEPER ──────────────────────────────────────────────────────────────
function Minesweeper({player,setPlayer,skin,adminCfg,theme,toast}){
  const ROWS=16,COLS=16,MINES=40;
  const [board,setBoard]=useState(null);
  const [gameState,setGameState]=useState('idle');
  const [flagged,setFlagged]=useState(new Set());
  const [revealed,setRevealed]=useState(new Set());
  const [startTime,setStartTime]=useState(null);
  const sk=MINE_SKINS.find(s=>s.id===skin)||MINE_SKINS[0];

  const initBoard=(firstR,firstC)=>{
    const mines=new Set();
    while(mines.size<MINES){
      const pos=Math.floor(Math.random()*ROWS*COLS);
      const r=Math.floor(pos/COLS),c=pos%COLS;
      if(Math.abs(r-firstR)>1||Math.abs(c-firstC)>1)mines.add(pos);
    }
    const b=Array(ROWS).fill(null).map((_,r)=>Array(COLS).fill(null).map((_,c)=>{
      const pos=r*COLS+c;
      const adj=[-1,-1,-1,0,-1,1,0,-1,0,1,1,-1,1,0,1,1].reduce((cnt,_,i,a)=>{
        if(i%2!==0)return cnt;
        const nr=r+a[i],nc=c+a[i+1];
        if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&mines.has(nr*COLS+nc))return cnt+1;
        return cnt;
      },0);
      return{mine:mines.has(pos),adj};
    }));
    return b;
  };

  const reveal=(b,r,c,rev)=>{
    const pos=r*COLS+c;
    if(rev.has(pos)||r<0||r>=ROWS||c<0||c>=COLS)return;
    rev.add(pos);
    if(b[r][c].adj===0&&!b[r][c].mine){
      [-1,0,1].forEach(dr=>[-1,0,1].forEach(dc=>{if(dr||dc)reveal(b,r+dr,c+dc,rev);}));
    }
  };

  const handleClick=(r,c)=>{
    if(gameState==='won'||gameState==='lost')return;
    const pos=r*COLS+c;
    if(flagged.has(pos))return;
    let b=board,rev=new Set(revealed);
    if(!b){
      b=initBoard(r,c);
      setBoard(b);
      setStartTime(Date.now());
      setGameState('playing');
    }
    if(b[r][c].mine){
      const allMines=new Set();
      b.forEach((row,ri)=>row.forEach((cell,ci)=>{if(cell.mine)allMines.add(ri*COLS+ci);}));
      setRevealed(new Set([...rev,...allMines]));
      setGameState('lost');
      setPlayer(p=>({...p,mineLosses:(p.mineLosses||0)+1}));
      toast('💥 Game Over!','😵');
      return;
    }
    reveal(b,r,c,rev);
    setRevealed(new Set(rev));
    const safe=ROWS*COLS-MINES;
    if(rev.size>=safe){
      setGameState('won');
      const wins=(player.mineWins||0)+1;
      const lvl=player.mineLevel||1;
      const thresholds=[0,2,3,10,20,40,80,160,320,640];
      const needed=thresholds[lvl]||999;
      const winsAtLevel=(player.winsAtLevel||0)+1;
      let newLvl=lvl,newWAL=winsAtLevel;
      if(winsAtLevel>=needed&&lvl<10){newLvl=lvl+1;newWAL=0;toast(`🎮 Level Up! Now Level ${newLvl}`,'⬆️',true);}
      const reward=adminCfg.minesweeperReturn||5;
      setPlayer(p=>({...p,mineWins:wins,mineLevel:newLvl,winsAtLevel:newWAL,tickets:(p.tickets||0)+reward}));
      toast(`🎉 You Won! +${reward} tickets`,'🏆',true);
    }
  };

  const rightClick=(e,r,c)=>{
    e.preventDefault();
    if(gameState==='idle'||gameState==='won'||gameState==='lost')return;
    const pos=r*COLS+c;
    if(revealed.has(pos))return;
    setFlagged(prev=>{const n=new Set(prev);n.has(pos)?n.delete(pos):n.add(pos);return n;});
  };

  const reset=()=>{setBoard(null);setGameState('idle');setFlagged(new Set());setRevealed(new Set());setStartTime(null);};
  const cost=adminCfg.minesweeperCost||50;

  const startGame=()=>{
    if((player.coins||0)<cost){alert(`Need ${cost} coins to play!`);return;}
    setPlayer(p=>({...p,coins:p.coins-cost}));
    reset();
    setGameState('ready');
  };

  if(gameState==='idle')return(
    <div style={{textAlign:'center',padding:40}}>
      <div style={{fontSize:48,marginBottom:16}}>💣</div>
      <div style={{fontSize:20,fontWeight:700,marginBottom:8}}>Minesweeper</div>
      <div style={{fontSize:13,color:'#888',marginBottom:24}}>16×16 · 40 mines · Costs {cost} coins · Win = +{adminCfg.minesweeperReturn||5} tickets</div>
      <div style={{fontSize:13,color:'#aaa',marginBottom:24}}>Level {player.mineLevel||1} · {player.mineWins||0}W / {player.mineLosses||0}L</div>
      <button onClick={startGame} style={{padding:'12px 32px',background:'linear-gradient(135deg,#FFE66D,#FF8B94)',border:'none',borderRadius:12,color:'#111',fontSize:15,fontWeight:700,cursor:'pointer'}}>
        Play ({cost} coins)
      </button>
    </div>
  );

  const cellSize=Math.min(26,Math.floor((window.innerWidth-40)/COLS));

  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
      <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',justifyContent:'center'}}>
        <span style={{fontSize:13,color:'#aaa'}}>💣 {MINES-flagged.size} left</span>
        <span style={{fontSize:13,color:gameState==='won'?'#4ECDC4':gameState==='lost'?'#FF6B6B':'#aaa'}}>
          {gameState==='won'?'🏆 Won!':gameState==='lost'?'💥 Lost!':'🎮 Playing'}
        </span>
        <button onClick={()=>{reset();setGameState('idle');}} style={{padding:'6px 14px',background:'#333',border:'none',borderRadius:8,color:'#fff',fontSize:12,cursor:'pointer'}}>New Game</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:`repeat(${COLS},${cellSize}px)`,gap:1,background:'#111',padding:4,borderRadius:8}}>
        {Array(ROWS).fill(null).map((_,r)=>Array(COLS).fill(null).map((_,c)=>{
          const pos=r*COLS+c;
          const isRev=revealed.has(pos);
          const isFlag=flagged.has(pos);
          const cell=board?.[r]?.[c];
          const numColors=['','#4ECDC4','#4CAF50','#FF8B94','#9C27B0','#FF5722','#00BCD4','#000','#607D8B'];
          return(
            <div key={`${r}-${c}`}
              onClick={()=>handleClick(r,c)}
              onContextMenu={e=>rightClick(e,r,c)}
              style={{width:cellSize,height:cellSize,display:'flex',alignItems:'center',justifyContent:'center',fontSize:cellSize*0.5,cursor:'pointer',borderRadius:3,background:isRev?(cell?.mine?'#c62828':'#1a2535'):'#0f3460',border:isRev?'1px solid #1a2535':'1px solid #1a4a7a',userSelect:'none',transition:'background .1s'}}>
              {isRev&&cell?.mine&&sk.bomb}
              {isRev&&!cell?.mine&&cell?.adj>0&&<span style={{fontSize:cellSize*0.55,fontWeight:700,color:numColors[cell.adj]}}>{cell.adj}</span>}
              {!isRev&&isFlag&&sk.flag}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

// ─── SHOP ─────────────────────────────────────────────────────────────────────
function generateShopStock(allItems,lastReset,resetTime,priceMin,priceMax,lockedSlots,player){
  const now=new Date();
  const [rh,rm]=(resetTime||'09:00').split(':').map(Number);
  const resetToday=new Date(now);resetToday.setHours(rh,rm,0,0);
  if(now<resetToday)resetToday.setDate(resetToday.getDate()-1);
  const seed=resetToday.toDateString();
  if(lastReset===seed)return null;

  const unowned=allItems.filter(i=>!player.ownedItems?.includes(i.id));
  const byRarity={common:[],rare:[],epic:[],legendary:[]};
  unowned.forEach(i=>{if(byRarity[i.rarity])byRarity[i.rarity].push(i);});

  const pick=(pool)=>{
    if(!pool.length)return null;
    return pool[Math.floor(Math.random()*pool.length)];
  };

  const priceFor=(rarity)=>{
    const ranges={common:[10,50],rare:[50,100],epic:[100,150],legendary:[150,200]};
    const [lo,hi]=ranges[rarity]||[10,100];
    const clampLo=Math.max(lo,priceMin||10);
    const clampHi=Math.min(hi,priceMax||200);
    const range=Math.max(1,clampHi-clampLo);
    return Math.round((clampLo+Math.floor(Math.random()*range))/10)*10;
  };

  const slots=[];
  const weights=[60,60,25,25,10,5];
  for(let i=0;i<6;i++){
    const w=weights[i];
    let pool=w>=60?byRarity.common:w>=25?[...byRarity.rare,...byRarity.common]:[...byRarity.epic,...byRarity.rare,...byRarity.legendary];
    const item=pick(pool.filter(x=>!slots.find(s=>s?.id===x?.id)));
    if(item)slots.push({...item,shopPrice:priceFor(item.rarity)});
    else slots.push(null);
  }
  return{stock:slots,resetDate:seed};
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function DevWheel(){
  const [ok,setOk]=useState(false);
  const [view,setView]=useState('admin-login');
  const [tab,setTab]=useState('wheels');
  const [adminTab,setAdminTab]=useState('kanban');
  const [popup,setPopup]=useState(null);
  const [profileOpen,setProfileOpen]=useState(false);
  const [friendOpen,setFriendOpen]=useState(false);
  const [profileTab,setProfileTab]=useState('avatar');

  // ─ State
  const [player,setPlayer]=useState(DEFAULT_STATE.player);
  const [friend,setFriend]=useState(DEFAULT_STATE.friend);
  const [cards,setCards]=useState(DEFAULT_STATE.cards);
  const [regSegs,setRegSegs]=useState(DEFAULT_STATE.regSegs);
  const [eliteSegs,setEliteSegs]=useState(DEFAULT_STATE.eliteSegs);
  const [ultraSegs,setUltraSegs]=useState(DEFAULT_STATE.ultraSegs);
  const [shop,setShop]=useState(DEFAULT_STATE.shop);
  const [admin,setAdmin]=useState(DEFAULT_STATE.admin);
  const [unlocked,setUnlocked]=useState(DEFAULT_STATE.unlocked);
  const [regRot,setRegRot]=useState(0);
  const [elRot,setElRot]=useState(0);
  const [ultraRot,setUltraRot]=useState(0);
  const [regSpin,setRegSpin]=useState(false);
  const [elSpin,setElSpin]=useState(false);
  const [ultraSpin,setUltraSpin]=useState(false);
  const [passInput,setPassInput]=useState('');
  const [dragCard,setDragCard]=useState(null);
  const [editCard,setEditCard]=useState(null);
  const [editSeg,setEditSeg]=useState(null);
  const [newCardList,setNewCardList]=useState('todo');
  const [adminPassInput,setAdminPassInput]=useState('');
  const [shopStock,setShopStock]=useState([]);

  // ─ Load
  useEffect(()=>{
    (async()=>{
      const p=await store.get('dw-player',DEFAULT_STATE.player);
      const f=await store.get('dw-friend',DEFAULT_STATE.friend);
      const c=await store.get('dw-cards',DEFAULT_STATE.cards);
      const rs=await store.get('dw-regsegs',DEFAULT_STATE.regSegs);
      const es=await store.get('dw-elsegs',DEFAULT_STATE.eliteSegs);
      const us=await store.get('dw-ultrasegs',DEFAULT_STATE.ultraSegs);
      const sh=await store.get('dw-shop',DEFAULT_STATE.shop);
      const ad=await store.get('dw-admin',DEFAULT_STATE.admin);
      const ul=await store.get('dw-unlocked',DEFAULT_STATE.unlocked);
      setPlayer({...DEFAULT_STATE.player,...p});
      setFriend({...DEFAULT_STATE.friend,...f});
      setCards(c);setRegSegs(rs);setEliteSegs(es);setUltraSegs(us);
      setShop(sh);setAdmin(ad);setUnlocked(ul);
      // Generate shop stock
      const allItems=[...Object.values(AVATAR_ITEMS).flat(),...KANBAN_SKINS,...MINE_SKINS,...Object.values(THEMES).map(t=>({...t,type:'theme',rarity:'common',cost:t.cost}))];
      const result=generateShopStock(allItems,sh.lastReset,sh.resetTime,sh.priceMin,sh.priceMax,sh.lockedSlots,p);
      if(result){const ns={...sh,stock:result.stock,lastReset:result.resetDate};setShop(ns);await store.set('dw-shop',ns);setShopStock(result.stock);}
      else setShopStock(sh.stock||[]);
      setOk(true);
    })();
  },[]);

  // ─ Save
  useEffect(()=>{if(ok)store.set('dw-player',player);},[player,ok]);
  useEffect(()=>{if(ok)store.set('dw-friend',friend);},[friend,ok]);
  useEffect(()=>{if(ok)store.set('dw-cards',cards);},[cards,ok]);
  useEffect(()=>{if(ok)store.set('dw-regsegs',regSegs);},[regSegs,ok]);
  useEffect(()=>{if(ok)store.set('dw-elsegs',eliteSegs);},[eliteSegs,ok]);
  useEffect(()=>{if(ok)store.set('dw-ultrasegs',ultraSegs);},[ultraSegs,ok]);
  useEffect(()=>{if(ok)store.set('dw-shop',shop);},[shop,ok]);
  useEffect(()=>{if(ok)store.set('dw-admin',admin);},[admin,ok]);
  useEffect(()=>{if(ok)store.set('dw-unlocked',unlocked);},[unlocked,ok]);

  const theme=THEMES[player.equippedTheme]||THEMES.midnight;
  const T=theme;

  const toast=(label,emoji,big=false)=>{setPopup({label,emoji,big});setTimeout(()=>setPopup(null),big?4000:2800);};

  // ─ Wheel spins
  const spinWheel=(type)=>{
    if(regSpin||elSpin||ultraSpin)return;
    if(type==='reg'){
      if((player.tickets||0)<1){alert('No tickets!');return;}
      setPlayer(p=>({...p,tickets:p.tickets-1}));
      setRegSpin(true);
      const idx=pickWeighted(regSegs);
      const seg=regSegs[idx];
      setRegRot(prev=>calcRot(prev,idx,regSegs.length));
      setTimeout(()=>{
        if(seg.type==='coins'){setPlayer(p=>({...p,coins:p.coins+seg.val}));toast(`+${seg.val.toLocaleString()} Coins`,'💰');}
        else if(seg.type==='tickets'){setPlayer(p=>({...p,tickets:(p.tickets||0)+seg.val}));toast(`+${seg.val} Tickets`,'🎫');}
        else if(seg.type==='elite_ticket'){setPlayer(p=>({...p,eliteTickets:(p.eliteTickets||0)+1}));toast('⭐ ELITE TICKET!','🌟',true);}
        else if(seg.type==='custom'){toast(seg.val,'🎁',true);}
        setRegSpin(false);
      },3700);
    } else if(type==='elite'){
      if((player.eliteTickets||0)<1){alert('No elite tickets!');return;}
      setPlayer(p=>({...p,eliteTickets:p.eliteTickets-1}));
      setElSpin(true);
      const idx=pickWeighted(eliteSegs);
      const seg=eliteSegs[idx];
      setElRot(prev=>calcRot(prev,idx,eliteSegs.length));
      setTimeout(()=>{
        if(seg.type==='coins'||seg.type==='jackpot'){setPlayer(p=>({...p,coins:p.coins+seg.val}));toast(`+${seg.val.toLocaleString()} Coins`,seg.type==='jackpot'?'💎':'💰',seg.type==='jackpot');}
        else if(seg.type==='custom'){toast(seg.val,'🎁',true);}
        setElSpin(false);
      },3700);
    } else if(type==='ultra'){
      if((player.eliteTickets||0)<(admin.ultraWheelCost||1)){alert(`Need ${admin.ultraWheelCost||1} elite ticket(s)!`);return;}
      setPlayer(p=>({...p,eliteTickets:p.eliteTickets-(admin.ultraWheelCost||1)}));
      setUltraSpin(true);
      const idx=pickWeighted(ultraSegs);
      const seg=ultraSegs[idx];
      setUltraRot(prev=>calcRot(prev,idx,ultraSegs.length));
      setTimeout(()=>{toast(seg.val,'🎁',true);setUltraSpin(false);},3700);
    }
  };

  // ─ Kanban: move card → award tickets
  const moveCard=(cardId,newList)=>{
    const card=cards.find(c=>c.id===cardId);
    if(!card||card.list===newList)return;
    if(newList==='done'){
      if(card.list!=='done'){
        const now=new Date();
        const due=card.dueDate?new Date(card.dueDate):null;
        let tix=admin.onTimeTickets??2;
        if(due){
          const diffDays=(now-due)/(1000*60*60*24);
          if(diffDays>2)tix=admin.veryLateTickets??0;
          else if(diffDays>0)tix=admin.lateTickets??1;
        }
        setPlayer(p=>({...p,tickets:(p.tickets||0)+tix,boardsDone:(p.boardsDone||0)+1}));
        if(tix>0)toast(`+${tix} Ticket${tix>1?'s':''} (${due&&(now-due)>86400000?'late':'on time'})!`,'🎫');
        else toast('Submitted late — no tickets','😔');
      }
    }
    setCards(prev=>prev.map(c=>c.id===cardId?{...c,list:newList,submittedAt:newList==='done'?new Date().toISOString():c.submittedAt}:c));
  };

  // ─ Shop purchase
  const buyShopItem=(item)=>{
    if(!item)return;
    if((player.coins||0)<item.shopPrice){alert(`Need ${item.shopPrice} coins!`);return;}
    if(player.ownedItems?.includes(item.id)){alert('Already owned!');return;}
    setPlayer(p=>({...p,coins:p.coins-item.shopPrice,ownedItems:[...(p.ownedItems||[]),item.id]}));
    toast(`Bought: ${item.name}!`,'🛍️',true);
  };

  // ─ Check lock
  const canAccess=(feature)=>{
    if(unlocked[feature])return true;
    const cost=admin[`${feature}UnlockCost`]||50;
    const type=admin[`${feature}UnlockType`]||'tickets';
    const val=type==='tickets'?player.tickets:type==='eliteTickets'?player.eliteTickets:player.boardsDone;
    return(val||0)>=cost;
  };
  const tryUnlock=(feature)=>{
    if(unlocked[feature])return true;
    if(canAccess(feature)){setUnlocked(u=>({...u,[feature]:true}));toast('🔓 Feature Unlocked!','🎉',true);return true;}
    return false;
  };

  const kbSkin=KANBAN_SKINS.find(s=>s.id===player.equippedKbSkin)||KANBAN_SKINS[0];

  if(!ok)return<div style={{minHeight:'100vh',background:'#050810',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{color:'#4ECDC4',fontSize:22}}>🎡 Loading…</span></div>;

  // ══════════════════════════════════════════════════════════════
  // ADMIN LOGIN PAGE
  // ══════════════════════════════════════════════════════════════
  if(view==='admin-login')return(
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#050810,#0a0f1a)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <div style={{background:'rgba(255,255,255,.04)',border:'1px solid #1a2535',borderRadius:20,padding:40,textAlign:'center',width:320}}>
        <div style={{fontSize:48,marginBottom:12}}>🎡</div>
        <h1 style={{fontSize:22,color:'#fff',margin:'0 0 6px',fontWeight:800}}>DevWheel</h1>
        <p style={{color:'#555',fontSize:13,margin:'0 0 28px'}}>Admin Portal</p>
        <input type="password" placeholder="Admin password" value={adminPassInput} onChange={e=>setAdminPassInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&adminPassInput===admin.password&&setView('admin')}
          style={{width:'100%',padding:'12px',background:'#080d17',border:'2px solid #1a2535',borderRadius:10,color:'#fff',fontSize:14,marginBottom:12}}/>
        <button onClick={()=>{if(adminPassInput===admin.password){setView('admin');setAdminPassInput('');}else alert('Wrong password');}}
          style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#4ECDC4,#44A08D)',border:'none',borderRadius:10,color:'#111',fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:16}}>
          🔓 Enter Admin
        </button>
        <button onClick={()=>setView('employee')}
          style={{width:'100%',padding:'10px',background:'transparent',border:'1px dashed #333',borderRadius:10,color:'#555',fontSize:13,cursor:'pointer'}}>
          View as Employee →
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // ADMIN VIEW
  // ══════════════════════════════════════════════════════════════
  if(view==='admin'){
    const adminTabs=[['kanban','📋 Kanban'],['wheels','🎡 Wheels'],['shop','🛍️ Shop'],['player','👤 Player'],['settings','⚙️ Settings']];
    return(
      <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#050810,#0a0f1a)',color:'#fff',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
        <style>{`*{box-sizing:border-box}body{margin:0}input::placeholder{color:#333}input:focus,select:focus,textarea:focus{outline:none;border-color:#4ECDC4!important}.ah:hover{opacity:.8}.bh:hover:not(:disabled){opacity:.88;transform:translateY(-1px)}.ch:hover{background:rgba(255,255,255,.06)!important}@keyframes fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Admin Header */}
        <div style={{background:'rgba(255,255,255,.03)',borderBottom:'1px solid #1a2535',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:22}}>⚙️</span>
            <span style={{fontSize:16,fontWeight:700,color:'#4ECDC4'}}>Admin Panel</span>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setView('employee')} className="ah" style={{padding:'7px 14px',background:'rgba(78,205,196,.1)',border:'1px solid #4ECDC4',borderRadius:8,color:'#4ECDC4',fontSize:12,fontWeight:700,cursor:'pointer'}}>👁️ View Employee</button>
            <button onClick={()=>setView('admin-login')} className="ah" style={{padding:'7px 14px',background:'rgba(255,107,107,.1)',border:'1px solid #FF6B6B',borderRadius:8,color:'#FF6B6B',fontSize:12,fontWeight:700,cursor:'pointer'}}>🚪 Logout</button>
          </div>
        </div>

        {/* Admin Tabs */}
        <div style={{display:'flex',gap:0,borderBottom:'1px solid #1a2535',overflowX:'auto'}}>
          {adminTabs.map(([id,lbl])=>(
            <button key={id} className="ah" onClick={()=>setAdminTab(id)}
              style={{padding:'12px 20px',background:'transparent',border:'none',borderBottom:adminTab===id?'2px solid #4ECDC4':'2px solid transparent',color:adminTab===id?'#4ECDC4':'#666',fontSize:13,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
              {lbl}
            </button>
          ))}
        </div>

        <div style={{maxWidth:1200,margin:'0 auto',padding:'20px 16px'}}>

          {/* ── KANBAN TAB ── */}
          {adminTab==='kanban'&&(
            <div style={{animation:'fd .25s ease'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h2 style={{margin:0,fontSize:18,color:'#FFE66D'}}>{admin.boardName||'Dev Board'}</h2>
                <button onClick={()=>{setNewCardList('todo');setEditCard({id:'',title:'',desc:'',list:'todo',dueDate:'',image:'',files:[]});}}
                  style={{padding:'8px 16px',background:'linear-gradient(135deg,#4ECDC4,#44A08D)',border:'none',borderRadius:8,color:'#111',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                  + New Card
                </button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
                {['todo','inprogress','done'].map(listId=>(
                  <div key={listId} style={{background:'rgba(255,255,255,.02)',border:'1px solid #1a2535',borderRadius:16,overflow:'hidden'}}
                    onDragOver={e=>e.preventDefault()}
                    onDrop={e=>{e.preventDefault();if(dragCard)moveCard(dragCard,listId);}}>
                    {/* Column banner */}
                    <div style={{height:60,background:kbSkin.banner||'#1a2535',display:'flex',alignItems:'center',justifyContent:'center',gap:8,position:'relative'}}>
                      {kbSkin.emoji&&<span style={{fontSize:20,opacity:.7}}>{kbSkin.emoji}</span>}
                      <span style={{fontSize:13,fontWeight:700,color:'#fff',textTransform:'uppercase',letterSpacing:1}}>
                        {listId==='todo'?'📝 To Do':listId==='inprogress'?'🔄 In Progress':'✅ Done'}
                      </span>
                    </div>
                    <div style={{padding:12,display:'flex',flexDirection:'column',gap:8,minHeight:300}}>
                      {cards.filter(c=>c.list===listId).map(card=>{
                        const due=card.dueDate?new Date(card.dueDate):null;
                        const now=new Date();
                        const isLate=due&&now>due&&card.list!=='done';
                        return(
                          <div key={card.id} draggable onDragStart={()=>setDragCard(card.id)} onDragEnd={()=>setDragCard(null)}
                            className="ch"
                            style={{background:'rgba(255,255,255,.04)',border:`1px solid ${isLate?'#FF6B6B':'#1a2535'}`,borderRadius:12,padding:12,cursor:'grab',transition:'all .2s',boxShadow:'4px 4px 0 rgba(0,0,0,.3)'}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                              <div style={{fontSize:14,fontWeight:700,flex:1}}>{card.image&&<span style={{marginRight:6}}>{card.image}</span>}{card.title}</div>
                              <button onClick={()=>setEditCard(card)} style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:14,padding:'0 0 0 8px'}}>✏️</button>
                            </div>
                            {card.desc&&<div style={{fontSize:12,color:'#888',marginBottom:6}}>{card.desc}</div>}
                            <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                              {card.dueDate&&<span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:isLate?'rgba(255,107,107,.15)':'rgba(78,205,196,.1)',color:isLate?'#FF6B6B':'#4ECDC4',fontWeight:600}}>📅 {new Date(card.dueDate).toLocaleDateString()}</span>}
                              {card.submittedAt&&<span style={{fontSize:10,color:'#888'}}>✅ {new Date(card.submittedAt).toLocaleDateString()}</span>}
                              {card.files?.length>0&&<span style={{fontSize:10,color:'#FFE66D'}}>📎 {card.files.length} file{card.files.length>1?'s':''}</span>}
                            </div>
                            {/* File downloads */}
                            {card.files?.length>0&&(
                              <div style={{marginTop:6,display:'flex',flexDirection:'column',gap:3}}>
                                {card.files.map((f,fi)=>(
                                  <a key={fi} href={f.dataUrl} download={f.name}
                                    style={{fontSize:10,color:'#4ECDC4',textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>
                                    ⬇️ {f.name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Card edit modal */}
              {editCard&&(
                <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
                  <div style={{background:'#0a0f1a',border:'2px solid #4ECDC4',borderRadius:16,padding:24,width:400,maxHeight:'90vh',overflowY:'auto'}}>
                    <h3 style={{margin:'0 0 16px',color:'#4ECDC4'}}>{editCard.id?'Edit Card':'New Card'}</h3>
                    {[['Title','title','text'],['Description','desc','text'],['Emoji/Image','image','text'],['Due Date','dueDate','date']].map(([lbl,key,type])=>(
                      <div key={key} style={{marginBottom:10}}>
                        <div style={{fontSize:11,color:'#4ECDC4',fontWeight:700,marginBottom:4,textTransform:'uppercase'}}>{lbl}</div>
                        <input type={type} value={editCard[key]||''} onChange={e=>setEditCard(p=>({...p,[key]:e.target.value}))}
                          style={{width:'100%',padding:'9px 12px',background:'#080d17',border:'1px solid #1a2535',borderRadius:8,color:'#fff',fontSize:13}}/>
                      </div>
                    ))}
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:11,color:'#4ECDC4',fontWeight:700,marginBottom:4,textTransform:'uppercase'}}>List</div>
                      <select value={editCard.list||'todo'} onChange={e=>setEditCard(p=>({...p,list:e.target.value}))}
                        style={{width:'100%',padding:'9px 12px',background:'#080d17',border:'1px solid #1a2535',borderRadius:8,color:'#fff',fontSize:13}}>
                        <option value="todo">To Do</option>
                        <option value="inprogress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    <div style={{display:'flex',gap:8,marginTop:16}}>
                      <button onClick={()=>{
                        if(editCard.id){setCards(prev=>prev.map(c=>c.id===editCard.id?{...c,...editCard}:c));}
                        else{setCards(prev=>[...prev,{...editCard,id:'c'+Date.now(),files:[],submittedAt:''}]);}
                        setEditCard(null);
                      }} style={{flex:1,padding:'10px',background:'#4ECDC4',border:'none',borderRadius:8,color:'#111',fontWeight:700,cursor:'pointer'}}>
                        {editCard.id?'Save':'Create'}
                      </button>
                      {editCard.id&&<button onClick={()=>{setCards(prev=>prev.filter(c=>c.id!==editCard.id));setEditCard(null);}}
                        style={{padding:'10px 14px',background:'rgba(255,107,107,.2)',border:'1px solid #FF6B6B',borderRadius:8,color:'#FF6B6B',fontWeight:700,cursor:'pointer'}}>
                        🗑️
                      </button>}
                      <button onClick={()=>setEditCard(null)} style={{flex:1,padding:'10px',background:'#1a2535',border:'none',borderRadius:8,color:'#fff',fontWeight:700,cursor:'pointer'}}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── WHEELS TAB ── */}
          {adminTab==='wheels'&&(
            <div style={{animation:'fd .25s ease',display:'flex',flexDirection:'column',gap:20}}>
              {[['Regular Wheel',regSegs,setRegSegs,'#4ECDC4'],['Elite Wheel',eliteSegs,setEliteSegs,'#FFE66D'],['Ultra Wheel (3 seg)',ultraSegs,setUltraSegs,'#FF8B94']].map(([title,segs,setSegs,accent])=>(
                <div key={title} style={{background:'rgba(255,255,255,.02)',border:'1px solid #1a2535',borderRadius:16,padding:16}}>
                  <h3 style={{margin:'0 0 14px',color:accent,fontSize:15}}>{title}</h3>
                  {segs.map((s,i)=>(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'12px 1fr 1fr 80px 80px 80px 80px',gap:8,alignItems:'center',marginBottom:10}}>
                      <div style={{width:12,height:12,borderRadius:3,background:s.color}}/>
                      <input value={s.label} onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,label:e.target.value}:x))}
                        placeholder="Label" style={{padding:'6px 8px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:12}}/>
                      <input value={s.val} onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,val:isNaN(e.target.value)?e.target.value:Number(e.target.value)}:x))}
                        placeholder="Value/Text" style={{padding:'6px 8px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:12}}/>
                      <input value={s.weight} type="number" min="1" onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,weight:Math.max(1,Number(e.target.value)||1)}:x))}
                        placeholder="Weight" style={{padding:'6px 8px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#FFE66D',fontSize:12,textAlign:'center'}}/>
                      <input value={s.color} onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,color:e.target.value}:x))}
                        type="color" style={{padding:2,background:'#080d17',border:'1px solid #1a2535',borderRadius:6,height:34,width:60,cursor:'pointer'}}/>
                      <input value={s.image||''} onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,image:e.target.value}:x))}
                        placeholder="Emoji" style={{padding:'6px 8px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:12}}/>
                      <select value={s.type} onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,type:e.target.value}:x))}
                        style={{padding:'6px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:11}}>
                        <option value="coins">Coins</option>
                        <option value="tickets">Tickets</option>
                        <option value="elite_ticket">Elite Tix</option>
                        <option value="jackpot">Jackpot</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  ))}
                  <div style={{fontSize:11,color:'#555',marginTop:4}}>Total weight: {segs.reduce((s,x)=>s+x.weight,0)} · Odds: {segs.map(s=>((s.weight/segs.reduce((t,x)=>t+x.weight,0))*100).toFixed(1)+'%').join(', ')}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── SHOP TAB ── */}
          {adminTab==='shop'&&(
            <div style={{animation:'fd .25s ease',display:'flex',flexDirection:'column',gap:16}}>
              <h2 style={{margin:0,fontSize:18,color:'#FFE66D'}}>🛍️ Shop Config</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[['Reset Time','resetTime','time'],['Min Price','priceMin','number'],['Max Price','priceMax','number']].map(([lbl,key,type])=>(
                  <div key={key}>
                    <div style={{fontSize:11,color:'#4ECDC4',fontWeight:700,marginBottom:4,textTransform:'uppercase'}}>{lbl}</div>
                    <input type={type} value={shop[key]||''} onChange={e=>setShop(p=>({...p,[key]:type==='number'?Number(e.target.value):e.target.value}))}
                      style={{width:'100%',padding:'9px 12px',background:'#080d17',border:'1px solid #1a2535',borderRadius:8,color:'#fff',fontSize:13}}/>
                  </div>
                ))}
              </div>
              <div style={{fontSize:13,color:'#888'}}>Current stock ({shopStock.length} items). Resets daily at {shop.resetTime}.</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {shopStock.map((item,i)=>(
                  <div key={i} style={{background:'rgba(255,255,255,.03)',border:'1px solid #1a2535',borderRadius:12,padding:12}}>
                    {item?(<>
                      <div style={{fontSize:20,marginBottom:4}}>{item.emoji||item.name?.slice(0,2)}</div>
                      <div style={{fontSize:12,fontWeight:700,color:RARITY[item.rarity]?.color||'#fff'}}>{item.name}</div>
                      <div style={{fontSize:10,color:'#555',marginBottom:6}}>{RARITY[item.rarity]?.label||''}</div>
                      <div style={{fontSize:13,color:'#FFE66D',fontWeight:700}}>{item.shopPrice} coins</div>
                    </>):<div style={{color:'#333',fontSize:12}}>Empty slot</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PLAYER TAB ── */}
          {adminTab==='player'&&(
            <div style={{animation:'fd .25s ease',display:'flex',flexDirection:'column',gap:16}}>
              <h2 style={{margin:0,fontSize:18,color:'#FFE66D'}}>👤 Player & Friend</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                {/* Player */}
                <div style={{background:'rgba(255,255,255,.02)',border:'1px solid #1a2535',borderRadius:16,padding:16}}>
                  <div style={{fontSize:14,fontWeight:700,color:'#4ECDC4',marginBottom:12}}>Player</div>
                  {[['Name','name'],['Coins','coins'],['Tickets','tickets'],['Elite Tickets','eliteTickets'],['Boards Done','boardsDone'],['Mine Level','mineLevel'],['Mine Wins','mineWins'],['Mine Losses','mineLosses']].map(([lbl,key])=>(
                    <div key={key} style={{marginBottom:8}}>
                      <div style={{fontSize:11,color:'#888',marginBottom:3}}>{lbl}</div>
                      <input value={player[key]||''} onChange={e=>setPlayer(p=>({...p,[key]:isNaN(e.target.value)||key==='name'?e.target.value:Number(e.target.value)}))}
                        style={{width:'100%',padding:'7px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:13}}/>
                    </div>
                  ))}
                </div>
                {/* Friend */}
                <div style={{background:'rgba(255,255,255,.02)',border:'1px solid #1a2535',borderRadius:16,padding:16}}>
                  <div style={{fontSize:14,fontWeight:700,color:'#FFE66D',marginBottom:12}}>Friend (NPC)</div>
                  {[['Name','name'],['Coins','coins'],['Tickets','tickets'],['Elite Tickets','eliteTickets'],['Mine Level','mineLevel'],['Mine Wins','mineWins']].map(([lbl,key])=>(
                    <div key={key} style={{marginBottom:8}}>
                      <div style={{fontSize:11,color:'#888',marginBottom:3}}>{lbl}</div>
                      <input value={friend[key]||''} onChange={e=>setFriend(p=>({...p,[key]:isNaN(e.target.value)||key==='name'?e.target.value:Number(e.target.value)}))}
                        style={{width:'100%',padding:'7px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:13}}/>
                    </div>
                  ))}
                  <div style={{fontSize:11,color:'#888',marginBottom:6,marginTop:12}}>Send Notification</div>
                  <GiftFriend friend={friend} setFriend={setFriend} player={player} setPlayer={setPlayer} toast={toast}/>
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {adminTab==='settings'&&(
            <div style={{animation:'fd .25s ease',display:'flex',flexDirection:'column',gap:16}}>
              <h2 style={{margin:0,fontSize:18,color:'#FFE66D'}}>⚙️ Settings</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  ['Admin Password','password','password'],
                  ['Board Name','boardName','text'],
                  ['On-time Tickets','onTimeTickets','number'],
                  ['Late Tickets (1d)','lateTickets','number'],
                  ['Very Late Tickets (2d+)','veryLateTickets','number'],
                  ['Minesweeper Coin Cost','minesweeperCost','number'],
                  ['Minesweeper Ticket Return','minesweeperReturn','number'],
                  ['Ultra Wheel Elite Ticket Cost','ultraWheelCost','number'],
                  ['Theme Unlock Cost','themeUnlockCost','number'],
                  ['Minesweeper Unlock Cost','mineUnlockCost','number'],
                  ['Ultra Wheel Unlock Cost','ultraUnlockCost','number'],
                ].map(([lbl,key,type])=>(
                  <div key={key}>
                    <div style={{fontSize:11,color:'#4ECDC4',fontWeight:700,marginBottom:4,textTransform:'uppercase'}}>{lbl}</div>
                    <input type={type} value={admin[key]||''} onChange={e=>setAdmin(p=>({...p,[key]:type==='number'?Number(e.target.value):e.target.value}))}
                      style={{width:'100%',padding:'9px 12px',background:'#080d17',border:'1px solid #1a2535',borderRadius:8,color:'#fff',fontSize:13}}/>
                  </div>
                ))}
                {['themeUnlockType','mineUnlockType','ultraUnlockType'].map(key=>(
                  <div key={key}>
                    <div style={{fontSize:11,color:'#4ECDC4',fontWeight:700,marginBottom:4,textTransform:'uppercase'}}>{key.replace('UnlockType',' Unlock Currency')}</div>
                    <select value={admin[key]||'tickets'} onChange={e=>setAdmin(p=>({...p,[key]:e.target.value}))}
                      style={{width:'100%',padding:'9px 12px',background:'#080d17',border:'1px solid #1a2535',borderRadius:8,color:'#fff',fontSize:13}}>
                      <option value="tickets">Tickets</option>
                      <option value="eliteTickets">Elite Tickets</option>
                      <option value="boardsDone">Boards Completed</option>
                    </select>
                  </div>
                ))}
              </div>
              <div style={{marginTop:8}}>
                <div style={{fontSize:13,fontWeight:700,color:'#FF6B6B',marginBottom:8}}>Danger Zone</div>
                <button onClick={()=>{if(window.confirm('Reset ALL player data?')){setPlayer(DEFAULT_STATE.player);}}}
                  style={{padding:'8px 16px',background:'rgba(255,107,107,.1)',border:'1px solid #FF6B6B',borderRadius:8,color:'#FF6B6B',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  🗑️ Reset Player Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // EMPLOYEE VIEW
  // ══════════════════════════════════════════════════════════════
  const unreadNotifs=(player.notifications||[]).filter(n=>!n.read).length;
  const friendUnread=(friend.messages||[]).filter(m=>!m.read).length;

  return(
    <div style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',paddingBottom:80,position:'relative'}}>
      <style>{`*{box-sizing:border-box}body{margin:0}input::placeholder{color:#333}input:focus,select:focus{outline:none;border-color:${T.accent}!important}.bh:hover:not(:disabled){opacity:.88;transform:translateY(-1px)}.ah:hover{opacity:.8}@keyframes pop{0%{opacity:0;transform:translateX(-50%) scale(.75)}100%{opacity:1;transform:translateX(-50%) scale(1)}}@keyframes slideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}@keyframes fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Toast popup */}
      {popup&&<div style={{position:'fixed',top:55,left:'50%',transform:'translateX(-50%)',background:'rgba(10,15,26,.97)',border:`2px solid ${T.accent}`,borderRadius:16,padding:'14px 28px',textAlign:'center',zIndex:9999,minWidth:200,boxShadow:`0 8px 40px ${T.accent}44`,animation:'pop .4s ease'}}>
        <div style={{fontSize:popup.big?48:36,marginBottom:4}}>{popup.emoji}</div>
        <div style={{fontSize:popup.big?20:16,fontWeight:800,color:T.secondary}}>{popup.label}</div>
      </div>}

      {/* Top bar */}
      <div style={{background:'rgba(0,0,0,.3)',backdropFilter:'blur(12px)',borderBottom:`1px solid ${T.border}`,padding:'10px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:50}}>
        <div style={{fontSize:18,fontWeight:800,color:T.accent}}>🎡 DevWheel</div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:13,color:T.secondary,fontWeight:700}}>{(player.coins||0).toLocaleString()} 💰</span>
          <span style={{fontSize:13,color:T.accent,fontWeight:700}}>🎫 {player.tickets||0}</span>
          <span style={{fontSize:13,color:'#FFE66D',fontWeight:700}}>⭐ {player.eliteTickets||0}</span>
          {unreadNotifs>0&&<div style={{width:8,height:8,borderRadius:'50%',background:'#FF6B6B'}}/>}
        </div>
      </div>

      {/* Main content */}
      <div style={{maxWidth:700,margin:'0 auto',padding:'16px 16px 0'}}>

        {/* ── WHEELS TAB ── */}
        {tab==='wheels'&&(
          <div style={{display:'flex',flexDirection:'column',gap:16,animation:'fd .25s ease'}}>
            {/* Regular Wheel */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:16,textAlign:'center'}}>
              <div style={{fontSize:13,fontWeight:700,color:T.accent,marginBottom:10}}>🎡 Regular Wheel · 🎫{player.tickets||0} tickets</div>
              <div style={{position:'relative',display:'inline-block'}}>
                <WheelSVG segs={regSegs} rot={regRot} spinning={regSpin} size={240}/>
                <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',fontSize:26,color:T.accent}}>▼</div>
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',margin:'10px 0'}}>
                {regSegs.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'#888'}}><div style={{width:8,height:8,borderRadius:2,background:s.color}}/>{s.image||s.label}</div>)}
              </div>
              <button onClick={()=>spinWheel('reg')} disabled={regSpin||(player.tickets||0)<1} className="bh"
                style={{padding:'11px 24px',background:regSpin||(player.tickets||0)<1?'#111':'linear-gradient(135deg,#FFE66D,#FF8B94)',border:'none',borderRadius:12,color:regSpin||(player.tickets||0)<1?'#444':'#111',fontSize:14,fontWeight:700,cursor:regSpin||(player.tickets||0)<1?'not-allowed':'pointer'}}>
                {regSpin?'🌀 Spinning…':'🎫 Use 1 Ticket → SPIN'}
              </button>
            </div>

            {/* Elite Wheel */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:16,textAlign:'center'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#FFE66D',marginBottom:10}}>⭐ Elite Wheel · ⭐{player.eliteTickets||0}</div>
              <div style={{position:'relative',display:'inline-block'}}>
                <WheelSVG segs={eliteSegs} rot={elRot} spinning={elSpin} size={240}/>
                <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',fontSize:26,color:'#FFE66D'}}>▼</div>
              </div>
              <button onClick={()=>spinWheel('elite')} disabled={elSpin||(player.eliteTickets||0)<1} className="bh"
                style={{padding:'11px 24px',background:elSpin||(player.eliteTickets||0)<1?'#111':'linear-gradient(135deg,#FFE66D,#FF6B6B)',border:'none',borderRadius:12,color:elSpin||(player.eliteTickets||0)<1?'#444':'#111',fontSize:14,fontWeight:700,cursor:elSpin||(player.eliteTickets||0)<1?'not-allowed':'pointer',marginTop:10}}>
                {elSpin?'🌀 Spinning…':'⭐ Use 1 Elite Ticket → SPIN'}
              </button>
            </div>

            {/* Ultra Wheel */}
            {unlocked.ultraWheel?(
              <div style={{background:'linear-gradient(135deg,rgba(255,107,107,.08),rgba(255,230,109,.05))',border:'1px solid #FF6B6B',borderRadius:20,padding:16,textAlign:'center'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#FF8B94',marginBottom:10}}>💎 Ultra Wheel · Costs {admin.ultraWheelCost||1}⭐</div>
                <div style={{position:'relative',display:'inline-block'}}>
                  <WheelSVG segs={ultraSegs} rot={ultraRot} spinning={ultraSpin} size={240}/>
                  <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',fontSize:26,color:'#FF8B94'}}>▼</div>
                </div>
                <button onClick={()=>spinWheel('ultra')} disabled={ultraSpin||(player.eliteTickets||0)<(admin.ultraWheelCost||1)} className="bh"
                  style={{padding:'11px 24px',background:ultraSpin||(player.eliteTickets||0)<(admin.ultraWheelCost||1)?'#111':'linear-gradient(135deg,#FF8B94,#FF6B6B)',border:'none',borderRadius:12,color:ultraSpin||(player.eliteTickets||0)<(admin.ultraWheelCost||1)?'#444':'#111',fontSize:14,fontWeight:700,cursor:ultraSpin||(player.eliteTickets||0)<(admin.ultraWheelCost||1)?'not-allowed':'pointer',marginTop:10}}>
                  {ultraSpin?'🌀 Spinning…':'💎 ULTRA SPIN'}
                </button>
              </div>
            ):(
              <div style={{background:T.card,border:`2px dashed ${T.border}`,borderRadius:20,padding:20,textAlign:'center',cursor:'pointer'}} onClick={()=>tryUnlock('ultraWheel')}>
                <div style={{fontSize:28,marginBottom:6}}>🔒</div>
                <div style={{fontSize:14,fontWeight:700,color:'#555'}}>Ultra Wheel</div>
                <div style={{fontSize:12,color:'#444',marginTop:4}}>Requires {admin.ultraUnlockCost} {admin.ultraUnlockType} · Tap to unlock</div>
              </div>
            )}
          </div>
        )}

        {/* ── KANBAN TAB ── */}
        {tab==='kanban'&&(
          <div style={{animation:'fd .25s ease'}}>
            <h2 style={{fontSize:18,margin:'0 0 16px',color:T.accent}}>{admin.boardName||'Dev Board'}</h2>
            {/* Submit code for active card */}
            <KanbanEmployee cards={cards} setCards={setCards} player={player} moveCard={moveCard} kbSkin={kbSkin} T={T}/>
          </div>
        )}

        {/* ── SHOP TAB ── */}
        {tab==='shop'&&(
          <div style={{animation:'fd .25s ease'}}>
            <h2 style={{fontSize:18,margin:'0 0 4px',color:T.accent}}>🛍️ Shop</h2>
            <p style={{fontSize:12,color:'#555',margin:'0 0 16px'}}>Resets daily at {shop.resetTime} · {shopStock.filter(Boolean).length} items available</p>
            {unlocked.themes?(
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
                {shopStock.map((item,i)=>{
                  if(!item)return<div key={i} style={{background:T.card,border:`1px dashed ${T.border}`,borderRadius:12,padding:16,textAlign:'center',minHeight:100}}><div style={{color:'#333',fontSize:12,marginTop:20}}>—</div></div>;
                  const owned=player.ownedItems?.includes(item.id);
                  const rarityColor=RARITY[item.rarity]?.color||'#fff';
                  return(
                    <div key={i} style={{background:T.card,border:`1px solid ${owned?'#555':T.border}`,borderRadius:12,padding:14,textAlign:'center',opacity:owned?.7:1}}>
                      <div style={{fontSize:26,marginBottom:6}}>{item.emoji||'🎁'}</div>
                      <div style={{fontSize:13,fontWeight:700,color:rarityColor,marginBottom:2}}>{item.name}</div>
                      <div style={{fontSize:10,color:'#555',marginBottom:8}}>{RARITY[item.rarity]?.label}</div>
                      <button onClick={()=>buyShopItem(item)} disabled={owned||(player.coins||0)<item.shopPrice}
                        style={{padding:'7px 16px',background:owned?'#1a2535':(player.coins||0)>=item.shopPrice?`linear-gradient(135deg,${T.accent},${T.secondary})`:'#111',border:'none',borderRadius:8,color:owned?'#555':(player.coins||0)>=item.shopPrice?'#111':'#444',fontSize:12,fontWeight:700,cursor:owned||((player.coins||0)<item.shopPrice)?'not-allowed':'pointer'}}>
                        {owned?'Owned':item.shopPrice+' 💰'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ):(
              <div style={{textAlign:'center',padding:40,cursor:'pointer'}} onClick={()=>tryUnlock('themes')}>
                <div style={{fontSize:40,marginBottom:8}}>🔒</div>
                <div style={{fontSize:16,fontWeight:700,color:'#555'}}>Shop Locked</div>
                <div style={{fontSize:13,color:'#444',marginTop:6}}>Requires {admin.themeUnlockCost} {admin.themeUnlockType}</div>
              </div>
            )}
          </div>
        )}

        {/* ── MINESWEEPER TAB ── */}
        {tab==='minesweeper'&&(
          <div style={{animation:'fd .25s ease'}}>
            {unlocked.minesweeper?(
              <Minesweeper player={player} setPlayer={setPlayer} skin={player.equippedMsSkin||'ms_classic'} adminCfg={admin} theme={T} toast={toast}/>
            ):(
              <div style={{textAlign:'center',padding:60,cursor:'pointer'}} onClick={()=>tryUnlock('minesweeper')}>
                <div style={{fontSize:48,marginBottom:12}}>🔒💣</div>
                <div style={{fontSize:18,fontWeight:700}}>Minesweeper Locked</div>
                <div style={{fontSize:13,color:'#555',marginTop:8}}>Requires {admin.mineUnlockCost} {admin.mineUnlockType} · Tap to unlock</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Overlay */}
      {profileOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'flex-end'}} onClick={e=>{if(e.target===e.currentTarget)setProfileOpen(false);}}>
          <div style={{width:'100%',maxWidth:700,margin:'0 auto',background:'linear-gradient(180deg,rgba(10,15,26,.98),rgba(5,8,16,.99))',border:`1px solid ${T.border}`,borderTopLeftRadius:24,borderTopRightRadius:24,padding:20,maxHeight:'80vh',overflowY:'auto',animation:'slideIn .3s ease'}}>
            <div style={{display:'flex',gap:10,marginBottom:16}}>
              {['avatar','stats','leaderboard'].map(t=>(
                <button key={t} onClick={()=>setProfileTab(t)} style={{padding:'7px 14px',background:profileTab===t?T.accent:'transparent',border:`1px solid ${profileTab===t?T.accent:T.border}`,borderRadius:20,color:profileTab===t?'#111':T.accent,fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  {t==='avatar'?'👤 Avatar':t==='stats'?'📊 Stats':'🏆 Leaderboard'}
                </button>
              ))}
            </div>

            {profileTab==='avatar'&&(
              <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                  <Avatar player={player} size={100}/>
                  <div style={{fontSize:13,fontWeight:700,color:T.accent}}>{player.name}</div>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap',justifyContent:'center'}}>
                    {['#FDBCB4','#F5CBA7','#D4A574','#A0522D','#5C3317','#FFE4E1','#FFC0CB'].map(c=>(
                      <div key={c} onClick={()=>setPlayer(p=>({...p,skinColor:c}))} style={{width:20,height:20,borderRadius:'50%',background:c,cursor:'pointer',border:player.skinColor===c?'2px solid #fff':'2px solid transparent'}}/>
                    ))}
                  </div>
                </div>
                <div style={{flex:1,minWidth:200,display:'flex',flexDirection:'column',gap:12}}>
                  {[['🎩 Hat','hats','equippedHat'],['👕 Shirt','clothes','equippedShirt'],['👖 Pants','pants','equippedPants']].map(([lbl,cat,key])=>(
                    <div key={key}>
                      <div style={{fontSize:11,color:T.accent,fontWeight:700,textTransform:'uppercase',marginBottom:6}}>{lbl}</div>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        {AVATAR_ITEMS[cat].filter(i=>player.ownedItems?.includes(i.id)||i.cost===0).map(item=>(
                          <div key={item.id} onClick={()=>setPlayer(p=>({...p,[key]:item.id}))}
                            style={{padding:'4px 8px',background:player[key]===item.id?T.accent:'rgba(255,255,255,.05)',border:`1px solid ${player[key]===item.id?T.accent:T.border}`,borderRadius:8,fontSize:12,cursor:'pointer',color:player[key]===item.id?'#111':T.text}}>
                            {item.emoji||'∅'} {item.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileTab==='stats'&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[['Coins',player.coins?.toLocaleString(),'💰'],['Tickets',player.tickets,'🎫'],['Elite Tickets',player.eliteTickets,'⭐'],['Boards Done',player.boardsDone,'📋'],['Mine Level',player.mineLevel,'🎮'],['Mine Wins',player.mineWins,'🏆'],['Mine Losses',player.mineLosses,'💥'],['W/L Ratio',player.mineLosses?((player.mineWins||0)/(player.mineLosses||1)).toFixed(2):'∞','📊']].map(([lbl,val,ico])=>(
                  <div key={lbl} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:12,textAlign:'center'}}>
                    <div style={{fontSize:20,marginBottom:4}}>{ico}</div>
                    <div style={{fontSize:20,fontWeight:800,color:T.accent}}>{val||0}</div>
                    <div style={{fontSize:11,color:'#555'}}>{lbl}</div>
                  </div>
                ))}
              </div>
            )}

            {profileTab==='leaderboard'&&(
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[{name:player.name,coins:player.coins,tickets:player.tickets,eliteTickets:player.eliteTickets,isPlayer:true},{name:friend.name,coins:friend.coins,tickets:friend.tickets,eliteTickets:friend.eliteTickets}].sort((a,b)=>(b.coins||0)-(a.coins||0)).map((p,i)=>(
                  <div key={i} style={{display:'flex',gap:12,alignItems:'center',padding:'12px 16px',background:T.card,border:`1px solid ${p.isPlayer?T.accent:T.border}`,borderRadius:12}}>
                    <span style={{fontSize:20}}>{i===0?'🥇':'🥈'}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700}}>{p.name}{p.isPlayer&&' (You)'}</div>
                      <div style={{fontSize:11,color:'#555'}}>🎫{p.tickets||0} · ⭐{p.eliteTickets||0}</div>
                    </div>
                    <div style={{fontSize:18,fontWeight:800,color:T.secondary}}>{(p.coins||0).toLocaleString()} 💰</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friend Overlay */}
      {friendOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'flex-end'}} onClick={e=>{if(e.target===e.currentTarget)setFriendOpen(false);}}>
          <div style={{width:'100%',maxWidth:700,margin:'0 auto',background:'rgba(10,15,26,.98)',border:`1px solid ${T.border}`,borderTopLeftRadius:24,borderTopRightRadius:24,padding:20,maxHeight:'70vh',overflowY:'auto',animation:'slideIn .3s ease'}}>
            <h3 style={{margin:'0 0 16px',color:T.accent}}>👫 {friend.name||'Friend'}</h3>
            <div style={{display:'flex',gap:10,marginBottom:16}}>
              <div style={{flex:1,background:T.card,borderRadius:10,padding:10,textAlign:'center'}}>
                <div style={{fontSize:18,fontWeight:800,color:T.secondary}}>{(friend.coins||0).toLocaleString()}</div>
                <div style={{fontSize:11,color:'#555'}}>💰 Coins</div>
              </div>
              <div style={{flex:1,background:T.card,borderRadius:10,padding:10,textAlign:'center'}}>
                <div style={{fontSize:18,fontWeight:800,color:T.accent}}>{friend.tickets||0}</div>
                <div style={{fontSize:11,color:'#555'}}>🎫 Tickets</div>
              </div>
              <div style={{flex:1,background:T.card,borderRadius:10,padding:10,textAlign:'center'}}>
                <div style={{fontSize:18,fontWeight:800,color:'#FFE66D'}}>{friend.eliteTickets||0}</div>
                <div style={{fontSize:11,color:'#555'}}>⭐ Elite</div>
              </div>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:T.accent,marginBottom:8}}>Messages</div>
            {(friend.messages||[]).length===0&&<div style={{color:'#444',fontSize:13}}>No messages yet.</div>}
            {(friend.messages||[]).map((msg,i)=>(
              <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:10,marginBottom:8,fontSize:13}}>
                <div style={{color:T.secondary,fontWeight:600}}>{msg.text}</div>
                <div style={{color:'#444',fontSize:11,marginTop:3}}>{new Date(msg.date).toLocaleString()}</div>
              </div>
            ))}
            <button onClick={()=>{setPlayer(p=>({...p,notifications:(p.notifications||[]).map(n=>({...n,read:true}))}));setFriend(f=>({...f,messages:(f.messages||[]).map(m=>({...m,read:true}))}));setFriendOpen(false);}}
              style={{width:'100%',padding:'10px',background:'#1a2535',border:'none',borderRadius:10,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',marginTop:8}}>
              ✓ Mark All Read & Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(5,8,16,.95)',backdropFilter:'blur(16px)',borderTop:`1px solid ${T.border}`,padding:'8px 0 12px',display:'flex',justifyContent:'space-around',alignItems:'center',zIndex:100}}>
        {[['wheels','🎡','Wheels'],['kanban','📋','Tasks'],['shop','🛍️','Shop'],['minesweeper','💣','Mine']].map(([t,ico,lbl])=>(
          <button key={t} onClick={()=>setTab(t)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,background:'none',border:'none',color:tab===t?T.accent:'#555',cursor:'pointer',padding:'4px 12px',transition:'color .2s'}}>
            <span style={{fontSize:22}}>{ico}</span>
            <span style={{fontSize:10,fontWeight:700}}>{lbl}</span>
          </button>
        ))}
        {/* Profile button bottom-left style */}
        <button onClick={()=>{setProfileOpen(true);setFriendOpen(false);}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,background:'none',border:'none',color:'#555',cursor:'pointer',padding:'4px 12px'}}>
          <span style={{fontSize:22}}>👤</span>
          <span style={{fontSize:10,fontWeight:700}}>Profile</span>
        </button>
        {/* Friend button */}
        <div style={{position:'relative'}}>
          <button onClick={()=>{setFriendOpen(true);setProfileOpen(false);}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,background:'none',border:'none',color:'#555',cursor:'pointer',padding:'4px 12px'}}>
            <span style={{fontSize:22}}>👫</span>
            <span style={{fontSize:10,fontWeight:700}}>Friends</span>
          </button>
          {friendUnread>0&&<div style={{position:'absolute',top:2,right:10,width:10,height:10,borderRadius:'50%',background:'#FF6B6B'}}/>}
        </div>
      </div>
    </div>
  );
}

// ─── KANBAN EMPLOYEE VIEW (read-only + file upload) ───────────────────────────
function KanbanEmployee({cards,setCards,player,moveCard,kbSkin,T}){
  const fileRef=useRef({});
  const uploadFile=(cardId,file)=>{
    if(!file)return;
    const allowed=['.js','.py','.html','.css','.ts','.tsx','.jsx','.json','.md','.txt','.sh','.sql'];
    if(!allowed.some(ext=>file.name.endsWith(ext))){alert('Only code files allowed (.js .py .html .css .ts .tsx .jsx .json .md .txt .sh .sql)');return;}
    const reader=new FileReader();
    reader.onload=e=>{
      const dataUrl=e.target.result;
      setCards(prev=>prev.map(c=>c.id===cardId?{...c,files:[...(c.files||[]),{name:file.name,dataUrl,size:file.size,uploadedAt:new Date().toISOString()}]}:c));
    };
    reader.readAsDataURL(file);
  };

  return(
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
      {['todo','inprogress','done'].map(listId=>(
        <div key={listId} style={{background:'rgba(255,255,255,.02)',border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden'}}>
          <div style={{height:50,background:kbSkin.banner||'#1a2535',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            {kbSkin.emoji&&<span style={{fontSize:16,opacity:.7}}>{kbSkin.emoji}</span>}
            <span style={{fontSize:12,fontWeight:700,color:'#fff',textTransform:'uppercase',letterSpacing:1}}>
              {listId==='todo'?'📝 To Do':listId==='inprogress'?'🔄 In Progress':'✅ Done'}
            </span>
          </div>
          <div style={{padding:10,display:'flex',flexDirection:'column',gap:8,minHeight:200}}>
            {cards.filter(c=>c.list===listId).map(card=>{
              const due=card.dueDate?new Date(card.dueDate):null;
              const now=new Date();
              const isLate=due&&now>due&&listId!=='done';
              return(
                <div key={card.id} style={{background:T.card,border:`1px solid ${isLate?'#FF6B6B':T.border}`,borderRadius:10,padding:10,boxShadow:'3px 3px 0 rgba(0,0,0,.3)'}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{card.image&&<span style={{marginRight:4}}>{card.image}</span>}{card.title}</div>
                  {card.desc&&<div style={{fontSize:11,color:'#888',marginBottom:6}}>{card.desc}</div>}
                  {due&&<div style={{fontSize:10,color:isLate?'#FF6B6B':'#4ECDC4',marginBottom:6}}>📅 Due: {due.toLocaleDateString()}{isLate?' (Late!)':''}</div>}
                  {/* File upload for inprogress cards */}
                  {listId==='inprogress'&&(
                    <div style={{marginTop:6}}>
                      <input ref={el=>fileRef.current[card.id]=el} type="file" style={{display:'none'}} accept=".js,.py,.html,.css,.ts,.tsx,.jsx,.json,.md,.txt,.sh,.sql"
                        onChange={e=>{if(e.target.files[0])uploadFile(card.id,e.target.files[0]);}}/>
                      <button onClick={()=>fileRef.current[card.id]?.click()}
                        style={{padding:'5px 10px',background:'rgba(78,205,196,.1)',border:'1px dashed #4ECDC4',borderRadius:6,color:'#4ECDC4',fontSize:11,fontWeight:700,cursor:'pointer',width:'100%',marginBottom:4}}>
                        📎 Submit Code File
                      </button>
                      {card.files?.length>0&&card.files.map((f,fi)=>(
                        <div key={fi} style={{fontSize:10,color:'#888',marginTop:2}}>✅ {f.name}</div>
                      ))}
                      {card.files?.length>0&&(
                        <button onClick={()=>moveCard(card.id,'done')}
                          style={{padding:'5px 10px',background:'linear-gradient(135deg,#4ECDC4,#44A08D)',border:'none',borderRadius:6,color:'#111',fontSize:11,fontWeight:700,cursor:'pointer',width:'100%',marginTop:4}}>
                          ✅ Submit & Move to Done
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── GIFT FRIEND PANEL (admin) ────────────────────────────────────────────────
function GiftFriend({friend,setFriend,player,setPlayer,toast}){
  const [giftType,setGiftType]=useState('coins');
  const [giftAmt,setGiftAmt]=useState('100');
  const [msg,setMsg]=useState('');

  const send=()=>{
    const amt=Number(giftAmt)||0;
    const now=new Date().toISOString();
    let text=msg||`${friend.name} received a gift!`;
    if(giftType==='coins'){setFriend(f=>({...f,coins:(f.coins||0)+amt}));if(!msg)text=`${friend.name} received ${amt} coins!`;}
    if(giftType==='tickets'){setFriend(f=>({...f,tickets:(f.tickets||0)+amt}));if(!msg)text=`${friend.name} received ${amt} tickets!`;}
    if(giftType==='eliteTickets'){setFriend(f=>({...f,eliteTickets:(f.eliteTickets||0)+amt}));if(!msg)text=`${friend.name} received ${amt} elite tickets!`;}
    setFriend(f=>({...f,messages:[{text,date:now,read:false},...(f.messages||[])].slice(0,50)}));
    setPlayer(p=>({...p,notifications:[{text,date:now,read:false},...(p.notifications||[])].slice(0,50)}));
    toast(`Sent to ${friend.name}!`,'📨');
    setMsg('');
  };

  return(
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <select value={giftType} onChange={e=>setGiftType(e.target.value)} style={{padding:'7px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:13}}>
        <option value="coins">Coins</option>
        <option value="tickets">Tickets</option>
        <option value="eliteTickets">Elite Tickets</option>
      </select>
      <input type="number" value={giftAmt} onChange={e=>setGiftAmt(e.target.value)} placeholder="Amount"
        style={{padding:'7px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:13}}/>
      <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Custom message (optional)"
        style={{padding:'7px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:13}}/>
      <button onClick={send} style={{padding:'8px',background:'linear-gradient(135deg,#FFE66D,#FF8B94)',border:'none',borderRadius:6,color:'#111',fontWeight:700,fontSize:13,cursor:'pointer'}}>
        📨 Send Gift
      </button>
    </div>
  );
}
