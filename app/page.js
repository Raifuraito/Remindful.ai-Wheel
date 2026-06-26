'use client';
import React, { useState, useEffect, useRef } from 'react';

// ── Storage ───────────────────────────────────────────────────────────────────
// Storage: tries Claude artifact storage first, falls back to localStorage (works on Vercel)
const hasArtifactStorage = () => typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function';
const db = {
  get: async (k,d) => {
    if(hasArtifactStorage()){ try { const r=await window.storage.get(k); return r?JSON.parse(r.value):d; } catch {} }
    try { const v=localStorage.getItem(k); return v?JSON.parse(v):d; } catch { return d; }
  },
  set: async (k,v) => {
    const s=JSON.stringify(v);
    if(hasArtifactStorage()){ try { await window.storage.set(k,s); } catch {} }
    try { localStorage.setItem(k,s); } catch {}
  },
  getImg: async (id) => {
    if(hasArtifactStorage()){ try { const r=await window.storage.get(`img-${id}`); if(r?.value)return r.value; } catch {} }
    try { return localStorage.getItem(`img-${id}`)||''; } catch { return ''; }
  },
  setImg: async (id,url) => {
    if(hasArtifactStorage()){ try { await window.storage.set(`img-${id}`,url); } catch {} }
    try { localStorage.setItem(`img-${id}`,url); } catch {}
  },
};

// ── Themes ────────────────────────────────────────────────────────────────────
const THEMES = {
  midnight:{ id:'midnight',name:'Midnight',bg:'linear-gradient(160deg,#050810,#0a0f1a)',accent:'#4ECDC4',secondary:'#FFE66D',card:'rgba(255,255,255,.03)',border:'#1a2535',text:'#fff' },
  crimson: { id:'crimson', name:'Crimson', bg:'linear-gradient(160deg,#1a0505,#2a0a0a)',accent:'#FF6B6B',secondary:'#FFE66D',card:'rgba(255,100,100,.05)',border:'#3a1515',text:'#fff' },
  forest:  { id:'forest',  name:'Forest',  bg:'linear-gradient(160deg,#051a0a,#0a2010)',accent:'#4CAF50',secondary:'#8BC34A',card:'rgba(76,175,80,.05)',border:'#1a3520',text:'#fff' },
  gold:    { id:'gold',    name:'Gold',    bg:'linear-gradient(160deg,#1a1500,#2a2000)',accent:'#FFD700',secondary:'#FFA500',card:'rgba(255,215,0,.05)',border:'#3a3000',text:'#fff' },
  ocean:   { id:'ocean',   name:'Ocean',   bg:'linear-gradient(160deg,#051020,#0a1830)',accent:'#00BCD4',secondary:'#4FC3F7',card:'rgba(0,188,212,.05)',border:'#0a2035',text:'#fff' },
  aurora:  { id:'aurora',  name:'Aurora',  bg:'linear-gradient(160deg,#0d0520,#150a2a)',accent:'#9C27B0',secondary:'#E91E63',card:'rgba(156,39,176,.05)',border:'#2a1535',text:'#fff' },
};

// ── Layer positions on the 120×120 avatar SVG ─────────────────────────────────
const LAYERS = {
  hat:   { x:22, y:3,  w:76, h:42 },
  shirt: { x:32, y:54, w:56, h:34 },
  pants: { x:26, y:78, w:68, h:38 },
};

// ── Base items catalogue ──────────────────────────────────────────────────────
const BASE_ITEMS = [
  // ── Hats
  { id:'hat_none',   name:'No Hat',      type:'hat',   rarity:'common',    cost:0,   emoji:'',    imageUrl:'' },
  { id:'hat_cap_r',  name:'Red Cap',     type:'hat',   rarity:'common',    cost:80,  emoji:'🧢',  imageUrl:'' },
  { id:'hat_cap_b',  name:'Blue Cap',    type:'hat',   rarity:'common',    cost:80,  emoji:'🧢',  imageUrl:'' },
  { id:'hat_crown',  name:'Crown',       type:'hat',   rarity:'rare',      cost:200, emoji:'👑',  imageUrl:'' },
  { id:'hat_tophat', name:'Top Hat',     type:'hat',   rarity:'common',    cost:150, emoji:'🎩',  imageUrl:'' },
  { id:'hat_party',  name:'Party Hat',   type:'hat',   rarity:'common',    cost:100, emoji:'🎉',  imageUrl:'' },
  { id:'hat_dino',   name:'Dino Spike',  type:'hat',   rarity:'rare',      cost:300, emoji:'🦕',  imageUrl:'', theme:'dino' },
  { id:'hat_astro',  name:'Astronaut',   type:'hat',   rarity:'rare',      cost:300, emoji:'👨‍🚀', imageUrl:'', theme:'space' },
  { id:'hat_shell',  name:'Sea Shell',   type:'hat',   rarity:'rare',      cost:300, emoji:'🐚',  imageUrl:'', theme:'ocean' },
  // ── Shirts
  { id:'shirt_none', name:'No Shirt',    type:'shirt', rarity:'common',    cost:0,   emoji:'',    imageUrl:'' },
  { id:'shirt_r',    name:'Red Tee',     type:'shirt', rarity:'common',    cost:80,  emoji:'👕',  imageUrl:'' },
  { id:'shirt_b',    name:'Blue Tee',    type:'shirt', rarity:'common',    cost:80,  emoji:'👕',  imageUrl:'' },
  { id:'shirt_hood', name:'Hoodie',      type:'shirt', rarity:'common',    cost:120, emoji:'🧥',  imageUrl:'' },
  { id:'shirt_suit', name:'Suit',        type:'shirt', rarity:'common',    cost:200, emoji:'👔',  imageUrl:'' },
  { id:'shirt_dino', name:'Dino Jacket', type:'shirt', rarity:'rare',      cost:300, emoji:'🦎',  imageUrl:'', theme:'dino' },
  { id:'shirt_space','name':'Space Suit', type:'shirt', rarity:'rare',      cost:300, emoji:'🚀',  imageUrl:'', theme:'space' },
  { id:'shirt_dive', name:'Dive Suit',   type:'shirt', rarity:'rare',      cost:300, emoji:'🤿',  imageUrl:'', theme:'ocean' },
  // ── Pants
  { id:'pants_none', name:'No Pants',    type:'pants', rarity:'common',    cost:0,   emoji:'',    imageUrl:'' },
  { id:'pants_r',    name:'Red Shorts',  type:'pants', rarity:'common',    cost:80,  emoji:'🩳',  imageUrl:'' },
  { id:'pants_b',    name:'Blue Jeans',  type:'pants', rarity:'common',    cost:80,  emoji:'👖',  imageUrl:'' },
  { id:'pants_jog',  name:'Joggers',     type:'pants', rarity:'common',    cost:100, emoji:'🩳',  imageUrl:'' },
  { id:'pants_dino', name:'Dino Tail',   type:'pants', rarity:'rare',      cost:300, emoji:'🦕',  imageUrl:'', theme:'dino' },
  { id:'pants_space','name':'Space Boots',type:'pants', rarity:'rare',     cost:300, emoji:'👩‍🚀', imageUrl:'', theme:'space' },
  { id:'pants_fins', name:'Fins',        type:'pants', rarity:'rare',      cost:300, emoji:'🐟',  imageUrl:'', theme:'ocean' },
  // ── Kanban skins
  { id:'kb_plain',   name:'Plain',       type:'kbskin',rarity:'common',    cost:0,   emoji:'',    imageUrl:'', banner:'#1a2535' },
  { id:'kb_leaves',  name:'Leafy Dreams',type:'kbskin',rarity:'common',    cost:100, emoji:'🌿',  imageUrl:'', banner:'linear-gradient(135deg,#2d5a27,#4a7c59)' },
  { id:'kb_teddy',   name:'Teddy Town',  type:'kbskin',rarity:'common',    cost:100, emoji:'🧸',  imageUrl:'', banner:'linear-gradient(135deg,#8B6914,#c4973a)' },
  { id:'kb_flowers', name:'Bloom',       type:'kbskin',rarity:'common',    cost:100, emoji:'🌸',  imageUrl:'', banner:'linear-gradient(135deg,#c2185b,#f06292)' },
  { id:'kb_birds',   name:'Little Birbs',type:'kbskin',rarity:'common',    cost:100, emoji:'🐦',  imageUrl:'', banner:'linear-gradient(135deg,#0288d1,#4fc3f7)' },
  { id:'kb_dino',    name:'Dino World',  type:'kbskin',rarity:'epic',      cost:500, emoji:'🦕',  imageUrl:'', banner:'linear-gradient(135deg,#2e7d32,#66bb6a)', theme:'dino' },
  { id:'kb_space',   name:'Cosmic Board',type:'kbskin',rarity:'epic',      cost:500, emoji:'🌌',  imageUrl:'', banner:'linear-gradient(135deg,#1a237e,#7c4dff)', theme:'space' },
  { id:'kb_ocean',   name:'Deep Blue',   type:'kbskin',rarity:'epic',      cost:500, emoji:'🌊',  imageUrl:'', banner:'linear-gradient(135deg,#006064,#00bcd4)', theme:'ocean' },
  // ── Mine skins
  { id:'ms_classic', name:'Classic',     type:'msskin',rarity:'common',    cost:0,   emoji:'',    imageUrl:'', flag:'🚩', bomb:'💣' },
  { id:'ms_flower',  name:'Flower Sweep',type:'msskin',rarity:'common',    cost:150, emoji:'🌸',  imageUrl:'', flag:'🌸', bomb:'🌵' },
  { id:'ms_fruit',   name:'Fruity',      type:'msskin',rarity:'common',    cost:150, emoji:'🍓',  imageUrl:'', flag:'🍓', bomb:'💥' },
  { id:'ms_dino',    name:'Dino Sweep',  type:'msskin',rarity:'legendary', cost:800, emoji:'🦕',  imageUrl:'', flag:'🦕', bomb:'🥚',  theme:'dino' },
  { id:'ms_space',   name:'Space Sweep', type:'msskin',rarity:'legendary', cost:800, emoji:'🛸',  imageUrl:'', flag:'🛸', bomb:'☄️',  theme:'space' },
  { id:'ms_ocean',   name:'Ocean Sweep', type:'msskin',rarity:'legendary', cost:800, emoji:'🐠',  imageUrl:'', flag:'🐠', bomb:'🦑',  theme:'ocean' },
];

