import React, { useState, useEffect } from 'react';
import { LAYERS } from './data.js';

// ── AVATAR SVG RENDERER ──────────────────────────────────────────────────────
export function AvatarSVG({ player, items, size = 120 }) {
  const hatItem = items.find(x => x.id === player.equippedHat);
  const shirtItem = items.find(x => x.id === player.equippedShirt);
  const pantsItem = items.find(x => x.id === player.equippedPants);

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ background: 'transparent' }}>
      {/* Head */}
      <circle cx="60" cy="35" r="20" fill={player.skinColor} stroke="#ccc" strokeWidth="0.5" />
      
      {/* Eyes */}
      <circle cx="54" cy="32" r="2" fill="#333" />
      <circle cx="66" cy="32" r="2" fill="#333" />
      
      {/* Body */}
      <rect
        x={LAYERS.shirt.x}
        y={LAYERS.shirt.y}
        width={LAYERS.shirt.w}
        height={LAYERS.shirt.h}
        fill={shirtItem?.bodyColor || '#4ECDC4'}
        rx="4"
      />
      
      {/* Legs */}
      <rect
        x={LAYERS.pants.x}
        y={LAYERS.pants.y}
        width={LAYERS.pants.w}
        height={LAYERS.pants.h}
        fill={pantsItem?.bodyColor || '#555'}
        rx="4"
      />
      
      {/* Hat (on top of head) */}
      {hatItem && hatItem.id !== 'hat_none' && (
        <text
          x="60"
          y="12"
          fontSize="20"
          textAnchor="middle"
          fill="none"
          dominantBaseline="middle"
        >
          {hatItem.emoji}
        </text>
      )}
    </svg>
  );
}

// ── TOAST POPUP ──────────────────────────────────────────────────────────────
export function ToastPopup({ popup, T }) {
  if(!popup) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: T.card,
      border: `2px solid ${T.accent}`,
      borderRadius: 16,
      padding: '20px 40px',
      textAlign: 'center',
      zIndex: 10000,
      fontSize: popup.big ? 28 : 20,
      color: T.text,
      fontWeight: 700,
      animation: 'fadeInOut 0.3s ease',
      boxShadow: `0 8px 32px rgba(78,205,196,0.2)`,
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{popup.emoji}</div>
      {popup.label}
    </div>
  );
}

// ── BOUNCING PET COMPONENT ───────────────────────────────────────────────────
export function PetBouncer({ pet, petItem }) {
  const [bounceOffset, setBounceOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBounceOffset(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if(!petItem) return null;

  const bounce = Math.sin((bounceOffset / 100) * Math.PI * 2) * 5;

  return (
    <div style={{
      position: 'absolute',
      bottom: `${20 + bounce}px`,
      right: 20,
      fontSize: 48,
      cursor: 'pointer',
      zIndex: 100,
      userSelect: 'none',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
    }}>
      {petItem.emoji}
    </div>
  );
}

// ── STATUS LINE (coins, tickets, pet effects, streak) ────────────────────────
export function StatusLine({ player, items, admin, T }) {
  const petItem = items.find(x => x.id === player.equippedPet);
  const getCoinMult = () => {
    let m = 1;
    const ic = (player.ownedItems || []).length;
    if(ic >= (admin.lbMinItems || 15)) m *= (admin.lbMult || 1.25);
    if(petItem?.effect === 'coins_mult') m *= (petItem.effectVal || 1);
    return m;
  };

  const coinMult = getCoinMult();
  const streakBonus = player.streak > 0 ? Math.floor(player.streak / 7) * (admin.streakBonus || 1) : 0;

  return (
    <div style={{
      display: 'flex',
      gap: 16,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '12px 0',
      fontSize: 14,
      color: T.text,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>💰 Coins</span>
        {coinMult > 1 && <span style={{ color: T.accent, fontWeight: 700 }}>x{coinMult.toFixed(1)}</span>}
      </div>

      {streakBonus > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🔥 Day {player.streak}</span>
          <span style={{ color: '#FFD700', fontWeight: 700 }}>+{streakBonus} 🎫</span>
        </div>
      )}

      {petItem && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{petItem.emoji} {petItem.name}</span>
          <span style={{ color: T.accent, fontWeight: 700 }}>{petItem.desc}</span>
        </div>
      )}
    </div>
  );
}

// ── STAT BOX ─────────────────────────────────────────────────────────────────
export function StatBox({ label, value, emoji, T }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: '12px 16px',
      textAlign: 'center',
      minWidth: 80,
    }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.accent }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

// ── WHEEL SPINNER VISUAL ─────────────────────────────────────────────────────
export function WheelSpinner({ segments, rotation, radius = 150 }) {
  const segmentAngle = 360 / segments.length;
  const colors = segments.map(s => s.color || '#4ECDC4');

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 3.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
    >
      {segments.map((seg, i) => {
        const startAngle = (i * segmentAngle) * (Math.PI / 180);
        const endAngle = ((i + 1) * segmentAngle) * (Math.PI / 180);

        const x1 = radius + radius * Math.cos(startAngle);
        const y1 = radius + radius * Math.sin(startAngle);
        const x2 = radius + radius * Math.cos(endAngle);
        const y2 = radius + radius * Math.sin(endAngle);

        const largeArc = segmentAngle > 180 ? 1 : 0;
        const path = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

        return (
          <path
            key={i}
            d={path}
            fill={colors[i]}
            stroke="#111"
            strokeWidth="1"
            opacity="0.85"
          />
        );
      })}

      {/* Center circle */}
      <circle cx={radius} cy={radius} r="15" fill="#111" />
    </svg>
  );
}
