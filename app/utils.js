// ── STORAGE ABSTRACTION ──────────────────────────────────────────────────────
// Tries Claude artifact storage first, falls back to localStorage
const hasArtifactStorage = () => typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function';

export const db = {
  get: async (k, d) => {
    if(hasArtifactStorage()){ 
      try { 
        const r = await window.storage.get(k); 
        return r ? JSON.parse(r.value) : d; 
      } catch {} 
    }
    try { 
      const v = localStorage.getItem(k); 
      return v ? JSON.parse(v) : d; 
    } catch { 
      return d; 
    }
  },
  set: async (k, v) => {
    const s = JSON.stringify(v);
    if(hasArtifactStorage()){ 
      try { 
        await window.storage.set(k, s); 
      } catch {} 
    }
    try { 
      localStorage.setItem(k, s); 
    } catch {}
  },
  getImg: async (id) => {
    if(hasArtifactStorage()){ 
      try { 
        const r = await window.storage.get(`img-${id}`); 
        if(r?.value) return r.value; 
      } catch {} 
    }
    try { 
      return localStorage.getItem(`img-${id}`) || ''; 
    } catch { 
      return ''; 
    }
  },
  setImg: async (id, url) => {
    if(hasArtifactStorage()){ 
      try { 
        await window.storage.set(`img-${id}`, url); 
      } catch {} 
    }
    try { 
      localStorage.setItem(`img-${id}`, url); 
    } catch {}
  },
};

// ── WEIGHTED SELECTION ───────────────────────────────────────────────────────
export function pickWeighted(segs) {
  const total = segs.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for(let i = 0; i < segs.length; i++) {
    r -= segs[i].weight;
    if(r <= 0) return i;
  }
  return segs.length - 1;
}

// ── WHEEL ROTATION MATH ──────────────────────────────────────────────────────
export function calcRot(currentRot, selectedIndex, segmentCount) {
  const segmentAngle = 360 / segmentCount;
  const segmentCenter = selectedIndex * segmentAngle + segmentAngle / 2;
  const baseRotation = (270 - segmentCenter + 720) % 360;
  const currentMod = ((currentRot % 360) + 360) % 360;
  let delta = baseRotation - currentMod;
  if(delta < 0) delta += 360;
  if(delta < 30) delta += 360;
  return currentRot + delta + 6 * 360;
}

// ── GRAVITY & PHYSICS ENGINE FOR FLOATING EMOJIS ─────────────────────────────
// Applies acceleration, velocity, collision with bounds
export function updateGravity(emoji, elapsed) {
  // gravity: 400 px/s²
  const GRAVITY = 400;
  const BOUNCE = 0.7;
  const FRICTION = 0.99;
  const GROUND = typeof window !== 'undefined' ? window.innerHeight : 800;
  
  // Update velocity
  let vy = emoji.vy || 0;
  vy += GRAVITY * (elapsed / 1000); // Convert to seconds
  
  // Apply friction
  let vx = (emoji.vx || 0) * FRICTION;
  
  // Update position
  let y = (emoji.y || 50) + vy * (elapsed / 1000);
  let x = (emoji.x || 100) + vx * (elapsed / 1000);
  
  // Clamp to bounds (with 40px padding for emoji size)
  const maxX = window.innerWidth - 40;
  const maxY = GROUND - 40;
  
  if(x < 0) { x = 0; vx = Math.abs(vx) * 0.5; }
  if(x > maxX) { x = maxX; vx = -Math.abs(vx) * 0.5; }
  
  // Bottom collision (bounce)
  if(y > maxY) {
    y = maxY;
    vy = -vy * BOUNCE;
    if(Math.abs(vy) < 10) vy = 0; // Stop bouncing if nearly still
  }
  
  return { x, y, vx, vy };
}

// ── RANDOM HORSE NAME PICKER ────────────────────────────────────────────────
export function getRandomHorseName(names) {
  return names[Math.floor(Math.random() * names.length)];
}

// ── SHOP STOCK GENERATION ───────────────────────────────────────────────────
export function genShopStock(items, lastReset, resetTime, priceMin, priceMax, player) {
  const now = new Date();
  const [rh, rm] = resetTime.split(':').map(Number);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const resetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), rh, rm);
  
  // If reset time hasn't passed yet, use yesterday's reset
  if(now < resetDate) {
    resetDate.setDate(resetDate.getDate() - 1);
  }
  
  const lastResetDate = lastReset ? new Date(lastReset) : new Date(0);
  
  // Only regenerate if reset time has passed
  if(resetDate <= lastResetDate) return null;
  
  // Generate 8 random items
  const shopItems = items
    .filter(x => !player?.ownedItems?.includes(x.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 8)
    .map(item => ({
      ...item,
      shopPrice: Math.floor(Math.random() * (priceMax - priceMin + 1) + priceMin),
    }));
  
  return { stock: shopItems, resetDate: resetDate.toISOString() };
}

// ── GENERATE RANDOM PLINKO HORSE ────────────────────────────────────────────
export function getRandomPlinkoHorse(horseNames) {
  return {
    name: getRandomHorseName(horseNames),
    color: ['#FFD700', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6'][Math.floor(Math.random() * 5)],
    speed: 0.5 + Math.random() * 0.5, // 0.5 - 1.0
  };
}

// ── FORMAT NUMBERS ──────────────────────────────────────────────────────────
export function formatNumber(n) {
  if(n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if(n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}
