import React, { useEffect, useRef, useState } from 'react';
import { updateGravity } from './utils.js';

// ── FLOATING EMOJI WITH GRAVITY ──────────────────────────────────────────────
export function FloatingEmoji({ emoji, onCollect, onRemove }) {
  const divRef = useRef(null);
  const [pos, setPos] = useState({ x: emoji.x || Math.random() * 300, y: emoji.y || 50 });
  const [vel, setVel] = useState({ vx: emoji.vx || (Math.random() - 0.5) * 100, vy: emoji.vy || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  // Physics loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if(!isDragging) {
        const updated = updateGravity({ x: pos.x, y: pos.y, vx: vel.vx, vy: vel.vy }, elapsed);
        setPos({ x: updated.x, y: updated.y });
        setVel({ vx: updated.vx, vy: updated.vy });
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isDragging, pos, vel]);

  // Timeout for removal
  useEffect(() => {
    const timer = setTimeout(() => onRemove(emoji.id), emoji.durationMs || 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [emoji.id, emoji.durationMs, onRemove]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = divRef.current?.getBoundingClientRect();
    setDragOffset({ x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) });
  };

  const handleMouseMove = (e) => {
    if(!isDragging) return;
    setPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    onCollect(emoji.id, emoji.tickets);
    onRemove(emoji.id);
  };

  useEffect(() => {
    if(isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={divRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        fontSize: 48,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: 9999,
        transition: isDragging ? 'none' : 'filter 0.1s',
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
      }}
    >
      {emoji.emoji}
    </div>
  );
}

// ── EMOJI CONTAINER ─────────────────────────────────────────────────────────
export function FloatingEmojisContainer({ floatingEmojis, onCollect, onRemove }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9998 }}>
      <div style={{ pointerEvents: 'auto', position: 'absolute', inset: 0 }}>
        {floatingEmojis.map(e => (
          <FloatingEmoji
            key={e.id}
            emoji={e}
            onCollect={onCollect}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

// ── FLOATING EMOJI CONTROLLER HOOK ──────────────────────────────────────────
export function useFloatingEmojis(setPlayer) {
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  const handleCollectEmoji = (emojiId, tickets) => {
    setPlayer(p => ({ ...p, tickets: (p.tickets || 0) + tickets }));
  };

  const handleRemoveEmoji = (emojiId) => {
    setFloatingEmojis(prev => prev.filter(e => e.id !== emojiId));
  };

  return {
    floatingEmojis,
    setFloatingEmojis,
    handleCollectEmoji,
    handleRemoveEmoji,
  };
}