const RARITY = {
  common:    { color:'#e0e0e0', label:'Common',    weight:60 },
  rare:      { color:'#4fc3f7', label:'Rare',      weight:25 },
  epic:      { color:'#ce93d8', label:'Epic',      weight:10 },
  legendary: { color:'#ffb74d', label:'Legendary', weight:5  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function pickWeighted(segs){ const t=segs.reduce((s,x)=>s+x.weight,0);let r=Math.random()*t;for(let i=0;i<segs.length;i++){r-=segs[i].weight;if(r<=0)return i;}return segs.length-1; }
function calcRot(c,i,n){ const sa=360/n,sc=i*sa+sa/2,base=(270-sc+720)%360,mod=((c%360)+360)%360;let d=base-mod;if(d<0)d+=360;if(d<30)d+=360;return c+d+6*360; }

// ── WheelSVG ──────────────────────────────────────────────────────────────────
function WheelSVG({segs,rot,spinning,size=260}){
  const N=segs.length,cx=size/2,cy=size/2,r=size*0.4,tr=size*0.27,rad=d=>d*Math.PI/180;
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{filter:'drop-shadow(0 0 16px rgba(78,205,196,.25))',transform:`rotate(${rot}deg)`,transition:spinning?'transform 3.5s cubic-bezier(0.17,0.67,0.12,0.99)':'none',userSelect:'none'}}>
      {segs.map((s,i)=>{
        const a0=(i/N)*360,a1=((i+1)/N)*360;
        const x1=cx+r*Math.cos(rad(a0)),y1=cy+r*Math.sin(rad(a0));
        const x2=cx+r*Math.cos(rad(a1)),y2=cy+r*Math.sin(rad(a1));
        const mx=(a0+a1)/2,tx=cx+tr*Math.cos(rad(mx)),ty=cy+tr*Math.sin(rad(mx));
        const hasImg=s.imageUrl&&s.imageUrl.length>0;
        const lp=LAYERS.hat; // reuse sizing
        const iw=size*0.12,ih=size*0.12;
        return(<g key={i}>
          <path d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}Z`} fill={s.color} stroke="#080e18" strokeWidth="2"/>
          {hasImg
            ?<image href={s.imageUrl} x={tx-iw/2} y={ty-ih/2} width={iw} height={ih} preserveAspectRatio="xMidYMid meet" transform={`rotate(${mx+90} ${tx} ${ty})`}/>
            :<text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                style={{fontSize:s.emoji?size*0.08:size<200?8:10,fontWeight:'bold',fill:'#111',pointerEvents:'none'}}
                transform={`rotate(${mx+90} ${tx} ${ty})`}>{s.emoji||( s.label.length>8?s.label.slice(0,7)+'…':s.label)}</text>
          }
        </g>);
      })}
      <circle cx={cx} cy={cy} r={size*0.1} fill="#080e18" stroke="#fff" strokeWidth="2.5"/>
      <text x={cx} y={cy+2} textAnchor="middle" dominantBaseline="middle" style={{fontSize:size*0.07,pointerEvents:'none'}}>💰</text>
    </svg>
  );
}

// ── Avatar (layered image rendering) ─────────────────────────────────────────
function Avatar({player,items,size=120,onClickPart}){
  const sc=player.skinColor||'#FDBCB4';
  const s=size/120;
  const getItem=(id)=>items.find(x=>x.id===id)||{};
  const hat=getItem(player.equippedHat||'hat_none');
  const shirt=getItem(player.equippedShirt||'shirt_none');
  const pants=getItem(player.equippedPants||'pants_none');

  const renderLayer=(item,layerKey,clickKey)=>{
    if(!item||item.id?.endsWith('_none'))return null;
    const lp=LAYERS[layerKey];
    const sx=lp.x*(size/120),sy=lp.y*(size/120),sw=lp.w*(size/120),sh=lp.h*(size/120);
    const hasImg=item.imageUrl&&item.imageUrl.length>10;
    return(
      <g key={layerKey} onClick={()=>onClickPart&&onClickPart(layerKey)} style={{cursor:onClickPart?'pointer':'default'}}>
        {hasImg
          ?<image href={item.imageUrl} x={sx} y={sy} width={sw} height={sh} preserveAspectRatio="xMidYMid meet"/>
          :<text x={sx+sw/2} y={sy+sh/2} textAnchor="middle" dominantBaseline="middle"
              style={{fontSize:size*0.19,pointerEvents:'none'}}>{item.emoji}</text>
        }
      </g>
    );
  };

  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{overflow:'visible'}}>
      {/* Shadow */}
      <ellipse cx="60" cy="115" rx="25" ry="5" fill="rgba(0,0,0,.25)" transform={`scale(${s})`}/>
      {/* Legs */}
      <line x1="50" y1="85" x2="40" y2="110" stroke={pants.imageUrl||pants.emoji?'#555':'#888'} strokeWidth={7*s} strokeLinecap="round"/>
      <line x1="70" y1="85" x2="80" y2="110" stroke={pants.imageUrl||pants.emoji?'#555':'#888'} strokeWidth={7*s} strokeLinecap="round"/>
      {/* Pants layer (before body so body renders on top) */}
      {renderLayer(pants,'pants','pants')}
      {/* Body */}
      <rect x={42*s} y={60*s} width={36*s} height={28*s} rx={8*s} fill={shirt.imageUrl||shirt.emoji?'rgba(0,0,0,.1)':'#4ECDC4'}/>
      {/* Shirt layer */}
      {renderLayer(shirt,'shirt','shirt')}
      {/* Arms */}
      <line x1={42*s} y1={68*s} x2={28*s} y2={82*s} stroke={sc} strokeWidth={7*s} strokeLinecap="round"/>
      <line x1={78*s} y1={68*s} x2={92*s} y2={82*s} stroke={sc} strokeWidth={7*s} strokeLinecap="round"/>
      {/* Neck */}
      <line x1={60*s} y1={60*s} x2={60*s} y2={50*s} stroke={sc} strokeWidth={7*s} strokeLinecap="round"/>
      {/* Head */}
      <circle cx={60*s} cy={40*s} r={18*s} fill={sc} stroke="rgba(0,0,0,.1)" strokeWidth={s}/>
      {/* Eyes */}
      <circle cx={54*s} cy={37*s} r={2.5*s} fill="#333"/>
      <circle cx={66*s} cy={37*s} r={2.5*s} fill="#333"/>
      {/* Mouth */}
      <path d={`M ${53*s} ${44*s} Q ${60*s} ${50*s} ${67*s} ${44*s}`} stroke="#333" strokeWidth={2*s} fill="none" strokeLinecap="round"/>
      {/* Hat layer (on top) */}
      {renderLayer(hat,'hat','hat')}
      {/* Clickable zones for equip if handler provided */}
      {onClickPart&&[
        {key:'hat',x:22,y:3,w:76,h:42,label:'🎩'},
        {key:'shirt',x:32,y:54,w:56,h:34,label:'👕'},
        {key:'pants',x:26,y:78,w:68,h:38,label:'👖'},
      ].map(z=>(
        <rect key={z.key} x={z.x*s} y={z.y*s} width={z.w*s} height={z.h*s} fill="transparent" rx={4}
          onClick={()=>onClickPart(z.key)} style={{cursor:'pointer'}}
          onMouseEnter={e=>e.target.setAttribute('fill','rgba(255,255,255,.1)')}
          onMouseLeave={e=>e.target.setAttribute('fill','transparent')}/>
      ))}
    </svg>
  );
}

// ── Equip Overlay ─────────────────────────────────────────────────────────────
function EquipOverlay({category,player,setPlayer,items,onClose,T}){
  const typeMap={hat:'hat',shirt:'shirt',pants:'pants'};
  const equipKey={hat:'equippedHat',shirt:'equippedShirt',pants:'equippedPants'}[category];
  const catItems=items.filter(x=>x.type===category);
  const [preview,setPreview]=useState({...player});

  const equip=(item)=>{
    setPreview(p=>({...p,[equipKey]:item.id}));
  };
  const confirm=()=>{
    setPlayer(p=>({...p,[equipKey]:preview[equipKey]}));
    onClose();
  };

  return(
    <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,.6)'}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:'100%',maxWidth:700,margin:'0 auto',background:'rgba(10,15,26,.98)',border:`1px solid ${T.border}`,borderTopLeftRadius:24,borderTopRightRadius:24,padding:20,maxHeight:'85vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{margin:0,color:T.accent,fontSize:16}}>
            {{hat:'🎩 Equip Hat',shirt:'👕 Equip Shirt',pants:'👖 Equip Pants'}[category]}
          </h3>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#888',fontSize:20,cursor:'pointer'}}>✕</button>
        </div>
        {/* Live preview */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:20,padding:16,background:T.card,borderRadius:16,border:`1px solid ${T.border}`}}>
          <div style={{textAlign:'center'}}>
            <Avatar player={preview} items={items} size={100}/>
            <div style={{fontSize:11,color:'#555',marginTop:6}}>Preview</div>
          </div>
        </div>
        {/* Item grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
          {catItems.map(item=>{
            const owned=player.ownedItems?.includes(item.id)||item.cost===0;
            const equipped=preview[equipKey]===item.id;
            const hasImg=item.imageUrl&&item.imageUrl.length>10;
            return(
              <div key={item.id} onClick={()=>owned&&equip(item)}
                style={{background:equipped?`${T.accent}22`:T.card,border:`2px solid ${equipped?T.accent:owned?T.border:'#333'}`,borderRadius:12,padding:10,textAlign:'center',cursor:owned?'pointer':'not-allowed',opacity:owned?1:.5,transition:'all .15s'}}>
                <div style={{fontSize:28,minHeight:34,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:4}}>
                  {hasImg?<img src={item.imageUrl} style={{width:32,height:32,objectFit:'contain'}} alt={item.name}/>:item.emoji||'∅'}
                </div>
                <div style={{fontSize:11,fontWeight:700,color:RARITY[item.rarity]?.color||'#fff',marginBottom:2}}>{item.name}</div>
                {!owned&&<div style={{fontSize:10,color:'#555'}}>{item.cost}💰</div>}
                {equipped&&<div style={{fontSize:10,color:T.accent,fontWeight:700}}>✓ On</div>}
              </div>
            );
          })}
        </div>
        <button onClick={confirm} style={{width:'100%',padding:'12px',background:`linear-gradient(135deg,${T.accent},${T.secondary})`,border:'none',borderRadius:12,color:'#111',fontSize:14,fontWeight:700,cursor:'pointer'}}>
          ✓ Confirm
        </button>
      </div>
    </div>
  );
}

// ── Admin Item Database (drag-to-rarity) ──────────────────────────────────────
function AdminItemDB({items,setItems,T}){
  const [dragId,setDragId]=useState(null);
  const [editItem,setEditItem]=useState(null);
  const [filterType,setFilterType]=useState('all');
  const imgRef=useRef({});

  const rarities=['common','rare','epic','legendary'];
  const types=['all','hat','shirt','pants','kbskin','msskin'];

  const handleDrop=(e,rarity)=>{
    e.preventDefault();
    const id=dragId;
    if(!id)return;
    setItems(prev=>prev.map(x=>x.id===id?{...x,rarity}:x));
    setDragId(null);
  };

  const handleImageUpload=(itemId,file)=>{
    if(!file)return;
    const reader=new FileReader();
    reader.onload=async e=>{
      const url=e.target.result;
      setItems(prev=>prev.map(x=>x.id===itemId?{...x,imageUrl:url}:x));
      await db.setImg(itemId,url);
    };
    reader.readAsDataURL(file);
  };

  const filtered=filterType==='all'?items:items.filter(x=>x.type===filterType);

  return(
    <div>
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {types.map(t=>(
          <button key={t} onClick={()=>setFilterType(t)}
            style={{padding:'5px 12px',background:filterType===t?T.accent:'transparent',border:`1px solid ${filterType===t?T.accent:T.border}`,borderRadius:20,color:filterType===t?'#111':T.accent,fontSize:11,fontWeight:700,cursor:'pointer'}}>
            {t==='all'?'All':t==='kbskin'?'KB Skin':t==='msskin'?'Mine Skin':t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {rarities.map(rarity=>(
          <div key={rarity} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e,rarity)}
            style={{background:'rgba(255,255,255,.02)',border:`2px dashed ${RARITY[rarity].color}44`,borderRadius:12,padding:10,minHeight:200}}>
            <div style={{fontSize:11,fontWeight:700,color:RARITY[rarity].color,textTransform:'uppercase',letterSpacing:1,marginBottom:10,textAlign:'center'}}>
              {RARITY[rarity].label}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {filtered.filter(x=>x.rarity===rarity).map(item=>{
                const hasImg=item.imageUrl&&item.imageUrl.length>10;
                return(
                  <div key={item.id} draggable onDragStart={()=>setDragId(item.id)} onDragEnd={()=>setDragId(null)}
                    style={{background:'rgba(255,255,255,.04)',border:`1px solid ${T.border}`,borderRadius:8,padding:'6px 8px',display:'flex',alignItems:'center',gap:8,cursor:'grab',opacity:dragId===item.id?.5:1}}>
                    <div style={{fontSize:18,width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {hasImg?<img src={item.imageUrl} style={{width:22,height:22,objectFit:'contain'}} alt=""/>:item.emoji||'∅'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:700,color:'#ccc',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
                      <div style={{fontSize:9,color:'#555'}}>{item.type} · {item.cost}💰</div>
                    </div>
                    <button onClick={()=>setEditItem({...item})} style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:13,padding:0,flexShrink:0}}>✏️</button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p style={{color:'#444',fontSize:11,marginTop:10}}>💡 Drag items between columns to change rarity</p>

      {/* Edit modal */}
      {editItem&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'#0a0f1a',border:`2px solid ${T.accent}`,borderRadius:16,padding:24,width:360,maxHeight:'90vh',overflowY:'auto'}}>
            <h3 style={{margin:'0 0 16px',color:T.accent,fontSize:15}}>Edit: {editItem.name}</h3>
            {/* Image upload */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:T.accent,fontWeight:700,marginBottom:6,textTransform:'uppercase'}}>Image (replaces emoji)</div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                {editItem.imageUrl&&editItem.imageUrl.length>10
                  ?<img src={editItem.imageUrl} style={{width:48,height:48,objectFit:'contain',borderRadius:8,background:'rgba(255,255,255,.05)',border:`1px solid ${T.border}`}} alt="preview"/>
                  :<div style={{width:48,height:48,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,background:'rgba(255,255,255,.05)',border:`1px solid ${T.border}`,fontSize:24}}>{editItem.emoji||'∅'}</div>
                }
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <input ref={el=>imgRef.current[editItem.id]=el} type="file" accept="image/*" style={{display:'none'}}
                    onChange={e=>{
                      const file=e.target.files[0];
                      if(!file)return;
                      const reader=new FileReader();
                      reader.onload=ev=>setEditItem(p=>({...p,imageUrl:ev.target.result}));
                      reader.readAsDataURL(file);
                    }}/>
                  <button onClick={()=>imgRef.current[editItem.id]?.click()}
                    style={{padding:'6px 12px',background:'rgba(78,205,196,.1)',border:`1px solid ${T.accent}`,borderRadius:6,color:T.accent,fontSize:11,fontWeight:700,cursor:'pointer'}}>
                    📁 Upload Image
                  </button>
                  {editItem.imageUrl&&<button onClick={()=>setEditItem(p=>({...p,imageUrl:''}))}
                    style={{padding:'6px 12px',background:'rgba(255,107,107,.1)',border:'1px solid #FF6B6B',borderRadius:6,color:'#FF6B6B',fontSize:11,cursor:'pointer'}}>
                    ✕ Remove
                  </button>}
                </div>
              </div>
            </div>
            {[['Name','name','text'],['Emoji (fallback)','emoji','text'],['Cost (coins)','cost','number']].map(([lbl,key,type])=>(
              <div key={key} style={{marginBottom:10}}>
                <div style={{fontSize:11,color:T.accent,fontWeight:700,marginBottom:4,textTransform:'uppercase'}}>{lbl}</div>
                <input type={type} value={editItem[key]||''} onChange={e=>setEditItem(p=>({...p,[key]:type==='number'?Number(e.target.value):e.target.value}))}
                  style={{width:'100%',padding:'8px 10px',background:'#080d17',border:`1px solid ${T.border}`,borderRadius:6,color:'#fff',fontSize:13}}/>
              </div>
            ))}
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:T.accent,fontWeight:700,marginBottom:4,textTransform:'uppercase'}}>Rarity</div>
              <select value={editItem.rarity} onChange={e=>setEditItem(p=>({...p,rarity:e.target.value}))}
                style={{width:'100%',padding:'8px 10px',background:'#080d17',border:`1px solid ${T.border}`,borderRadius:6,color:'#fff',fontSize:13}}>
                {Object.keys(RARITY).map(r=><option key={r} value={r}>{RARITY[r].label}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <button onClick={async ()=>{
                if(editItem.imageUrl&&editItem.imageUrl.length>10)await db.setImg(editItem.id,editItem.imageUrl);
                setItems(prev=>prev.map(x=>x.id===editItem.id?editItem:x));
                setEditItem(null);
              }} style={{flex:1,padding:'10px',background:T.accent,border:'none',borderRadius:8,color:'#111',fontWeight:700,cursor:'pointer'}}>Save</button>
              <button onClick={()=>setEditItem(null)} style={{flex:1,padding:'10px',background:'#1a2535',border:'none',borderRadius:8,color:'#fff',fontWeight:700,cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Minesweeper ───────────────────────────────────────────────────────────────
function Minesweeper({player,setPlayer,items,adminCfg,T,toast}){
  const ROWS=16,COLS=16,MINES=40;
  const [board,setBoard]=useState(null);
  const [gameState,setGameState]=useState('idle');
  const [flagged,setFlagged]=useState(new Set());
  const [revealed,setRevealed]=useState(new Set());
  const skinId=player.equippedMsSkin||'ms_classic';
  const skin=items.find(x=>x.id===skinId)||{flag:'🚩',bomb:'💣'};

  const initBoard=(fr,fc)=>{
    const mines=new Set();
    while(mines.size<MINES){const pos=Math.floor(Math.random()*ROWS*COLS);const r=Math.floor(pos/COLS),c=pos%COLS;if(Math.abs(r-fr)>1||Math.abs(c-fc)>1)mines.add(pos);}
    return Array(ROWS).fill(null).map((_,r)=>Array(COLS).fill(null).map((_,c)=>{
      const pos=r*COLS+c;
      const adj=[-1,-1,-1,0,-1,1,0,-1,0,1,1,-1,1,0,1,1].reduce((cnt,_,i,a)=>{if(i%2!==0)return cnt;const nr=r+a[i],nc=c+a[i+1];if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&mines.has(nr*COLS+nc))return cnt+1;return cnt;},0);
      return{mine:mines.has(pos),adj};
    }));
  };
  const reveal=(b,r,c,rev)=>{const pos=r*COLS+c;if(rev.has(pos)||r<0||r>=ROWS||c<0||c>=COLS)return;rev.add(pos);if(b[r][c].adj===0&&!b[r][c].mine)[...Array(9)].forEach((_,i)=>{const dr=Math.floor(i/3)-1,dc=i%3-1;if(dr||dc)reveal(b,r+dr,c+dc,rev);});};

  const handleClick=(r,c)=>{
    if(gameState==='won'||gameState==='lost')return;
    const pos=r*COLS+c;if(flagged.has(pos))return;
    let b=board,rev=new Set(revealed);
    if(!b){b=initBoard(r,c);setBoard(b);setGameState('playing');}
    if(b[r][c].mine){
      const allM=new Set();b.forEach((row,ri)=>row.forEach((cell,ci)=>{if(cell.mine)allM.add(ri*COLS+ci);}));
      setRevealed(new Set([...rev,...allM]));setGameState('lost');
      setPlayer(p=>({...p,mineLosses:(p.mineLosses||0)+1}));toast('💥 Game Over!','😵');return;
    }
    reveal(b,r,c,rev);setRevealed(new Set(rev));
    const safe=ROWS*COLS-MINES;
    if(rev.size>=safe){
      setGameState('won');
      const wins=(player.mineWins||0)+1,lvl=player.mineLevel||1;
      const thr=[0,2,3,10,20,40,80,160,320,640];
      const wal=(player.winsAtLevel||0)+1;
      let nl=lvl,nw=wal;
      if(wal>=(thr[lvl]||999)&&lvl<10){nl=lvl+1;nw=0;toast(`⬆️ Level ${nl}!`,'🎮',true);}
      const ret=adminCfg.minesweeperReturn||5;
      setPlayer(p=>({...p,mineWins:wins,mineLevel:nl,winsAtLevel:nw,tickets:(p.tickets||0)+ret}));
      toast(`🏆 You Won! +${ret} tickets`,'🎉',true);
    }
  };
  const rightClick=(e,r,c)=>{e.preventDefault();if(gameState==='idle'||gameState==='won'||gameState==='lost')return;const pos=r*COLS+c;if(revealed.has(pos))return;setFlagged(prev=>{const n=new Set(prev);n.has(pos)?n.delete(pos):n.add(pos);return n;});};
  const reset=()=>{setBoard(null);setGameState('idle');setFlagged(new Set());setRevealed(new Set());};
  const cost=adminCfg.minesweeperCost||50;

  const startGame=()=>{if((player.coins||0)<cost){alert(`Need ${cost} coins!`);return;}setPlayer(p=>({...p,coins:p.coins-cost}));reset();setGameState('ready');};
  if(gameState==='idle')return(
    <div style={{textAlign:'center',padding:40}}>
      <div style={{fontSize:48,marginBottom:12}}>{skin.bomb||'💣'}</div>
      <div style={{fontSize:18,fontWeight:700,marginBottom:6}}>Minesweeper</div>
      <div style={{fontSize:12,color:'#888',marginBottom:6}}>16×16 · 40 mines · Costs {cost} coins · Win = +{adminCfg.minesweeperReturn||5} tickets</div>
      <div style={{fontSize:12,color:'#aaa',marginBottom:20}}>Level {player.mineLevel||1} · {player.mineWins||0}W / {player.mineLosses||0}L</div>
      <button onClick={startGame} style={{padding:'12px 28px',background:'linear-gradient(135deg,#FFE66D,#FF8B94)',border:'none',borderRadius:12,color:'#111',fontSize:14,fontWeight:700,cursor:'pointer'}}>
        Play ({cost} 💰)
      </button>
    </div>
  );
  const cs=Math.min(24,Math.floor(340/COLS));
  const numC=['','#4ECDC4','#4CAF50','#FF8B94','#9C27B0','#FF5722','#00BCD4','#000','#607D8B'];
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
      <div style={{display:'flex',gap:14,alignItems:'center'}}>
        <span style={{fontSize:12,color:'#aaa'}}>{skin.bomb} {MINES-flagged.size}</span>
        <span style={{fontSize:12,color:gameState==='won'?'#4ECDC4':gameState==='lost'?'#FF6B6B':'#aaa'}}>{gameState==='won'?'🏆 Won!':gameState==='lost'?'💥 Lost!':'Playing'}</span>
        <button onClick={()=>{reset();setGameState('idle');}} style={{padding:'5px 12px',background:'#333',border:'none',borderRadius:6,color:'#fff',fontSize:11,cursor:'pointer'}}>New</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:`repeat(${COLS},${cs}px)`,gap:1,background:'#111',padding:3,borderRadius:8,overflowX:'auto'}}>
        {Array(ROWS).fill(null).map((_,r)=>Array(COLS).fill(null).map((_,c)=>{
          const pos=r*COLS+c,isRev=revealed.has(pos),isFlag=flagged.has(pos),cell=board?.[r]?.[c];
          return(<div key={`${r}-${c}`} onClick={()=>handleClick(r,c)} onContextMenu={e=>rightClick(e,r,c)}
            style={{width:cs,height:cs,display:'flex',alignItems:'center',justifyContent:'center',fontSize:cs*.5,cursor:'pointer',borderRadius:2,background:isRev?(cell?.mine?'#c62828':'#1a2535'):'#0f3460',border:isRev?'1px solid #1a2535':'1px solid #1a4a7a',userSelect:'none'}}>
            {isRev&&cell?.mine&&skin.bomb}
            {isRev&&!cell?.mine&&cell?.adj>0&&<span style={{fontSize:cs*.55,fontWeight:700,color:numC[cell.adj]}}>{cell.adj}</span>}
            {!isRev&&isFlag&&skin.flag}
          </div>);
        }))}
      </div>
    </div>
  );
}

// ── Kanban Employee View ──────────────────────────────────────────────────────
function KanbanEmployee({cards,setCards,moveCard,kbSkinItem,T}){
  const fileRef=useRef({});
  const allowed=['.js','.py','.html','.css','.ts','.tsx','.jsx','.json','.md','.txt','.sh','.sql'];
  const uploadFile=(cardId,file)=>{
    if(!file)return;
    if(!allowed.some(e=>file.name.endsWith(e))){alert('Code files only: '+allowed.join(' '));return;}
    const reader=new FileReader();
    reader.onload=e=>setCards(prev=>prev.map(c=>c.id===cardId?{...c,files:[...(c.files||[]),{name:file.name,dataUrl:e.target.result,uploadedAt:new Date().toISOString()}]}:c));
    reader.readAsDataURL(file);
  };
  const banner=kbSkinItem?.imageUrl&&kbSkinItem.imageUrl.length>10?`url(${kbSkinItem.imageUrl})`:kbSkinItem?.banner||'#1a2535';
  const bannerStyle=kbSkinItem?.imageUrl&&kbSkinItem.imageUrl.length>10?{backgroundImage:banner,backgroundSize:'cover',backgroundPosition:'center'}:{background:banner};

  return(
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
      {['todo','inprogress','done'].map(listId=>(
        <div key={listId} style={{background:'rgba(255,255,255,.02)',border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden'}}>
          <div style={{height:52,...bannerStyle,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            {kbSkinItem?.emoji&&<span style={{fontSize:15,opacity:.8}}>{kbSkinItem.emoji}</span>}
            <span style={{fontSize:12,fontWeight:700,color:'#fff',textShadow:'0 1px 4px rgba(0,0,0,.8)',textTransform:'uppercase',letterSpacing:1}}>
              {listId==='todo'?'📝 To Do':listId==='inprogress'?'🔄 In Progress':'✅ Done'}
            </span>
          </div>
          <div style={{padding:10,display:'flex',flexDirection:'column',gap:8,minHeight:200}}>
            {cards.filter(c=>c.list===listId).map(card=>{
              const due=card.dueDate?new Date(card.dueDate):null;
              const isLate=due&&new Date()>due&&listId!=='done';
              return(
                <div key={card.id} style={{background:T.card,border:`1px solid ${isLate?'#FF6B6B':T.border}`,borderRadius:12,padding:10,boxShadow:'3px 3px 0 rgba(0,0,0,.3)'}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{card.image&&<span style={{marginRight:4}}>{card.image}</span>}{card.title}</div>
                  {card.desc&&<div style={{fontSize:11,color:'#888',marginBottom:5}}>{card.desc}</div>}
                  {due&&<div style={{fontSize:10,color:isLate?'#FF6B6B':T.accent,marginBottom:5}}>📅 {due.toLocaleDateString()}{isLate?' ⚠️ Late':''}</div>}
                  {listId==='inprogress'&&(
                    <div style={{marginTop:6}}>
                      <input ref={el=>fileRef.current[card.id]=el} type="file" style={{display:'none'}} accept={allowed.join(',')} onChange={e=>{if(e.target.files[0])uploadFile(card.id,e.target.files[0]);}}/>
                      <button onClick={()=>fileRef.current[card.id]?.click()} style={{padding:'5px 10px',background:`rgba(78,205,196,.1)`,border:`1px dashed ${T.accent}`,borderRadius:6,color:T.accent,fontSize:11,fontWeight:700,cursor:'pointer',width:'100%',marginBottom:4}}>
                        📎 Submit Code File
                      </button>
                      {(card.files||[]).map((f,i)=><div key={i} style={{fontSize:10,color:'#888'}}>✅ {f.name}</div>)}
                      {(card.files||[]).length>0&&<button onClick={()=>moveCard(card.id,'done')} style={{padding:'5px 10px',background:`linear-gradient(135deg,${T.accent},#44A08D)`,border:'none',borderRadius:6,color:'#111',fontSize:11,fontWeight:700,cursor:'pointer',width:'100%',marginTop:4}}>✅ Submit → Done</button>}
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

// ── GiftFriend ────────────────────────────────────────────────────────────────
function GiftFriend({friend,setFriend,setPlayer,toast}){
  const [type,setType]=useState('coins');
  const [amt,setAmt]=useState('100');
  const [msg,setMsg]=useState('');
  const send=()=>{
    const a=Number(amt)||0,now=new Date().toISOString();
    let text=msg||`${friend.name||'Friend'} received a gift!`;
    if(type==='coins'){setFriend(f=>({...f,coins:(f.coins||0)+a}));if(!msg)text=`${friend.name} received ${a} coins!`;}
    if(type==='tickets'){setFriend(f=>({...f,tickets:(f.tickets||0)+a}));if(!msg)text=`${friend.name} received ${a} tickets!`;}
    if(type==='eliteTickets'){setFriend(f=>({...f,eliteTickets:(f.eliteTickets||0)+a}));if(!msg)text=`${friend.name} received ${a} elite tickets!`;}
    const notif={text,date:now,read:false};
    setFriend(f=>({...f,messages:[notif,...(f.messages||[])].slice(0,50)}));
    setPlayer(p=>({...p,notifications:[notif,...(p.notifications||[])].slice(0,50)}));
    toast(`Sent to ${friend.name}!`,'📨');setMsg('');
  };
  return(
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <select value={type} onChange={e=>setType(e.target.value)} style={{padding:'7px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:13}}>
        <option value="coins">Coins</option><option value="tickets">Tickets</option><option value="eliteTickets">Elite Tickets</option>
      </select>
      <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Amount" style={{padding:'7px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:13}}/>
      <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Custom message (optional)" style={{padding:'7px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:13}}/>
      <button onClick={send} style={{padding:'8px',background:'linear-gradient(135deg,#FFE66D,#FF8B94)',border:'none',borderRadius:6,color:'#111',fontWeight:700,fontSize:13,cursor:'pointer'}}>📨 Send</button>
    </div>
  );
}

// ── Shop stock generator ──────────────────────────────────────────────────────
function genShopStock(items,lastReset,resetTime,priceMin=10,priceMax=200,player){
  const now=new Date();const[rh,rm]=(resetTime||'09:00').split(':').map(Number);
  const rt=new Date(now);rt.setHours(rh,rm,0,0);if(now<rt)rt.setDate(rt.getDate()-1);
  const seed=rt.toDateString();if(lastReset===seed)return null;
  const unowned=items.filter(i=>!(player.ownedItems||[]).includes(i.id)&&i.cost>0);
  const byR={common:[],rare:[],epic:[],legendary:[]};unowned.forEach(i=>{if(byR[i.rarity])byR[i.rarity].push(i);});
  const pf=(r)=>{const ranges={common:[10,50],rare:[50,100],epic:[100,150],legendary:[150,200]};const[lo,hi]=ranges[r]||[10,100];const cl=Math.max(lo,priceMin),ch=Math.min(hi,priceMax);return Math.round((cl+Math.floor(Math.random()*Math.max(1,ch-cl)))/10)*10;};
  const used=new Set();const pick=(pool)=>{const avail=pool.filter(x=>!used.has(x.id));if(!avail.length)return null;const i=avail[Math.floor(Math.random()*avail.length)];used.add(i.id);return i;};
  const stock=[];const weights=[60,60,25,25,10,5];
  for(let i=0;i<6;i++){const w=weights[i];const pool=w>=60?byR.common:w>=25?[...byR.rare,...byR.common]:[...byR.epic,...byR.rare,...byR.legendary];const item=pick(pool);if(item)stock.push({...item,shopPrice:pf(item.rarity)});else stock.push(null);}
  return{stock,resetDate:seed};
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════════════════════
const DEF_PLAYER={name:'Employee',coins:0,tickets:0,eliteTickets:0,ownedItems:['hat_none','shirt_none','pants_none','kb_plain','ms_classic'],equippedTheme:'midnight',equippedHat:'hat_none',equippedShirt:'shirt_none',equippedPants:'pants_none',equippedKbSkin:'kb_plain',equippedMsSkin:'ms_classic',skinColor:'#FDBCB4',mineLevel:1,mineWins:0,mineLosses:0,winsAtLevel:0,boardsDone:0,notifications:[]};
const DEF_FRIEND={name:'Alex',coins:0,tickets:0,eliteTickets:0,mineLevel:1,mineWins:0,messages:[]};
const DEF_CARDS=[{id:'c1',title:'Setup authentication',desc:'Implement login flow',list:'todo',dueDate:'',submittedAt:'',files:[],image:'🔐'},{id:'c2',title:'Build dashboard UI',desc:'Main screen layout',list:'inprogress',dueDate:'',submittedAt:'',files:[],image:'📊'}];
const DEF_REG=[{id:0,label:'50 Coins',type:'coins',val:50,weight:30,color:'#4ECDC4',emoji:'',imageUrl:''},{id:1,label:'100 Coins',type:'coins',val:100,weight:25,color:'#FFE66D',emoji:'',imageUrl:''},{id:2,label:'200 Coins',type:'coins',val:200,weight:20,color:'#95E1D3',emoji:'',imageUrl:''},{id:3,label:'500 Coins',type:'coins',val:500,weight:12,color:'#FF8B94',emoji:'',imageUrl:''},{id:4,label:'+2 Tickets',type:'tickets',val:2,weight:8,color:'#C7CEEA',emoji:'',imageUrl:''},{id:5,label:'⭐ ELITE',type:'elite_ticket',val:1,weight:5,color:'#FF6B6B',emoji:'',imageUrl:''}];
const DEF_ELITE=[{id:0,label:'1K Coins',type:'coins',val:1000,weight:35,color:'#4ECDC4',emoji:'',imageUrl:''},{id:1,label:'2.5K',type:'coins',val:2500,weight:25,color:'#FFE66D',emoji:'',imageUrl:''},{id:2,label:'5K Coins',type:'coins',val:5000,weight:15,color:'#95E1D3',emoji:'',imageUrl:''},{id:3,label:'🎁 Prize',type:'custom',val:'Boss buys lunch!',weight:13,color:'#C7CEEA',emoji:'',imageUrl:''},{id:4,label:'10K',type:'coins',val:10000,weight:8,color:'#FF8B94',emoji:'',imageUrl:''},{id:5,label:'💎 JACKPOT',type:'jackpot',val:25000,weight:4,color:'#FF6B6B',emoji:'',imageUrl:''}];
const DEF_ULTRA=[{id:0,label:'Day Off!',type:'custom',val:'Day Off!',weight:40,color:'#FFD700',emoji:'',imageUrl:''},{id:1,label:'Free Lunch',type:'custom',val:'Free Lunch!',weight:35,color:'#FF8B94',emoji:'',imageUrl:''},{id:2,label:'Early Finish',type:'custom',val:'Early Finish!',weight:25,color:'#4ECDC4',emoji:'',imageUrl:''}];
const DEF_ADMIN={password:'admin',onTimeTickets:2,lateTickets:1,veryLateTickets:0,minesweeperCost:50,minesweeperReturn:5,ultraWheelCost:1,themeUnlockCost:50,mineUnlockCost:100,ultraUnlockCost:1,themeUnlockType:'tickets',mineUnlockType:'tickets',ultraUnlockType:'eliteTickets',boardName:'Dev Board',friendName:'Alex',shopResetTime:'09:00',shopPriceMin:10,shopPriceMax:200};
const DEF_SHOP={stock:[],lastReset:'',resetTime:'09:00',priceMin:10,priceMax:200};

export default function DevWheel(){
  const [ok,setOk]=useState(false);
  const [view,setView]=useState('admin-login');
  const [tab,setTab]=useState('wheels');
  const [adminTab,setAdminTab]=useState('kanban');
  const [popup,setPopup]=useState(null);
  const [profileOpen,setProfileOpen]=useState(false);
  const [friendOpen,setFriendOpen]=useState(false);
  const [logoTaps,setLogoTaps]=useState(0);
  const [logoTimer,setLogoTimer]=useState(null);
  const [adminModal,setAdminModal]=useState(false);
  const [adminModalPw,setAdminModalPw]=useState('');
  const [profileTab,setProfileTab]=useState('avatar');
  const [equipOverlay,setEquipOverlay]=useState(null); // 'hat'|'shirt'|'pants'|null

  const [player,setPlayer]=useState(DEF_PLAYER);
  const [friend,setFriend]=useState(DEF_FRIEND);
  const [cards,setCards]=useState(DEF_CARDS);
  const [items,setItems]=useState(BASE_ITEMS);
  const [regSegs,setRegSegs]=useState(DEF_REG);
  const [eliteSegs,setEliteSegs]=useState(DEF_ELITE);
  const [ultraSegs,setUltraSegs]=useState(DEF_ULTRA);
  const [shop,setShop]=useState(DEF_SHOP);
  const [admin,setAdmin]=useState(DEF_ADMIN);
  const [unlocked,setUnlocked]=useState({themes:false,minesweeper:false,ultraWheel:false});
  const [regRot,setRegRot]=useState(0);
  const [elRot,setElRot]=useState(0);
  const [ultraRot,setUltraRot]=useState(0);
  const [regSpin,setRegSpin]=useState(false);
  const [elSpin,setElSpin]=useState(false);
  const [ultraSpin,setUltraSpin]=useState(false);
  const [adminPwInput,setAdminPwInput]=useState('');
  const [editCard,setEditCard]=useState(null);
  const [dragCard,setDragCard]=useState(null);
  const [shopStock,setShopStock]=useState([]);

  // ── Load ──────────────────────────────────────────────────────
  useEffect(()=>{(async()=>{
    const p=await db.get('dw-player',DEF_PLAYER);
    const f=await db.get('dw-friend',DEF_FRIEND);
    const c=await db.get('dw-cards',DEF_CARDS);
    const it=await db.get('dw-items',BASE_ITEMS);
    const rs=await db.get('dw-regsegs',DEF_REG);
    const es=await db.get('dw-elsegs',DEF_ELITE);
    const us=await db.get('dw-ultrasegs',DEF_ULTRA);
    const sh=await db.get('dw-shop',DEF_SHOP);
    const ad=await db.get('dw-admin',DEF_ADMIN);
    const ul=await db.get('dw-unlocked',{themes:false,minesweeper:false,ultraWheel:false});
    // Load item images
    const itWithImgs=await Promise.all(it.map(async item=>{
      if(!item.imageUrl||item.imageUrl.length<10){const img=await db.getImg(item.id);return{...item,imageUrl:img};}
      return item;
    }));
    // Load wheel segment images
    const loadSegImgs=async(segs)=>Promise.all(segs.map(async s=>{if(!s.imageUrl||s.imageUrl.length<10){const img=await db.getImg(`seg-${s.id}`);return{...s,imageUrl:img};}return s;}));
    const rsI=await loadSegImgs(rs),esI=await loadSegImgs(es),usI=await loadSegImgs(us);
    setPlayer({...DEF_PLAYER,...p});setFriend({...DEF_FRIEND,...f});setCards(c);
    setItems(itWithImgs.length?itWithImgs:BASE_ITEMS);
    setRegSegs(rsI);setEliteSegs(esI);setUltraSegs(usI);
    setShop(sh);setAdmin({...DEF_ADMIN,...ad});setUnlocked(ul);
    // Generate shop
    const sr=genShopStock(itWithImgs,sh.lastReset,sh.resetTime||ad.shopResetTime,sh.priceMin||ad.shopPriceMin,sh.priceMax||ad.shopPriceMax,p);
    if(sr){const ns={...sh,stock:sr.stock,lastReset:sr.resetDate};setShop(ns);await db.set('dw-shop',ns);setShopStock(sr.stock);}
    else setShopStock(sh.stock||[]);
    setOk(true);
  })();},[]);

  useEffect(()=>{if(ok)db.set('dw-player',player);},[player,ok]);
  useEffect(()=>{if(ok)db.set('dw-friend',friend);},[friend,ok]);
  useEffect(()=>{if(ok)db.set('dw-cards',cards);},[cards,ok]);
  useEffect(()=>{if(ok)db.set('dw-items',items);},[items,ok]);
  useEffect(()=>{if(ok){db.set('dw-regsegs',regSegs);db.set('dw-elsegs',eliteSegs);db.set('dw-ultrasegs',ultraSegs);}},[regSegs,eliteSegs,ultraSegs,ok]);
  useEffect(()=>{if(ok)db.set('dw-shop',shop);},[shop,ok]);
  useEffect(()=>{if(ok)db.set('dw-admin',admin);},[admin,ok]);
  useEffect(()=>{if(ok)db.set('dw-unlocked',unlocked);},[unlocked,ok]);

  const T=THEMES[player.equippedTheme]||THEMES.midnight;
  const handleLogoTap=()=>{
    setLogoTaps(n=>{
      const next=n+1;
      if(logoTimer)clearTimeout(logoTimer);
      const t=setTimeout(()=>setLogoTaps(0),2500);
      setLogoTimer(t);
      if(next>=5){setAdminModal(true);return 0;}
      return next;
    });
  };
  const toast=(label,emoji,big=false)=>{setPopup({label,emoji,big});setTimeout(()=>setPopup(null),big?4000:2800);};

  // ── Spins ──────────────────────────────────────────────────────
  const spin=(type)=>{
    if(regSpin||elSpin||ultraSpin)return;
    const segs=type==='reg'?regSegs:type==='elite'?eliteSegs:ultraSegs;
    const cost=type==='reg'?1:type==='elite'?1:(admin.ultraWheelCost||1);
    const currency=type==='reg'?'tickets':type==='elite'?'eliteTickets':'eliteTickets';
    if((player[currency]||0)<cost){alert(`Need ${cost} ${currency}!`);return;}
    setPlayer(p=>({...p,[currency]:p[currency]-cost}));
    const setSpin=type==='reg'?setRegSpin:type==='elite'?setElSpin:setUltraSpin;
    const setRot=type==='reg'?setRegRot:type==='elite'?setElRot:setUltraRot;
    const prevRot=type==='reg'?regRot:type==='elite'?elRot:ultraRot;
    setSpin(true);
    const idx=pickWeighted(segs),seg=segs[idx];
    setRot(calcRot(prevRot,idx,segs.length));
    setTimeout(()=>{
      if(seg.type==='coins'||seg.type==='jackpot'){setPlayer(p=>({...p,coins:p.coins+seg.val}));toast(`+${seg.val.toLocaleString()} Coins`,seg.type==='jackpot'?'💎':'💰',seg.type==='jackpot');}
      else if(seg.type==='tickets'){setPlayer(p=>({...p,tickets:(p.tickets||0)+seg.val}));toast(`+${seg.val} Tickets`,'🎫');}
      else if(seg.type==='elite_ticket'){setPlayer(p=>({...p,eliteTickets:(p.eliteTickets||0)+1}));toast('⭐ ELITE TICKET!','🌟',true);}
      else if(seg.type==='custom'){toast(String(seg.val),'🎁',true);}
      setSpin(false);
    },3700);
  };

  // ── Kanban move ────────────────────────────────────────────────
  const moveCard=(cardId,newList)=>{
    const card=cards.find(c=>c.id===cardId);
    if(!card||card.list===newList)return;
    if(newList==='done'){
      const now=new Date(),due=card.dueDate?new Date(card.dueDate):null;
      let tix=admin.onTimeTickets??2;
      if(due){const d=(now-due)/86400000;if(d>2)tix=admin.veryLateTickets??0;else if(d>0)tix=admin.lateTickets??1;}
      setPlayer(p=>({...p,tickets:(p.tickets||0)+tix,boardsDone:(p.boardsDone||0)+1}));
      if(tix>0)toast(`+${tix} Ticket${tix>1?'s':''}!`,'🎫');else toast('Late submission — no tickets','😔');
    }
    setCards(prev=>prev.map(c=>c.id===cardId?{...c,list:newList,submittedAt:newList==='done'?new Date().toISOString():c.submittedAt}:c));
  };

  // ── Unlock ─────────────────────────────────────────────────────
  const tryUnlock=(feature)=>{
    if(unlocked[feature])return true;
    // Explicit mapping fixes key name mismatch between admin settings and unlock check
    const cfgMap={
      themes:    [admin.themeUnlockCost||50,   admin.themeUnlockType||'tickets'],
      minesweeper:[admin.mineUnlockCost||100,  admin.mineUnlockType||'tickets'],
      ultraWheel:[admin.ultraUnlockCost||1,    admin.ultraUnlockType||'eliteTickets'],
    };
    const [cost,type]=cfgMap[feature]||[50,'tickets'];
    const val=player[type]||0;
    if(val>=cost){setUnlocked(u=>({...u,[feature]:true}));toast('🔓 Unlocked!','🎉',true);return true;}
    toast(`Need ${cost} ${type} to unlock (you have ${val})`,'🔒');
    return false;
  };

  const kbSkinItem=items.find(x=>x.id===player.equippedKbSkin)||items.find(x=>x.id==='kb_plain')||{banner:'#1a2535'};
  const friendUnread=(friend.messages||[]).filter(m=>!m.read).length;

  if(!ok)return<div style={{minHeight:'100vh',background:'#050810',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{color:'#4ECDC4',fontSize:22}}>🎡 Loading…</span></div>;

  // ════════════════════════════════════════════════════════════
  // ADMIN LOGIN
  // ════════════════════════════════════════════════════════════
  if(view==='admin-login')return(
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#050810,#0a0f1a)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <div style={{background:'rgba(255,255,255,.04)',border:'1px solid #1a2535',borderRadius:24,padding:40,textAlign:'center',width:320}}>
        <div style={{fontSize:48,marginBottom:12}}>🎡</div>
        <h1 style={{fontSize:22,color:'#fff',margin:'0 0 4px',fontWeight:800}}>DevWheel</h1>
        <p style={{color:'#555',fontSize:13,margin:'0 0 28px'}}>Admin Portal</p>
        <input type="password" placeholder="Admin password" value={adminPwInput} onChange={e=>setAdminPwInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&adminPwInput===admin.password&&(setView('admin'),setAdminPwInput(''))}
          style={{width:'100%',padding:'12px',background:'#080d17',border:'2px solid #1a2535',borderRadius:12,color:'#fff',fontSize:14,marginBottom:12,boxSizing:'border-box'}}/>
        <button onClick={()=>{if(adminPwInput===admin.password){setView('admin');setAdminPwInput('');}else alert('Wrong password');}}
          style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#4ECDC4,#44A08D)',border:'none',borderRadius:12,color:'#111',fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:12}}>
          🔓 Enter Admin
        </button>
        <button onClick={()=>setView('employee')} style={{width:'100%',padding:'10px',background:'transparent',border:'1px dashed #333',borderRadius:12,color:'#555',fontSize:13,cursor:'pointer'}}>
          View as Employee →
        </button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // ADMIN VIEW
  // ════════════════════════════════════════════════════════════
  if(view==='admin'){
    const aTabs=[['kanban','📋 Kanban'],['wheels','🎡 Wheels'],['items','🗃️ Item DB'],['shop','🛍️ Shop'],['player','👤 Player'],['settings','⚙️ Settings']];
    const imgRefs=useRef({});
    const uploadSegImg=async(setSegs,segId,file)=>{
      if(!file)return;
      const reader=new FileReader();
      reader.onload=async e=>{const url=e.target.result;setSegs(prev=>prev.map(s=>s.id===segId?{...s,imageUrl:url}:s));await db.setImg(`seg-${segId}`,url);};
      reader.readAsDataURL(file);
    };
    return(
      <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#050810,#0a0f1a)',color:'#fff',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
        <style>{`*{box-sizing:border-box}body{margin:0}input::placeholder{color:#333}input:focus,select:focus,textarea:focus{outline:none;border-color:#4ECDC4!important}.ah:hover{opacity:.8}.ch:hover{background:rgba(255,255,255,.06)!important}@keyframes fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
        {/* Header */}
        <div style={{background:'rgba(255,255,255,.03)',borderBottom:'1px solid #1a2535',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100}}>
          <span style={{fontSize:15,fontWeight:700,color:'#4ECDC4'}}>⚙️ Admin Panel</span>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setView('employee')} className="ah" style={{padding:'6px 12px',background:'rgba(78,205,196,.1)',border:'1px solid #4ECDC4',borderRadius:8,color:'#4ECDC4',fontSize:12,fontWeight:700,cursor:'pointer'}}>👁️ Employee View</button>
            <button onClick={()=>setView('admin-login')} className="ah" style={{padding:'6px 12px',background:'rgba(255,107,107,.1)',border:'1px solid #FF6B6B',borderRadius:8,color:'#FF6B6B',fontSize:12,fontWeight:700,cursor:'pointer'}}>🚪 Logout</button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid #1a2535',overflowX:'auto'}}>
          {aTabs.map(([id,lbl])=>(
            <button key={id} className="ah" onClick={()=>setAdminTab(id)}
              style={{padding:'11px 18px',background:'transparent',border:'none',borderBottom:adminTab===id?'2px solid #4ECDC4':'2px solid transparent',color:adminTab===id?'#4ECDC4':'#666',fontSize:13,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
              {lbl}
            </button>
          ))}
        </div>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'20px 16px'}}>

          {/* KANBAN */}
          {adminTab==='kanban'&&(
            <div style={{animation:'fd .25s ease'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h2 style={{margin:0,fontSize:17,color:'#FFE66D'}}>{admin.boardName||'Dev Board'}</h2>
                <button onClick={()=>setEditCard({id:'',title:'',desc:'',list:'todo',dueDate:'',image:'',files:[]})}
                  style={{padding:'7px 14px',background:'linear-gradient(135deg,#4ECDC4,#44A08D)',border:'none',borderRadius:8,color:'#111',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  + New Card
                </button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                {['todo','inprogress','done'].map(listId=>{
                  const banner=kbSkinItem?.imageUrl&&kbSkinItem.imageUrl.length>10?{backgroundImage:`url(${kbSkinItem.imageUrl})`,backgroundSize:'cover',backgroundPosition:'center'}:{background:kbSkinItem?.banner||'#1a2535'};
                  return(
                    <div key={listId} style={{background:'rgba(255,255,255,.02)',border:'1px solid #1a2535',borderRadius:16,overflow:'hidden'}}
                      onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragCard)moveCard(dragCard,listId);}}>
                      <div style={{height:52,...banner,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                        {kbSkinItem?.emoji&&<span style={{fontSize:15,opacity:.8}}>{kbSkinItem.emoji}</span>}
                        <span style={{fontSize:12,fontWeight:700,color:'#fff',textShadow:'0 1px 4px rgba(0,0,0,.8)',textTransform:'uppercase',letterSpacing:1}}>
                          {listId==='todo'?'📝 To Do':listId==='inprogress'?'🔄 In Progress':'✅ Done'}
                        </span>
                      </div>
                      <div style={{padding:10,display:'flex',flexDirection:'column',gap:8,minHeight:250}}>
                        {cards.filter(c=>c.list===listId).map(card=>{
                          const due=card.dueDate?new Date(card.dueDate):null;const isLate=due&&new Date()>due&&listId!=='done';
                          return(
                            <div key={card.id} draggable onDragStart={()=>setDragCard(card.id)} onDragEnd={()=>setDragCard(null)}
                              className="ch" style={{background:'rgba(255,255,255,.04)',border:`1px solid ${isLate?'#FF6B6B':'#1a2535'}`,borderRadius:12,padding:10,cursor:'grab',boxShadow:'3px 3px 0 rgba(0,0,0,.3)'}}>
                              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                                <div style={{fontSize:13,fontWeight:700,flex:1}}>{card.image&&<span style={{marginRight:4}}>{card.image}</span>}{card.title}</div>
                                <button onClick={()=>setEditCard(card)} style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:13,padding:'0 0 0 6px',flexShrink:0}}>✏️</button>
                              </div>
                              {card.desc&&<div style={{fontSize:11,color:'#888',marginTop:4}}>{card.desc}</div>}
                              <div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>
                                {due&&<span style={{fontSize:9,padding:'2px 5px',borderRadius:4,background:isLate?'rgba(255,107,107,.15)':'rgba(78,205,196,.1)',color:isLate?'#FF6B6B':'#4ECDC4',fontWeight:600}}>📅 {due.toLocaleDateString()}</span>}
                                {card.submittedAt&&<span style={{fontSize:9,color:'#888'}}>✅ {new Date(card.submittedAt).toLocaleDateString()}</span>}
                                {(card.files||[]).length>0&&<span style={{fontSize:9,color:'#FFE66D'}}>📎 {card.files.length}</span>}
                              </div>
                              {(card.files||[]).length>0&&card.files.map((f,i)=>(
                                <a key={i} href={f.dataUrl} download={f.name} style={{fontSize:9,color:'#4ECDC4',textDecoration:'none',display:'block',marginTop:3}}>⬇️ {f.name}</a>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {editCard&&(
                <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
                  <div style={{background:'#0a0f1a',border:'2px solid #4ECDC4',borderRadius:16,padding:24,width:400,maxHeight:'90vh',overflowY:'auto'}}>
                    <h3 style={{margin:'0 0 14px',color:'#4ECDC4',fontSize:15}}>{editCard.id?'Edit Card':'New Card'}</h3>
                    {[['Title','title','text'],['Description','desc','text'],['Emoji/Icon','image','text'],['Due Date','dueDate','date']].map(([l,k,t])=>(
                      <div key={k} style={{marginBottom:10}}>
                        <div style={{fontSize:10,color:'#4ECDC4',fontWeight:700,marginBottom:3,textTransform:'uppercase'}}>{l}</div>
                        <input type={t} value={editCard[k]||''} onChange={e=>setEditCard(p=>({...p,[k]:e.target.value}))} style={{width:'100%',padding:'8px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:8,color:'#fff',fontSize:13}}/>
                      </div>
                    ))}
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:10,color:'#4ECDC4',fontWeight:700,marginBottom:3,textTransform:'uppercase'}}>List</div>
                      <select value={editCard.list||'todo'} onChange={e=>setEditCard(p=>({...p,list:e.target.value}))} style={{width:'100%',padding:'8px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:8,color:'#fff',fontSize:13}}>
                        <option value="todo">To Do</option><option value="inprogress">In Progress</option><option value="done">Done</option>
                      </select>
                    </div>
                    <div style={{display:'flex',gap:8,marginTop:14}}>
                      <button onClick={()=>{if(editCard.id){setCards(p=>p.map(c=>c.id===editCard.id?{...c,...editCard}:c));}else{setCards(p=>[...p,{...editCard,id:'c'+Date.now(),files:[],submittedAt:''}]);}setEditCard(null);}}
                        style={{flex:1,padding:'9px',background:'#4ECDC4',border:'none',borderRadius:8,color:'#111',fontWeight:700,cursor:'pointer'}}>{editCard.id?'Save':'Create'}</button>
                      {editCard.id&&<button onClick={()=>{setCards(p=>p.filter(c=>c.id!==editCard.id));setEditCard(null);}} style={{padding:'9px 12px',background:'rgba(255,107,107,.2)',border:'1px solid #FF6B6B',borderRadius:8,color:'#FF6B6B',fontWeight:700,cursor:'pointer'}}>🗑️</button>}
                      <button onClick={()=>setEditCard(null)} style={{flex:1,padding:'9px',background:'#1a2535',border:'none',borderRadius:8,color:'#fff',fontWeight:700,cursor:'pointer'}}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WHEELS */}
          {adminTab==='wheels'&&(
            <div style={{animation:'fd .25s ease',display:'flex',flexDirection:'column',gap:20}}>
              {[['🎡 Regular Wheel',regSegs,setRegSegs,'#4ECDC4'],['⭐ Elite Wheel',eliteSegs,setEliteSegs,'#FFE66D'],['💎 Ultra Wheel',ultraSegs,setUltraSegs,'#FF8B94']].map(([title,segs,setSegs,accent])=>(
                <div key={title} style={{background:'rgba(255,255,255,.02)',border:'1px solid #1a2535',borderRadius:16,padding:16}}>
                  <h3 style={{margin:'0 0 12px',color:accent,fontSize:14}}>{title}</h3>
                  {segs.map((s,i)=>(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'12px 1fr 1fr 70px 50px 44px 44px 80px',gap:6,alignItems:'center',marginBottom:8}}>
                      <div style={{width:12,height:12,borderRadius:3,background:s.color}}/>
                      <input value={s.label} onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,label:e.target.value}:x))} placeholder="Label" style={{padding:'5px 8px',background:'#080d17',border:'1px solid #1a2535',borderRadius:5,color:'#fff',fontSize:11}}/>
                      <input value={s.val} onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,val:isNaN(e.target.value)?e.target.value:Number(e.target.value)}:x))} placeholder="Value" style={{padding:'5px 8px',background:'#080d17',border:'1px solid #1a2535',borderRadius:5,color:'#fff',fontSize:11}}/>
                      <input type="number" min="1" value={s.weight} onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,weight:Math.max(1,Number(e.target.value)||1)}:x))} style={{padding:'5px 6px',background:'#080d17',border:'1px solid #1a2535',borderRadius:5,color:'#FFE66D',fontSize:11,textAlign:'center'}}/>
                      <input type="color" value={s.color} onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,color:e.target.value}:x))} style={{padding:1,background:'#080d17',border:'1px solid #1a2535',borderRadius:5,height:30,width:44,cursor:'pointer'}}/>
                      <input value={s.emoji||''} onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,emoji:e.target.value}:x))} placeholder="emoji" style={{padding:'5px 4px',background:'#080d17',border:'1px solid #1a2535',borderRadius:5,color:'#fff',fontSize:11,textAlign:'center'}}/>
                      {/* image upload */}
                      <div>
                        <input ref={el=>{if(imgRefs.current)imgRefs.current[`${title}-${i}`]=el;}} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{if(e.target.files[0])uploadSegImg(setSegs,s.id,e.target.files[0]);}}/>
                        <button onClick={()=>imgRefs.current[`${title}-${i}`]?.click()} style={{padding:'5px 6px',background:s.imageUrl&&s.imageUrl.length>10?'rgba(78,205,196,.2)':'rgba(255,255,255,.05)',border:'1px solid #1a2535',borderRadius:5,color:s.imageUrl&&s.imageUrl.length>10?'#4ECDC4':'#555',fontSize:10,cursor:'pointer',width:'100%'}}>
                          {s.imageUrl&&s.imageUrl.length>10?'✓ IMG':'📁 IMG'}
                        </button>
                      </div>
                      <select value={s.type} onChange={e=>setSegs(p=>p.map((x,j)=>j===i?{...x,type:e.target.value}:x))} style={{padding:'5px 4px',background:'#080d17',border:'1px solid #1a2535',borderRadius:5,color:'#fff',fontSize:10}}>
                        <option value="coins">Coins</option><option value="tickets">Tickets</option><option value="elite_ticket">Elite</option><option value="jackpot">Jackpot</option><option value="custom">Custom</option>
                      </select>
                    </div>
                  ))}
                  <div style={{fontSize:10,color:'#444',marginTop:4}}>Weight sum: {segs.reduce((s,x)=>s+x.weight,0)} · {segs.map(s=>((s.weight/segs.reduce((t,x)=>t+x.weight,0))*100).toFixed(1)+'%').join(', ')}</div>
                </div>
              ))}
            </div>
          )}

          {/* ITEM DB */}
          {adminTab==='items'&&<div style={{animation:'fd .25s ease'}}><h2 style={{margin:'0 0 14px',fontSize:17,color:'#FFE66D'}}>🗃️ Item Database</h2><AdminItemDB items={items} setItems={setItems} T={{accent:'#4ECDC4',secondary:'#FFE66D',card:'rgba(255,255,255,.03)',border:'#1a2535',text:'#fff'}}/></div>}

          {/* SHOP */}
          {adminTab==='shop'&&(
            <div style={{animation:'fd .25s ease',display:'flex',flexDirection:'column',gap:14}}>
              <h2 style={{margin:0,fontSize:17,color:'#FFE66D'}}>🛍️ Shop Config</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                {[['Reset Time','shopResetTime','time'],['Min Price','shopPriceMin','number'],['Max Price','shopPriceMax','number']].map(([l,k,t])=>(
                  <div key={k}><div style={{fontSize:10,color:'#4ECDC4',fontWeight:700,marginBottom:4,textTransform:'uppercase'}}>{l}</div>
                  <input type={t} value={admin[k]||''} onChange={e=>setAdmin(p=>({...p,[k]:t==='number'?Number(e.target.value):e.target.value}))} style={{width:'100%',padding:'8px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:8,color:'#fff',fontSize:13}}/></div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {shopStock.map((item,i)=>(
                  <div key={i} style={{background:'rgba(255,255,255,.03)',border:'1px solid #1a2535',borderRadius:12,padding:12}}>
                    {item?(<><div style={{fontSize:22,marginBottom:4}}>{item.imageUrl&&item.imageUrl.length>10?<img src={item.imageUrl} style={{width:28,height:28,objectFit:'contain'}} alt=""/>:item.emoji||'🎁'}</div><div style={{fontSize:11,fontWeight:700,color:RARITY[item.rarity]?.color||'#fff'}}>{item.name}</div><div style={{fontSize:10,color:'#555'}}>{RARITY[item.rarity]?.label}</div><div style={{fontSize:12,color:'#FFE66D',fontWeight:700,marginTop:4}}>{item.shopPrice}💰</div></>):<div style={{color:'#333',fontSize:12,padding:'8px 0'}}>Empty</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLAYER */}
          {adminTab==='player'&&(
            <div style={{animation:'fd .25s ease',display:'flex',flexDirection:'column',gap:14}}>
              <h2 style={{margin:0,fontSize:17,color:'#FFE66D'}}>👤 Player & Friend</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div style={{background:'rgba(255,255,255,.02)',border:'1px solid #1a2535',borderRadius:14,padding:14}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#4ECDC4',marginBottom:10}}>Player</div>
                  {[['Name','name'],['Coins','coins'],['Tickets','tickets'],['Elite Tickets','eliteTickets'],['Boards Done','boardsDone'],['Mine Level','mineLevel'],['Mine Wins','mineWins'],['Mine Losses','mineLosses']].map(([l,k])=>(
                    <div key={k} style={{marginBottom:7}}><div style={{fontSize:10,color:'#888',marginBottom:2}}>{l}</div>
                    <input value={player[k]||''} onChange={e=>setPlayer(p=>({...p,[k]:isNaN(e.target.value)||k==='name'?e.target.value:Number(e.target.value)}))} style={{width:'100%',padding:'6px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:12}}/></div>
                  ))}
                </div>
                <div style={{background:'rgba(255,255,255,.02)',border:'1px solid #1a2535',borderRadius:14,padding:14}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#FFE66D',marginBottom:10}}>Friend (NPC)</div>
                  {[['Name','name'],['Coins','coins'],['Tickets','tickets'],['Elite Tickets','eliteTickets'],['Mine Level','mineLevel'],['Mine Wins','mineWins']].map(([l,k])=>(
                    <div key={k} style={{marginBottom:7}}><div style={{fontSize:10,color:'#888',marginBottom:2}}>{l}</div>
                    <input value={friend[k]||''} onChange={e=>setFriend(p=>({...p,[k]:isNaN(e.target.value)||k==='name'?e.target.value:Number(e.target.value)}))} style={{width:'100%',padding:'6px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:6,color:'#fff',fontSize:12}}/></div>
                  ))}
                  <div style={{fontSize:11,color:'#888',marginTop:10,marginBottom:6}}>Send Gift / Notification</div>
                  <GiftFriend friend={friend} setFriend={setFriend} setPlayer={setPlayer} toast={toast}/>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {adminTab==='settings'&&(
            <div style={{animation:'fd .25s ease',display:'flex',flexDirection:'column',gap:14}}>
              <h2 style={{margin:0,fontSize:17,color:'#FFE66D'}}>⚙️ Settings</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[['Admin Password','password','password'],['Board Name','boardName','text'],['On-time Tickets','onTimeTickets','number'],['Late Tickets (1d)','lateTickets','number'],['Very Late Tickets (2d+)','veryLateTickets','number'],['Mine Coin Cost','minesweeperCost','number'],['Mine Ticket Return','minesweeperReturn','number'],['Ultra Wheel Elite Cost','ultraWheelCost','number'],['Theme Unlock Amt','themeUnlockCost','number'],['Mine Unlock Amt','mineUnlockCost','number'],['Ultra Unlock Amt','ultraUnlockCost','number']].map(([l,k,t])=>(
                  <div key={k}><div style={{fontSize:10,color:'#4ECDC4',fontWeight:700,marginBottom:3,textTransform:'uppercase'}}>{l}</div>
                  <input type={t} value={admin[k]||''} onChange={e=>setAdmin(p=>({...p,[k]:t==='number'?Number(e.target.value):e.target.value}))} style={{width:'100%',padding:'8px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:8,color:'#fff',fontSize:13}}/></div>
                ))}
                {['themeUnlockType','mineUnlockType','ultraUnlockType'].map(k=>(
                  <div key={k}><div style={{fontSize:10,color:'#4ECDC4',fontWeight:700,marginBottom:3,textTransform:'uppercase'}}>{k.replace('UnlockType',' Unlock Currency')}</div>
                  <select value={admin[k]||'tickets'} onChange={e=>setAdmin(p=>({...p,[k]:e.target.value}))} style={{width:'100%',padding:'8px 10px',background:'#080d17',border:'1px solid #1a2535',borderRadius:8,color:'#fff',fontSize:13}}>
                    <option value="tickets">Tickets</option><option value="eliteTickets">Elite Tickets</option><option value="boardsDone">Boards Completed</option>
                  </select></div>
                ))}
              </div>
              <button onClick={()=>{if(window.confirm('Reset ALL player data?'))setPlayer(DEF_PLAYER);}} style={{padding:'8px 16px',background:'rgba(255,107,107,.1)',border:'1px solid #FF6B6B',borderRadius:8,color:'#FF6B6B',fontSize:12,fontWeight:700,cursor:'pointer',width:'fit-content'}}>🗑️ Reset Player</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // EMPLOYEE VIEW
  // ════════════════════════════════════════════════════════════
  return(
    <div style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',paddingBottom:80}}>
      <style>{`*{box-sizing:border-box}body{margin:0}input::placeholder{color:#333}input:focus,select:focus{outline:none;border-color:${T.accent}!important}.bh:hover:not(:disabled){opacity:.88;transform:translateY(-1px)}.ah:hover{opacity:.8}@keyframes pop{0%{opacity:0;transform:translateX(-50%) scale(.75)}100%{opacity:1;transform:translateX(-50%) scale(1)}}@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}@keyframes fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Toast */}
      {/* Secret admin modal (5× logo tap) */}
      {adminModal&&(
        <div style={{position:'fixed',inset:0,zIndex:9000,background:'rgba(0,0,0,.85)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={e=>{if(e.target===e.currentTarget){setAdminModal(false);setAdminModalPw('');}}}>
          <div style={{background:'#0a0f1a',border:`2px solid ${T.accent}`,borderRadius:20,padding:28,width:300,textAlign:'center'}}>
            <div style={{fontSize:36,marginBottom:8}}>🔐</div>
            <div style={{fontSize:15,fontWeight:700,color:T.accent,marginBottom:16}}>Admin Access</div>
            <input type="password" placeholder="Password" autoFocus value={adminModalPw} onChange={e=>setAdminModalPw(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&adminModalPw===admin.password&&(setView('admin'),setAdminModal(false),setAdminModalPw(''))}
              style={{width:'100%',padding:'10px 12px',background:'#080d17',border:`2px solid ${T.border}`,borderRadius:10,color:'#fff',fontSize:14,marginBottom:10,boxSizing:'border-box'}}/>
            <button onClick={()=>{if(adminModalPw===admin.password){setView('admin');setAdminModal(false);setAdminModalPw('');}else{toast('Wrong password','🚫');}}}
              style={{width:'100%',padding:'10px',background:`linear-gradient(135deg,${T.accent},#44A08D)`,border:'none',borderRadius:10,color:'#111',fontSize:14,fontWeight:700,cursor:'pointer'}}>
              Enter Admin
            </button>
          </div>
        </div>
      )}
      {popup&&<div style={{position:'fixed',top:55,left:'50%',transform:'translateX(-50%)',background:'rgba(10,15,26,.97)',border:`2px solid ${T.accent}`,borderRadius:16,padding:'14px 28px',textAlign:'center',zIndex:9999,minWidth:200,boxShadow:`0 8px 40px ${T.accent}44`,animation:'pop .4s ease'}}><div style={{fontSize:popup.big?48:34,marginBottom:4}}>{popup.emoji}</div><div style={{fontSize:popup.big?20:15,fontWeight:800,color:T.secondary}}>{popup.label}</div></div>}

      {/* Equip Overlay */}
      {equipOverlay&&<EquipOverlay category={equipOverlay} player={player} setPlayer={setPlayer} items={items} onClose={()=>setEquipOverlay(null)} T={T}/>}

      {/* Top bar */}
      <div style={{background:'rgba(0,0,0,.3)',backdropFilter:'blur(12px)',borderBottom:`1px solid ${T.border}`,padding:'10px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:50}}>
        <div onClick={handleLogoTap} style={{fontSize:17,fontWeight:800,color:T.accent,cursor:'pointer',userSelect:'none',WebkitTapHighlightColor:'transparent'}} title="DevWheel">
          🎡 DevWheel{logoTaps>0&&logoTaps<5&&<span style={{fontSize:9,color:'#333',marginLeft:4}}>{logoTaps}/5</span>}
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:12,color:T.secondary,fontWeight:700}}>{(player.coins||0).toLocaleString()}💰</span>
          <span style={{fontSize:12,color:T.accent,fontWeight:700}}>🎫{player.tickets||0}</span>
          <span style={{fontSize:12,color:'#FFE66D',fontWeight:700}}>⭐{player.eliteTickets||0}</span>
        </div>
      </div>

      <div style={{maxWidth:700,margin:'0 auto',padding:'16px 16px 0'}}>
        {/* WHEELS */}
        {tab==='wheels'&&(
          <div style={{display:'flex',flexDirection:'column',gap:16,animation:'fd .25s ease'}}>
            {/* Regular */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:16,display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
              <div style={{fontSize:13,fontWeight:700,color:T.accent}}>🎡 Regular Wheel · 🎫{player.tickets||0}</div>
              <div style={{position:'relative'}}><WheelSVG segs={regSegs} rot={regRot} spinning={regSpin} size={240}/><div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',fontSize:24,color:T.accent}}>▼</div></div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap',justifyContent:'center'}}>
                {regSegs.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:3,fontSize:9,color:'#888'}}><div style={{width:7,height:7,borderRadius:2,background:s.color}}/>{s.imageUrl&&s.imageUrl.length>10?<img src={s.imageUrl} style={{width:12,height:12,objectFit:'contain'}} alt=""/>:s.emoji||s.label.slice(0,5)}</div>)}
              </div>
              <button onClick={()=>spin('reg')} disabled={regSpin||(player.tickets||0)<1} className="bh"
                style={{padding:'10px 24px',background:regSpin||(player.tickets||0)<1?'#111':'linear-gradient(135deg,#FFE66D,#FF8B94)',border:'none',borderRadius:12,color:regSpin||(player.tickets||0)<1?'#444':'#111',fontSize:13,fontWeight:700,cursor:regSpin||(player.tickets||0)<1?'not-allowed':'pointer'}}>
                {regSpin?'🌀 Spinning…':'🎫 Use 1 Ticket → SPIN'}
              </button>
            </div>
            {/* Elite */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:16,display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
              <div style={{fontSize:13,fontWeight:700,color:'#FFE66D'}}>⭐ Elite Wheel · ⭐{player.eliteTickets||0}</div>
              <div style={{position:'relative'}}><WheelSVG segs={eliteSegs} rot={elRot} spinning={elSpin} size={240}/><div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',fontSize:24,color:'#FFE66D'}}>▼</div></div>
              <button onClick={()=>spin('elite')} disabled={elSpin||(player.eliteTickets||0)<1} className="bh"
                style={{padding:'10px 24px',background:elSpin||(player.eliteTickets||0)<1?'#111':'linear-gradient(135deg,#FFE66D,#FF6B6B)',border:'none',borderRadius:12,color:elSpin||(player.eliteTickets||0)<1?'#444':'#111',fontSize:13,fontWeight:700,cursor:elSpin||(player.eliteTickets||0)<1?'not-allowed':'pointer'}}>
                {elSpin?'🌀 Spinning…':'⭐ Use 1 Elite Ticket → SPIN'}
              </button>
            </div>
            {/* Ultra */}
            {unlocked.ultraWheel?(
              <div style={{background:'rgba(255,107,107,.06)',border:'1px solid #FF6B6B',borderRadius:20,padding:16,display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
                <div style={{fontSize:13,fontWeight:700,color:'#FF8B94'}}>💎 Ultra Wheel · {admin.ultraWheelCost||1}⭐</div>
                <div style={{position:'relative'}}><WheelSVG segs={ultraSegs} rot={ultraRot} spinning={ultraSpin} size={240}/><div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',fontSize:24,color:'#FF8B94'}}>▼</div></div>
                <button onClick={()=>spin('ultra')} disabled={ultraSpin||(player.eliteTickets||0)<(admin.ultraWheelCost||1)} className="bh"
                  style={{padding:'10px 24px',background:ultraSpin||(player.eliteTickets||0)<(admin.ultraWheelCost||1)?'#111':'linear-gradient(135deg,#FF8B94,#FF6B6B)',border:'none',borderRadius:12,color:'#111',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                  {ultraSpin?'🌀 Spinning…':'💎 ULTRA SPIN'}
                </button>
              </div>
            ):(
              <div style={{background:T.card,border:`2px dashed ${T.border}`,borderRadius:20,padding:24,textAlign:'center',cursor:'pointer'}} onClick={()=>tryUnlock('ultraWheel')}>
                <div style={{fontSize:28,marginBottom:6}}>🔒</div>
                <div style={{fontSize:13,fontWeight:700,color:'#555'}}>Ultra Wheel</div>
                <div style={{fontSize:11,color:'#444',marginTop:3}}>Requires {admin.ultraUnlockCost} {admin.ultraUnlockType} — tap to unlock</div>
              </div>
            )}
          </div>
        )}

        {/* KANBAN */}
        {tab==='kanban'&&(
          <div style={{animation:'fd .25s ease'}}>
            <h2 style={{fontSize:16,margin:'0 0 14px',color:T.accent}}>{admin.boardName||'Dev Board'}</h2>
            <KanbanEmployee cards={cards} setCards={setCards} moveCard={moveCard} kbSkinItem={kbSkinItem} T={T}/>
          </div>
        )}

        {/* SHOP */}
        {tab==='shop'&&(
          <div style={{animation:'fd .25s ease'}}>
            <h2 style={{fontSize:16,margin:'0 0 4px',color:T.accent}}>🛍️ Shop</h2>
            <p style={{fontSize:11,color:'#555',margin:'0 0 14px'}}>Resets daily · {shopStock.filter(Boolean).length} items available</p>
            {unlocked.themes?(
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
                {shopStock.map((item,i)=>{
                  if(!item)return<div key={i} style={{background:T.card,border:`1px dashed ${T.border}`,borderRadius:12,padding:16,minHeight:90,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'#333',fontSize:12}}>—</div></div>;
                  const owned=(player.ownedItems||[]).includes(item.id);
                  const rc=RARITY[item.rarity]?.color||'#fff';
                  const hasImg=item.imageUrl&&item.imageUrl.length>10;
                  return(
                    <div key={i} style={{background:T.card,border:`1px solid ${owned?'#555':T.border}`,borderRadius:12,padding:12,textAlign:'center',opacity:owned?.7:1}}>
                      <div style={{height:36,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:5}}>
                        {hasImg?<img src={item.imageUrl} style={{maxWidth:36,maxHeight:36,objectFit:'contain'}} alt=""/>:<div style={{fontSize:28}}>{item.emoji||'🎁'}</div>}
                      </div>
                      <div style={{fontSize:12,fontWeight:700,color:rc,marginBottom:2}}>{item.name}</div>
                      <div style={{fontSize:9,color:'#555',marginBottom:7}}>{RARITY[item.rarity]?.label}</div>
                      <button onClick={()=>{if(owned)return;if((player.coins||0)<item.shopPrice){alert(`Need ${item.shopPrice} coins!`);return;}setPlayer(p=>({...p,coins:p.coins-item.shopPrice,ownedItems:[...(p.ownedItems||[]),item.id]}));toast(`Bought: ${item.name}!`,'🛍️',true);}}
                        disabled={owned} style={{padding:'6px 12px',background:owned?'#1a2535':(player.coins||0)>=item.shopPrice?`linear-gradient(135deg,${T.accent},${T.secondary})`:'#111',border:'none',borderRadius:8,color:owned?'#555':'#111',fontSize:11,fontWeight:700,cursor:owned?'default':'pointer'}}>
                        {owned?'Owned':`${item.shopPrice}💰`}
                      </button>
                    </div>
                  );
                })}
              </div>
            ):(
              <div style={{textAlign:'center',padding:50,cursor:'pointer'}} onClick={()=>tryUnlock('themes')}>
                <div style={{fontSize:38,marginBottom:8}}>🔒</div>
                <div style={{fontSize:15,fontWeight:700,color:'#555'}}>Shop Locked</div>
                <div style={{fontSize:12,color:'#444',marginTop:5}}>Requires {admin.themeUnlockCost} {admin.themeUnlockType}</div>
              </div>
            )}
          </div>
        )}

        {/* MINESWEEPER */}
        {tab==='minesweeper'&&(
          <div style={{animation:'fd .25s ease'}}>
            {unlocked.minesweeper?(
              <Minesweeper player={player} setPlayer={setPlayer} items={items} adminCfg={admin} T={T} toast={toast}/>
            ):(
              <div style={{textAlign:'center',padding:60,cursor:'pointer'}} onClick={()=>tryUnlock('minesweeper')}>
                <div style={{fontSize:44,marginBottom:10}}>🔒💣</div>
                <div style={{fontSize:16,fontWeight:700}}>Minesweeper Locked</div>
                <div style={{fontSize:12,color:'#555',marginTop:6}}>Requires {admin.mineUnlockCost} {admin.mineUnlockType}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Overlay */}
      {profileOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'flex-end'}} onClick={e=>{if(e.target===e.currentTarget)setProfileOpen(false);}}>
          <div style={{width:'100%',maxWidth:700,margin:'0 auto',background:'rgba(10,15,26,.98)',border:`1px solid ${T.border}`,borderTopLeftRadius:24,borderTopRightRadius:24,padding:20,maxHeight:'85vh',overflowY:'auto',animation:'slideUp .3s ease'}}>
            <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
              {['avatar','style','stats','leaderboard'].map(t=>(
                <button key={t} onClick={()=>setProfileTab(t)} style={{padding:'6px 14px',background:profileTab===t?T.accent:'transparent',border:`1px solid ${profileTab===t?T.accent:T.border}`,borderRadius:20,color:profileTab===t?'#111':T.accent,fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  {t==='avatar'?'👤 Avatar':t==='style'?'🎨 Style':t==='stats'?'📊 Stats':'🏆 Leaderboard'}
                </button>
              ))}
              <button onClick={()=>setProfileOpen(false)} style={{marginLeft:'auto',background:'none',border:'none',color:'#666',fontSize:18,cursor:'pointer'}}>✕</button>
            </div>

            {profileTab==='avatar'&&(
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={{display:'flex',justifyContent:'center',padding:'16px',background:T.card,borderRadius:16,border:`1px solid ${T.border}`}}>
                  <div style={{textAlign:'center'}}>
                    {/* Clickable avatar — click body parts to open equip overlay */}
                    <Avatar player={player} items={items} size={120} onClickPart={(part)=>setEquipOverlay(part)}/>
                    <div style={{fontSize:12,color:'#555',marginTop:8}}>Tap a body part to change outfit</div>
                  </div>
                </div>
                {/* Skin color */}
                <div>
                  <div style={{fontSize:11,color:T.accent,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Skin Color</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {['#FDBCB4','#F5CBA7','#D4A574','#A0522D','#5C3317','#FFEBCD','#FFD5B8'].map(c=>(
                      <div key={c} onClick={()=>setPlayer(p=>({...p,skinColor:c}))} style={{width:24,height:24,borderRadius:'50%',background:c,cursor:'pointer',border:player.skinColor===c?`3px solid ${T.accent}`:'2px solid transparent',transition:'border .2s'}}/>
                    ))}
                  </div>
                </div>
                {/* Quick equip buttons */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                  {[['🎩 Hat','hat'],['👕 Shirt','shirt'],['👖 Pants','pants']].map(([lbl,part])=>(
                    <button key={part} onClick={()=>setEquipOverlay(part)} style={{padding:'10px 8px',background:T.card,border:`1px solid ${T.border}`,borderRadius:12,color:T.accent,fontSize:13,fontWeight:700,cursor:'pointer'}}>
                      {lbl}
                    </button>
                  ))}
                </div>
                {/* Themes & skins are in the 🎨 Style tab */}
                <div style={{fontSize:11,color:'#444',textAlign:'center',padding:'8px 0'}}>
                  Switch to <span onClick={()=>setProfileTab('style')} style={{color:T.accent,cursor:'pointer',fontWeight:700}}>🎨 Style tab</span> to change themes, board skins & mine skins
                </div>
              </div>
            )}

            {profileTab==='style'&&(
              <div style={{display:'flex',flexDirection:'column',gap:18}}>
                {/* Theme selector */}
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.accent,textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>🎨 App Theme</div>
                  {!unlocked.themes&&<div style={{fontSize:12,color:'#555',marginBottom:10}}>Unlock the shop to access themes. Requires {admin.themeUnlockCost} {admin.themeUnlockType}.<br/><span onClick={()=>tryUnlock('themes')} style={{color:T.accent,cursor:'pointer',textDecoration:'underline'}}>Tap to check if unlocked</span></div>}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    {Object.values(THEMES).map(th=>{
                      const isActive=player.equippedTheme===th.id;
                      const isOwned=unlocked.themes||(player.ownedItems||[]).includes(th.id)||th.id==='midnight';
                      return(
                        <div key={th.id} onClick={()=>isOwned&&setPlayer(p=>({...p,equippedTheme:th.id}))}
                          style={{background:th.bg,border:`2px solid ${isActive?th.accent:'transparent'}`,borderRadius:12,padding:'12px 14px',cursor:isOwned?'pointer':'not-allowed',opacity:isOwned?1:.45,position:'relative',transition:'border .2s'}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>{th.name}</div>
                          <div style={{display:'flex',gap:6,marginTop:6}}>
                            <div style={{width:16,height:16,borderRadius:4,background:th.accent}}/>
                            <div style={{width:16,height:16,borderRadius:4,background:th.secondary}}/>
                          </div>
                          {isActive&&<div style={{position:'absolute',top:6,right:8,fontSize:12,color:th.accent,fontWeight:700}}>✓</div>}
                          {!isOwned&&<div style={{position:'absolute',top:6,right:8,fontSize:12}}>🔒</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Kanban board skin */}
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.accent,textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>📋 Kanban Board Style</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    {items.filter(x=>x.type==='kbskin').map(skin=>{
                      const isActive=player.equippedKbSkin===skin.id;
                      const isOwned=(player.ownedItems||[]).includes(skin.id)||skin.cost===0;
                      const hasImg=skin.imageUrl&&skin.imageUrl.length>10;
                      const bannerStyle=hasImg?{backgroundImage:`url(${skin.imageUrl})`,backgroundSize:'cover',backgroundPosition:'center'}:{background:skin.banner||'#1a2535'};
                      return(
                        <div key={skin.id} onClick={()=>isOwned&&setPlayer(p=>({...p,equippedKbSkin:skin.id}))}
                          style={{border:`2px solid ${isActive?T.accent:'transparent'}`,borderRadius:12,overflow:'hidden',cursor:isOwned?'pointer':'not-allowed',opacity:isOwned?1:.45,transition:'border .2s'}}>
                          <div style={{height:36,...bannerStyle,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                            {skin.emoji&&<span style={{fontSize:14}}>{skin.emoji}</span>}
                          </div>
                          <div style={{background:T.card,padding:'6px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <div>
                              <div style={{fontSize:11,fontWeight:700,color:RARITY[skin.rarity]?.color||'#fff'}}>{skin.name}</div>
                              <div style={{fontSize:9,color:'#555'}}>{RARITY[skin.rarity]?.label}</div>
                            </div>
                            {isActive&&<span style={{fontSize:12,color:T.accent,fontWeight:700}}>✓</span>}
                            {!isOwned&&<span style={{fontSize:12}}>🔒 {skin.cost}💰</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Minesweeper skin */}
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.accent,textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>💣 Minesweeper Skin</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    {items.filter(x=>x.type==='msskin').map(skin=>{
                      const isActive=player.equippedMsSkin===skin.id;
                      const isOwned=(player.ownedItems||[]).includes(skin.id)||skin.cost===0;
                      const hasImg=skin.imageUrl&&skin.imageUrl.length>10;
                      return(
                        <div key={skin.id} onClick={()=>isOwned&&setPlayer(p=>({...p,equippedMsSkin:skin.id}))}
                          style={{background:T.card,border:`2px solid ${isActive?T.accent:'transparent'}`,borderRadius:10,padding:8,textAlign:'center',cursor:isOwned?'pointer':'not-allowed',opacity:isOwned?1:.45}}>
                          <div style={{fontSize:20,marginBottom:2}}>{hasImg?<img src={skin.imageUrl} style={{width:22,height:22,objectFit:'contain'}} alt=""/>:skin.emoji||skin.flag}</div>
                          <div style={{fontSize:10,fontWeight:700,color:RARITY[skin.rarity]?.color||'#fff'}}>{skin.name}</div>
                          {isActive&&<div style={{fontSize:9,color:T.accent,fontWeight:700}}>✓ Equipped</div>}
                          {!isOwned&&<div style={{fontSize:9,color:'#555'}}>{skin.cost}💰</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {profileTab==='stats'&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[['Coins',(player.coins||0).toLocaleString(),'💰'],['Tickets',player.tickets,'🎫'],['Elite Tickets',player.eliteTickets,'⭐'],['Boards Done',player.boardsDone,'📋'],['Mine Level',player.mineLevel,'🎮'],['Mine Wins',player.mineWins,'🏆'],['Mine Losses',player.mineLosses,'💥'],['W/L Ratio',player.mineLosses?((player.mineWins||0)/(player.mineLosses||1)).toFixed(2):'∞','📊']].map(([l,v,ic])=>(
                  <div key={l} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:12,textAlign:'center'}}>
                    <div style={{fontSize:20,marginBottom:4}}>{ic}</div>
                    <div style={{fontSize:18,fontWeight:800,color:T.accent}}>{v||0}</div>
                    <div style={{fontSize:10,color:'#555'}}>{l}</div>
                  </div>
                ))}
              </div>
            )}

            {profileTab==='leaderboard'&&(
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[{name:player.name,coins:player.coins,tickets:player.tickets,eliteTickets:player.eliteTickets,isYou:true},{name:friend.name||'Friend',coins:friend.coins,tickets:friend.tickets,eliteTickets:friend.eliteTickets}].sort((a,b)=>(b.coins||0)-(a.coins||0)).map((p,i)=>(
                  <div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'12px 14px',background:T.card,border:`1px solid ${p.isYou?T.accent:T.border}`,borderRadius:12}}>
                    <span style={{fontSize:20}}>{i===0?'🥇':'🥈'}</span>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p.name}{p.isYou?' (You)':''}</div><div style={{fontSize:10,color:'#555'}}>🎫{p.tickets||0} · ⭐{p.eliteTickets||0}</div></div>
                    <div style={{fontSize:16,fontWeight:800,color:T.secondary}}>{(p.coins||0).toLocaleString()}💰</div>
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
          <div style={{width:'100%',maxWidth:700,margin:'0 auto',background:'rgba(10,15,26,.98)',border:`1px solid ${T.border}`,borderTopLeftRadius:24,borderTopRightRadius:24,padding:20,maxHeight:'70vh',overflowY:'auto',animation:'slideUp .3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <h3 style={{margin:0,color:T.accent,fontSize:16}}>👫 {friend.name||'Friend'}</h3>
              <button onClick={()=>setFriendOpen(false)} style={{background:'none',border:'none',color:'#666',fontSize:18,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:14}}>
              {[[(friend.coins||0).toLocaleString(),'💰 Coins',T.secondary],[friend.tickets||0,'🎫 Tickets',T.accent],[friend.eliteTickets||0,'⭐ Elite','#FFE66D']].map(([v,l,c])=>(
                <div key={l} style={{flex:1,background:T.card,borderRadius:10,padding:10,textAlign:'center'}}>
                  <div style={{fontSize:16,fontWeight:800,color:c}}>{v}</div>
                  <div style={{fontSize:10,color:'#555'}}>{l}</div>
                </div>
              ))}
            </div>
            {(friend.messages||[]).length===0&&<div style={{color:'#444',fontSize:13,textAlign:'center',padding:20}}>No messages yet.</div>}
            {(friend.messages||[]).map((m,i)=>(
              <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:10,marginBottom:7}}>
                <div style={{fontSize:13,color:T.secondary,fontWeight:600}}>{m.text}</div>
                <div style={{fontSize:10,color:'#444',marginTop:2}}>{new Date(m.date).toLocaleString()}</div>
              </div>
            ))}
            <button onClick={()=>{setFriend(f=>({...f,messages:(f.messages||[]).map(m=>({...m,read:true}))}));setPlayer(p=>({...p,notifications:(p.notifications||[]).map(n=>({...n,read:true}))}));setFriendOpen(false);}}
              style={{width:'100%',padding:'10px',background:'#1a2535',border:'none',borderRadius:10,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',marginTop:8}}>
              ✓ Mark All Read & Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(5,8,16,.95)',backdropFilter:'blur(16px)',borderTop:`1px solid ${T.border}`,padding:'8px 0 env(safe-area-inset-bottom,8px)',display:'flex',justifyContent:'space-around',alignItems:'center',zIndex:100}}>
        {[['wheels','🎡','Wheels'],['kanban','📋','Tasks'],['shop','🛍️','Shop'],['minesweeper','💣','Mine']].map(([t,ic,lb])=>(
          <button key={t} onClick={()=>setTab(t)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1,background:'none',border:'none',color:tab===t?T.accent:'#555',cursor:'pointer',padding:'4px 10px',transition:'color .2s'}}>
            <span style={{fontSize:20}}>{ic}</span><span style={{fontSize:9,fontWeight:700}}>{lb}</span>
          </button>
        ))}
        <button onClick={()=>{setProfileOpen(o=>!o);setFriendOpen(false);}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1,background:'none',border:'none',color:profileOpen?T.accent:'#555',cursor:'pointer',padding:'4px 10px'}}>
          <span style={{fontSize:20}}>👤</span><span style={{fontSize:9,fontWeight:700}}>Profile</span>
        </button>
        <div style={{position:'relative'}}>
          <button onClick={()=>{setFriendOpen(o=>!o);setProfileOpen(false);}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1,background:'none',border:'none',color:friendOpen?T.accent:'#555',cursor:'pointer',padding:'4px 10px'}}>
            <span style={{fontSize:20}}>👫</span><span style={{fontSize:9,fontWeight:700}}>Friends</span>
          </button>
          {friendUnread>0&&<div style={{position:'absolute',top:2,right:8,width:9,height:9,borderRadius:'50%',background:'#FF6B6B'}}/>}
        </div>
      </div>
    </div>
  );
}
