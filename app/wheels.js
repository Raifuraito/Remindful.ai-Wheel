import React, { useState, useEffect } from 'react';
import { pickWeighted, calcRot, getRandomPlinkoHorse, formatNumber } from './utils.js';

// ── SPIN WHEEL LOGIC ─────────────────────────────────────────────────────────
export function spinWheel(type, player, admin, items, regSegs, eliteSegs, ultraSegs, setPlayer, toast, awardCoins, getTicketBonus) {
  // Check if already spinning
  return new Promise((resolve) => {
    const segs = type === 'reg' ? regSegs : type === 'elite' ? eliteSegs : ultraSegs;
    const cost = type === 'reg' ? 1 : type === 'elite' ? 1 : (admin.ultraWheelCost || 1);
    const currency = type === 'reg' ? 'tickets' : 'eliteTickets';

    if((player[currency] || 0) < cost) {
      alert(`Need ${cost} ${currency}!`);
      resolve(null);
      return;
    }

    setPlayer(p => ({ ...p, [currency]: p[currency] - cost }));

    const selectedIndex = pickWeighted(segs);
    const segment = segs[selectedIndex];
    const newRotation = calcRot(0, selectedIndex, segs.length);

    // Spin animation takes 3.7s
    setTimeout(() => {
      if(segment.type === 'coins' || segment.type === 'jackpot') {
        const earned = awardCoins(segment.val);
        setPlayer(p => ({ ...p, coins: p.coins + earned }));
        toast(`+${formatNumber(earned)} Coins`, segment.type === 'jackpot' ? '💎' : '💰', segment.type === 'jackpot');
      } else if(segment.type === 'tickets') {
        setPlayer(p => ({ ...p, tickets: (p.tickets || 0) + segment.val }));
        toast(`+${segment.val} Tickets`, '🎫');
      } else if(segment.type === 'elite_ticket') {
        setPlayer(p => ({ ...p, eliteTickets: (p.eliteTickets || 0) + 1 }));
        toast('⭐ ELITE TICKET!', '🌟', true);
      } else if(segment.type === 'custom') {
        toast(type === 'ultra' ? `🎁 ${segment.val}` : String(segment.val), '🎁', true);
      }

      resolve({ index: selectedIndex, segment, rotation: newRotation });
    }, 3700);
  });
}

// ── PLINKO HORSE ANIMATION ───────────────────────────────────────────────────
export function PlinkoHorse({ horse, onComplete }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds down the plinko board
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);

      // Simulate bouncing down plinko board
      const x = Math.sin(p * Math.PI * 4) * 80;
      const y = p * 400;

      setPosition({ x, y });
      setProgress(p);

      if(p < 1) {
        requestAnimationFrame(animate);
      } else {
        // Play cheering sound
        playPlinkoCheers();
        setTimeout(() => onComplete(horse), 500);
      }
    };

    requestAnimationFrame(animate);
  }, [horse, onComplete]);

  return (
    <div style={{
      position: 'absolute',
      left: `calc(50% + ${position.x}px)`,
      top: `${position.y}px`,
      transform: 'translateX(-50%)',
      fontSize: 48,
      zIndex: 50,
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
    }}>
      🐴
    </div>
  );
}

// ── PLINKO BOARD VISUAL ──────────────────────────────────────────────────────
export function PlinkoBoardVisual({ T }) {
  // Simple plinko pegs grid
  const pegs = [];
  for(let row = 0; row < 6; row++) {
    for(let col = 0; col < 5 + row % 2; col++) {
      const x = 100 + col * 60 + (row % 2) * 30;
      const y = 80 + row * 60;
      pegs.push({ x, y, id: `peg-${row}-${col}` });
    }
  }

  return (
    <svg width="500" height="500" style={{ background: T.card, borderRadius: 12, border: `2px solid ${T.border}` }}>
      {/* Pegs */}
      {pegs.map(peg => (
        <circle key={peg.id} cx={peg.x} cy={peg.y} r="8" fill={T.accent} opacity="0.6" />
      ))}

      {/* Slots at bottom for results */}
      {[0, 1, 2, 3, 4].map(i => (
        <rect
          key={`slot-${i}`}
          x={80 + i * 80}
          y="420"
          width="70"
          height="50"
          fill="transparent"
          stroke={T.accent}
          strokeWidth="2"
          rx="4"
        />
      ))}
    </svg>
  );
}

// ── CHEERING SOUND EFFECT (using Web Audio API) ──────────────────────────────
export function playPlinkoCheers() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;

    // Simple "cheering" synth notes
    const notes = [523.25, 659.25, 783.99]; // C, E, G
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(audioContext.destination);

      gain.gain.setValueAtTime(0.1, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.2);
    });
  } catch (e) {
    // Audio API not available, silently fail
  }
}

// ── PLINKO GAME COMPONENT ────────────────────────────────────────────────────
export function PlinkoGameModal({ T, player, admin, items, onClose, onReward }) {
  const [horse, setHorse] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const handleSpin = () => {
    if(spinning) return;
    if((player.coins || 0) < (admin.plinkoCost || 100)) {
      alert(`Need ${admin.plinkoCost || 100} coins!`);
      return;
    }

    setSpinning(true);
    const newHorse = getRandomPlinkoHorse(['🐴', '🦄', '🐎']);
    setHorse(newHorse);

    // Simulate plinko result after animation
    setTimeout(() => {
      const winAmount = Math.floor(Math.random() * 500 + 50);
      setResult({ horse: newHorse, winAmount });
      onReward(winAmount);
      setSpinning(false);
    }, 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: T.card,
        border: `2px solid ${T.accent}`,
        borderRadius: 16,
        padding: 32,
        maxWidth: 600,
        textAlign: 'center',
        color: T.text,
      }}>
        <h2 style={{ fontSize: 24, marginBottom: 20 }}>🎰 Plinko with a Horse</h2>

        <div style={{ position: 'relative', minHeight: 500, marginBottom: 20 }}>
          <PlinkoBoardVisual T={T} />
          {horse && <PlinkoHorse horse={horse} onComplete={() => {}} />}
        </div>

        {result && (
          <div style={{ fontSize: 18, color: T.accent, marginBottom: 16, fontWeight: 700 }}>
            🎉 {result.horse.name} won {formatNumber(result.winAmount)} coins!
          </div>
        )}

        <button
          onClick={handleSpin}
          disabled={spinning || (player.coins || 0) < (admin.plinkoCost || 100)}
          style={{
            padding: '12px 24px',
            background: spinning ? '#666' : T.accent,
            border: 'none',
            borderRadius: 8,
            color: '#111',
            fontWeight: 700,
            cursor: spinning ? 'default' : 'pointer',
            marginRight: 12,
          }}
        >
          {spinning ? '🐴 Running...' : '🎰 Spin (-' + (admin.plinkoCost || 100) + ' coins)'}
        </button>

        <button
          onClick={onClose}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.text,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
