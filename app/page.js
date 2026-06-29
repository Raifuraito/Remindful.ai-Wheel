'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  THEMES, RARITY, LAYERS, BASE_ITEMS, DEF_P, DEF_F, DEF_CARDS, DEF_REG, DEF_ELITE, DEF_ULTRA, DEF_ADMIN, DEF_UNLOCKED,
  MINE_LVL_REQ, PLINKO_MULTS, PLINKO_COLORS, HORSE_NAMES,
} from './data.js';
import { db, pickWeighted, calcRot, genShopStock, getRandomPlinkoHorse, formatNumber } from './utils.js';
import { FloatingEmojisContainer, useFloatingEmojis } from './emojis.js';
import { AvatarSVG, ToastPopup, PetBouncer, StatusLine, StatBox, WheelSpinner } from './components.js';
import { spinWheel, PlinkoGameModal } from './wheels.js';
import { MinesweeperGame, MinesweeperInfo } from './minesweeper.js';
import { AdminPanel } from './admin.js';
import { FileUploadManager, BoardFilesSection } from './upload.js';
import { ErrorBoundary } from './optimizations.js';
import { LoadingSpinner, ErrorBanner, ConfirmModal, Badge } from './polish.js';

function DevWheelContent() {
  // ── CORE STATE ──────────────────────────────────────────────────────────────
  const [ok, setOk] = useState(false);
  const [view, setView] = useState('admin-login');
  const [tab, setTab] = useState('wheels');
  const [adminTab, setAdminTab] = useState('kanban');
  const [popup, setPopup] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [friendOpen, setFriendOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('avatar');
  const [equipOverlay, setEquipOverlay] = useState(null);
  const [logoTaps, setLogoTaps] = useState(0);
  const [logoTimer, setLogoTimer] = useState(null);
  const [adminModal, setAdminModal] = useState(false);
  const [adminModalPw, setAdminModalPw] = useState('');

  // ── DATA STATE ──────────────────────────────────────────────────────────────
  const [player, setPlayer] = useState(DEF_P);
  const [friend, setFriend] = useState(DEF_F);
  const [cards, setCards] = useState(DEF_CARDS);
  const [items, setItems] = useState(BASE_ITEMS);
  const [regSegs, setRegSegs] = useState(DEF_REG);
  const [eliteSegs, setEliteSegs] = useState(DEF_ELITE);
  const [ultraSegs, setUltraSegs] = useState(DEF_ULTRA);
  const [shop, setShop] = useState({ stock: [], lastReset: '', resetTime: '09:00', priceMin: 10, priceMax: 200 });
  const [admin, setAdmin] = useState(DEF_ADMIN);
  const [unlocked, setUnlocked] = useState(DEF_UNLOCKED);

  // ── WHEEL & GAME STATE ──────────────────────────────────────────────────────
  const [regRot, setRegRot] = useState(0);
  const [elRot, setElRot] = useState(0);
  const [ultraRot, setUltraRot] = useState(0);
  const [regSpin, setRegSpin] = useState(false);
  const [elSpin, setElSpin] = useState(false);
  const [ultraSpin, setUltraSpin] = useState(false);
  const [plinkOpen, setPlinkOpen] = useState(false);
  const [mineOpen, setMineOpen] = useState(false);

  // ── ADMIN STATE ─────────────────────────────────────────────────────────────
  const [adminPwInput, setAdminPwInput] = useState('');
  const [editCard, setEditCard] = useState(null);
  const [dragCard, setDragCard] = useState(null);
  const [shopStock, setShopStock] = useState([]);

  // ── FLOATING EMOJIS ────────────────────────────────────────────────────────
  const { floatingEmojis, setFloatingEmojis, handleCollectEmoji, handleRemoveEmoji } = useFloatingEmojis(setPlayer);

  // ── DATA LOAD ───────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const p = await db.get('dw-player', DEF_P);
      const f = await db.get('dw-friend', DEF_F);
      const c = await db.get('dw-cards', DEF_CARDS);
      const it = await db.get('dw-items', BASE_ITEMS);
      const rs = await db.get('dw-regsegs', DEF_REG);
      const es = await db.get('dw-elsegs', DEF_ELITE);
      const us = await db.get('dw-ultrasegs', DEF_ULTRA);
      const sh = await db.get('dw-shop', { stock: [], lastReset: '' });
      const ad = await db.get('dw-admin', DEF_ADMIN);
      const ul = await db.get('dw-unlocked', DEF_UNLOCKED);

      // Load images
      const itI = await Promise.all(it.map(async (item) => {
        if(!item.imageUrl || item.imageUrl.length < 10) {
          const img = await db.getImg(item.id);
          return { ...item, imageUrl: img };
        }
        return item;
      }));

      const lsi = async (segs) => Promise.all(segs.map(async (s) => {
        if(!s.imageUrl || s.imageUrl.length < 10) {
          const img = await db.getImg(`seg-${s.id}`);
          return { ...s, imageUrl: img };
        }
        return s;
      }));

      const pp = { ...DEF_P, ...p };
      setPlayer(pp);
      setFriend({ ...DEF_F, ...f });
      setCards(c);
      setItems(itI.length ? itI : BASE_ITEMS);
      setRegSegs(await lsi(rs));
      setEliteSegs(await lsi(es));
      setUltraSegs(await lsi(us));
      setShop(sh);
      setAdmin({ ...DEF_ADMIN, ...ad });
      setUnlocked({ ...DEF_UNLOCKED, ...ul });

      // Generate shop stock
      const sr = genShopStock(itI, sh.lastReset, sh.resetTime || ad.shopResetTime, sh.priceMin || ad.shopPriceMin, sh.priceMax || ad.shopPriceMax, pp);
      if(sr) {
        const ns = { ...sh, stock: sr.stock, lastReset: sr.resetDate };
        setShop(ns);
        await db.set('dw-shop', ns);
        setShopStock(sr.stock);
      } else {
        setShopStock(sh.stock || []);
      }

      setOk(true);
    })();
  }, []);

  // ── PERSIST STATE ───────────────────────────────────────────────────────────
  useEffect(() => { if(ok) db.set('dw-player', player); }, [player, ok]);
  useEffect(() => { if(ok) db.set('dw-friend', friend); }, [friend, ok]);
  useEffect(() => { if(ok) db.set('dw-cards', cards); }, [cards, ok]);
  useEffect(() => { if(ok) db.set('dw-items', items); }, [items, ok]);
  useEffect(() => { if(ok) { db.set('dw-regsegs', regSegs); db.set('dw-elsegs', eliteSegs); db.set('dw-ultrasegs', ultraSegs); } }, [regSegs, eliteSegs, ultraSegs, ok]);
  useEffect(() => { if(ok) db.set('dw-shop', shop); }, [shop, ok]);
  useEffect(() => { if(ok) db.set('dw-admin', admin); }, [admin, ok]);
  useEffect(() => { if(ok) db.set('dw-unlocked', unlocked); }, [unlocked, ok]);

  // ── DAILY STREAK ────────────────────────────────────────────────────────────
  useEffect(() => {
    if(!ok || view !== 'employee') return;
    const today = new Date().toDateString();
    if(player.lastLoginDate === today) return;
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const isConsec = player.lastLoginDate === yest.toDateString();
    const ns = isConsec ? (player.streak || 0) + 1 : 1;
    const bonus = isConsec ? Math.floor(ns / 7) * (admin.streakBonus || 1) : 0;
    setPlayer(p => ({ ...p, lastLoginDate: today, streak: ns, tickets: (p.tickets || 0) + bonus }));
    if(isConsec && ns > 1) toast(`🔥 Day ${ns} streak!${bonus ? ` +${bonus} 🎫` : ''}`, '🔥', ns % 7 === 0);
  }, [ok, view]);

  // ── PEEPER 👀 (once per day, draggable, gravity, clickable) ──────────────────
  useEffect(() => {
    if(!ok || view !== 'employee') return;
    const today = new Date().toDateString();
    if(player.lastPeeperDate === today) return;
    setPlayer(p => ({ ...p, lastPeeperDate: today }));
    if(Math.random() * 100 < (admin.peeperChance || 30)) {
      setTimeout(() => {
        setFloatingEmojis(e => [...e, {
          id: 'p_' + Date.now(),
          emoji: '👀',
          tickets: admin.peeperTickets || 3,
          durationMs: admin.peeperDurationMs || 5 * 60 * 1000,
          x: Math.random() * 300,
          y: 50,
          vx: 0,
          vy: 0,
        }]);
      }, 2000);
    }
  }, [ok, view, admin]);

  // ── EGGPLANT 🍆 (on card submit, draggable, gravity) ─────────────────────────
  // Triggered in moveCard()

  // ── FLUSHED 😳 (every hour, draggable, gravity) ──────────────────────────────
  useEffect(() => {
    if(!ok || view !== 'employee') return;
    const iv = setInterval(() => {
      if(Math.random() * 100 < (admin.flushedChance || 15)) {
        setFloatingEmojis(e => [...e, {
          id: 'f_' + Date.now(),
          emoji: '😳',
          tickets: admin.flushedTickets || 8,
          durationMs: admin.flushedDurationMs || 15 * 60 * 1000,
          x: Math.random() * 300,
          y: 50,
          vx: 0,
          vy: 0,
        }]);
      }
    }, 60 * 60 * 1000);
    return () => clearInterval(iv);
  }, [ok, view, admin]);

  // ── PET COINS/MIN ───────────────────────────────────────────────────────────
  useEffect(() => {
    if(!ok || view !== 'employee') return;
    const pet = items.find(x => x.id === player.equippedPet);
    if(!pet || pet.effect !== 'coins_min') return;
    const iv = setInterval(() => setPlayer(p => ({ ...p, coins: p.coins + (pet.effectVal || 0) })), 60000);
    return () => clearInterval(iv);
  }, [ok, view, player.equippedPet, items]);

  // ── HELPERS ─────────────────────────────────────────────────────────────────
  const T = THEMES[player.equippedTheme] || THEMES.midnight;

  const getCoinMult = useCallback(() => {
    let m = 1;
    const ic = (player.ownedItems || []).length;
    if(ic >= (admin.lbMinItems || 15)) m *= (admin.lbMult || 1.25);
    const pet = items.find(x => x.id === player.equippedPet);
    if(pet?.effect === 'coins_mult') m *= (pet.effectVal || 1);
    return m;
  }, [player.ownedItems, player.equippedPet, admin.lbMinItems, admin.lbMult, items]);

  const awardCoins = useCallback(amount => Math.round(amount * getCoinMult()), [getCoinMult]);

  const getTicketBonus = useCallback(() => {
    const pet = items.find(x => x.id === player.equippedPet);
    return pet?.effect === 'ticket_bonus' && Math.random() < (pet.effectVal || 0) ? 1 : 0;
  }, [player.equippedPet, items]);

  const toast = (label, emoji, big = false) => {
    setPopup({ label, emoji, big });
    setTimeout(() => setPopup(null), big ? 4000 : 2800);
  };

  const handleLogoTap = () => {
    setLogoTaps(n => {
      const next = n + 1;
      if(logoTimer) clearTimeout(logoTimer);
      const t = setTimeout(() => setLogoTaps(0), 2500);
      setLogoTimer(t);
      if(next >= 5) { setAdminModal(true); return 0; }
      return next;
    });
  };

  const handleWheelSpin = async (type) => {
    if(regSpin || elSpin || ultraSpin) return;
    const setSpin = type === 'reg' ? setRegSpin : type === 'elite' ? setElSpin : setUltraSpin;
    const setRot = type === 'reg' ? setRegRot : type === 'elite' ? setElRot : setUltraRot;
    const prevRot = type === 'reg' ? regRot : type === 'elite' ? elRot : ultraRot;

    setSpin(true);
    const result = await spinWheel(type, player, admin, items, regSegs, eliteSegs, ultraSegs, setPlayer, toast, awardCoins, getTicketBonus);
    setRot(result?.rotation || prevRot);
    setSpin(false);
  };

  const moveCard = (cardId, newList) => {
    const card = cards.find(c => c.id === cardId);
    if(!card || card.list === newList) return;

    if(newList === 'done') {
      const now = new Date();
      const due = card.dueDate ? new Date(card.dueDate) : null;
      let tix = admin.onTimeTickets ?? 2;
      if(due) {
        const d = (now - due) / 86400000;
        if(d > 2) tix = admin.veryLateTickets ?? 0;
        else if(d > 0) tix = admin.lateTickets ?? 1;
      }
      const bonus = getTicketBonus();
      const total = tix + bonus;
      setPlayer(p => ({ ...p, tickets: (p.tickets || 0) + total, boardsDone: (p.boardsDone || 0) + 1 }));
      if(total > 0) toast(`+${total} 🎫${bonus ? ' (pet!)' : ''}`, '🎫');
      else toast('Late — no tickets', '😔');

      // Trigger eggplant emoji
      if(Math.random() * 100 < (admin.eggplantChance || 20)) {
        setTimeout(() => {
          setFloatingEmojis(e => [...e, {
            id: 'e_' + Date.now(),
            emoji: '🍆',
            tickets: admin.eggplantTickets || 5,
            durationMs: admin.eggplantDurationMs || 15 * 60 * 1000,
            x: Math.random() * 300,
            y: 50,
            vx: 0,
            vy: 0,
          }]);
        }, 500);
      }
    }

    setCards(prev => prev.map(c => c.id === cardId ? { ...c, list: newList, submittedAt: newList === 'done' ? new Date().toISOString() : c.submittedAt } : c));
  };

  const tryUnlock = (feature) => {
    if(unlocked[feature]) return true;
    const cfgMap = {
      themes: [admin.themeUnlockCost || 50, admin.themeUnlockType || 'tickets'],
      minesweeper: [admin.mineUnlockCost || 100, admin.mineUnlockType || 'tickets'],
      ultraWheel: [admin.ultraUnlockCost || 1, admin.ultraUnlockType || 'eliteTickets'],
      plinko: [admin.plinkoUnlockCost || 200, admin.plinkoUnlockType || 'tickets'],
    };
    const [cost, type] = cfgMap[feature] || [50, 'tickets'];
    const val = player[type] || 0;
    if(val >= cost) {
      setUnlocked(u => ({ ...u, [feature]: true }));
      toast('🔓 Unlocked!', '🎉', true);
      return true;
    }
    toast(`Need ${cost} ${type} (have ${val})`, '🔒');
    return false;
  };

  const kbSkinItem = items.find(x => x.id === player.equippedKbSkin) || { banner: '#1a2535' };
  const equippedPet = items.find(x => x.id === player.equippedPet);

  if(!ok) return (
    <div style={{ minHeight: '100vh', background: '#050810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size={48} message="🎡 Loading DevWheel..." />
      </div>
    </div>
  );

  // ── ADMIN LOGIN VIEW ────────────────────────────────────────────────────────
  // ── ADMIN VIEW ─────────────────────────────────────────────────────────────
  if(view === 'admin') return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', paddingBottom: 40 }}>
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 28, cursor: 'pointer' }} onClick={handleLogoTap}>🎡 Admin Panel</div>
        <button
          onClick={() => setView('admin-login')}
          style={{
            padding: '10px 16px',
            background: '#FF6B6B',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🚪 Logout
        </button>
      </div>

      <AdminPanel
        admin={admin}
        setAdmin={setAdmin}
        items={items}
        regSegs={regSegs}
        eliteSegs={eliteSegs}
        ultraSegs={ultraSegs}
        setRegSegs={setRegSegs}
        setEliteSegs={setEliteSegs}
        setUltraSegs={setUltraSegs}
        T={T}
      />
    </div>
  );

  if(view === 'admin-login') return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 24, padding: 40, textAlign: 'center', width: 320, color: T.text }}>
        <div style={{ fontSize: 48, marginBottom: 10 }} onClick={handleLogoTap}>🎡</div>
        <h1 style={{ fontSize: 22, color: T.text, margin: '0 0 4px', fontWeight: 800 }}>DevWheel</h1>
        <p style={{ color: '#555', fontSize: 13, margin: '0 0 26px' }}>Admin Portal</p>
        <input
          type="password"
          placeholder="Admin password"
          value={adminPwInput}
          onChange={e => setAdminPwInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && adminPwInput === admin.password && (setView('admin'), setAdminPwInput(''))}
          style={{ width: '100%', padding: '12px', background: T.card, border: `2px solid ${T.border}`, borderRadius: 12, color: T.text, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }}
        />
        <button
          onClick={() => { if(adminPwInput === admin.password) { setView('admin'); setAdminPwInput(''); } else alert('Wrong password'); }}
          style={{ width: '100%', padding: '12px', background: T.accent, border: 'none', borderRadius: 12, color: '#111', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}
        >
          🔓 Enter Admin
        </button>
        <button
          onClick={() => setView('employee')}
          style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px dashed ${T.border}`, borderRadius: 12, color: '#555', fontSize: 13, cursor: 'pointer' }}
        >
          View as Employee →
        </button>
      </div>
    </div>
  );

  // ── EMPLOYEE VIEW ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', paddingBottom: 40 }}>
      <ToastPopup popup={popup} T={T} />
      <FloatingEmojisContainer floatingEmojis={floatingEmojis} onCollect={handleCollectEmoji} onRemove={handleRemoveEmoji} />

      {/* Header */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 24, cursor: 'pointer' }} onClick={handleLogoTap}>🎡</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatBox label="Coins" value={formatNumber(player.coins || 0)} emoji="💰" T={T} />
          <StatBox label="Tickets" value={player.tickets || 0} emoji="🎫" T={T} />
          <StatBox label="Elite" value={player.eliteTickets || 0} emoji="⭐" T={T} />
        </div>
        <button onClick={() => setProfileOpen(!profileOpen)} style={{ background: T.accent, border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}>
          👤
        </button>
      </div>

      <StatusLine player={player} items={items} admin={admin} T={T} />

      {/* Pet Bouncer */}
      {equippedPet && <PetBouncer pet={equippedPet} petItem={equippedPet} />}

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['wheels', 'kanban', 'mine', 'shop', 'leaderboard'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 16px',
                background: tab === t ? T.accent : T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                color: tab === t ? '#111' : T.text,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t === 'wheels' && '🎡'} {t === 'kanban' && '📋'} {t === 'mine' && '⛏️'} {t === 'shop' && '🛍️'} {t === 'leaderboard' && '🏆'}
              {' '}{t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Wheels Tab */}
        {tab === 'wheels' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {/* Regular Wheel */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <h3 style={{ margin: 0, marginBottom: 16 }}>🎡 Regular Wheel</h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <WheelSpinner segments={regSegs} rotation={regRot} radius={120} />
              </div>
              <button
                onClick={() => handleWheelSpin('reg')}
                disabled={regSpin}
                style={{
                  padding: '12px 24px',
                  background: regSpin ? '#666' : T.accent,
                  border: 'none',
                  borderRadius: 8,
                  color: '#111',
                  fontWeight: 700,
                  cursor: regSpin ? 'default' : 'pointer',
                }}
              >
                {regSpin ? '🎡 Spinning...' : '🎡 Spin (-1 🎫)'}
              </button>
            </div>

            {/* Elite Wheel */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <h3 style={{ margin: 0, marginBottom: 16 }}>⭐ Elite Wheel</h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <WheelSpinner segments={eliteSegs} rotation={elRot} radius={120} />
              </div>
              <button
                onClick={() => handleWheelSpin('elite')}
                disabled={elSpin}
                style={{
                  padding: '12px 24px',
                  background: elSpin ? '#666' : T.accent,
                  border: 'none',
                  borderRadius: 8,
                  color: '#111',
                  fontWeight: 700,
                  cursor: elSpin ? 'default' : 'pointer',
                }}
              >
                {elSpin ? '⭐ Spinning...' : '⭐ Spin (-1 ⭐)'}
              </button>
            </div>

            {/* Ultra Wheel */}
            {unlocked.ultraWheel ? (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <h3 style={{ margin: 0, marginBottom: 16 }}>🎁 Ultra Wheel</h3>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <WheelSpinner segments={ultraSegs} rotation={ultraRot} radius={120} />
                </div>
                <button
                  onClick={() => handleWheelSpin('ultra')}
                  disabled={ultraSpin}
                  style={{
                    padding: '12px 24px',
                    background: ultraSpin ? '#666' : T.accent,
                    border: 'none',
                    borderRadius: 8,
                    color: '#111',
                    fontWeight: 700,
                    cursor: ultraSpin ? 'default' : 'pointer',
                  }}
                >
                  {ultraSpin ? '🎁 Spinning...' : '🎁 Spin (-' + (admin.ultraWheelCost || 1) + ' ⭐)'}
                </button>
              </div>
            ) : (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <h3 style={{ margin: 0, marginBottom: 16 }}>🔒 Ultra Wheel (Locked)</h3>
                <p style={{ color: '#999', marginBottom: 16 }}>Cost: {admin.ultraUnlockCost || 1} {admin.ultraUnlockType || 'eliteTickets'}</p>
                <button
                  onClick={() => tryUnlock('ultraWheel')}
                  style={{
                    padding: '12px 24px',
                    background: T.accent,
                    border: 'none',
                    borderRadius: 8,
                    color: '#111',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🔓 Unlock
                </button>
              </div>
            )}
          </div>
        )}

        {/* Plinko */}
        {unlocked.plinko && tab === 'wheels' && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={() => setPlinkOpen(true)}
              style={{
                padding: '12px 24px',
                background: T.accent,
                border: 'none',
                borderRadius: 8,
                color: '#111',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🎰 Plinko with a Horse
            </button>
          </div>
        )}

        {plinkOpen && (
          <PlinkoGameModal
            T={T}
            player={player}
            admin={admin}
            items={items}
            onClose={() => setPlinkOpen(false)}
            onReward={(amt) => setPlayer(p => ({ ...p, coins: p.coins + amt }))}
          />
        )}

        {/* Kanban Tab */}
        {tab === 'kanban' && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              background: kbSkinItem.banner,
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
            }}>
              {['todo', 'inprogress', 'done'].map(list => (
                <div key={list} style={{ background: T.card, borderRadius: 8, padding: 12 }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>
                    {list === 'todo' && '📝 To Do'} {list === 'inprogress' && '🔄 In Progress'} {list === 'done' && '✅ Done'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cards.filter(c => c.list === list).map(card => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={() => setDragCard(card.id)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => { moveCard(card.id, list); setDragCard(null); }}
                        style={{
                          background: T.card,
                          border: `1px solid ${T.border}`,
                          borderRadius: 6,
                          padding: 8,
                          cursor: 'grab',
                          opacity: dragCard === card.id ? 0.5 : 1,
                        }}
                      >
                        <div style={{ fontSize: 12, marginBottom: 4, fontWeight: 700 }}>{card.image} {card.title}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{card.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* File Upload Section */}
            <FileUploadManager
              boardId="main-board"
              cardsFileLimit={admin.kanbanFilesMaxGlobal || 5}
              onFileAdded={(file) => toast(`Uploaded ${file.name}`, '📎')}
              T={T}
            />
          </>
        )}

        {/* Minesweeper Tab */}
        {tab === 'mine' && (
          <div style={{ textAlign: 'center' }}>
            <MinesweeperInfo level={player.mineLevel} wins={player.mineWins} losses={player.mineLosses} T={T} />
            {unlocked.minesweeper ? (
              <button
                onClick={() => setMineOpen(true)}
                style={{
                  marginTop: 16,
                  padding: '12px 24px',
                  background: T.accent,
                  border: 'none',
                  borderRadius: 8,
                  color: '#111',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⛏️ Play Minesweeper
              </button>
            ) : (
              <button
                onClick={() => tryUnlock('minesweeper')}
                style={{
                  marginTop: 16,
                  padding: '12px 24px',
                  background: T.accent,
                  border: 'none',
                  borderRadius: 8,
                  color: '#111',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🔓 Unlock Minesweeper
              </button>
            )}

            {mineOpen && (
              <MinesweeperGame
                player={player}
                admin={admin}
                onClose={() => setMineOpen(false)}
                onWin={(level) => {
                  setPlayer(p => ({ ...p, mineWins: (p.mineWins || 0) + 1, mineLevel: (p.mineLevel || 1) + (p.mineWins >= (MINE_LVL_REQ[p.mineLevel] || 100) ? 1 : 0) }));
                  toast('🎉 You won!', '✅', true);
                }}
                onLose={() => {
                  setPlayer(p => ({ ...p, mineLosses: (p.mineLosses || 0) + 1 }));
                  toast('💥 Game over!', '❌');
                }}
              />
            )}
          </div>
        )}

        {/* Shop Tab */}
        {tab === 'shop' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {shopStock.map(item => (
              <div
                key={item.id}
                style={{
                  background: T.card,
                  border: `2px solid ${RARITY[item.rarity]?.color || '#999'}`,
                  borderRadius: 8,
                  padding: 12,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if((player.coins || 0) >= item.shopPrice) {
                    setPlayer(p => ({ ...p, coins: p.coins - item.shopPrice, ownedItems: [...(p.ownedItems || []), item.id] }));
                    toast(`Bought ${item.name}!`, '🛍️');
                  } else {
                    toast('Not enough coins!', '💰');
                  }
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{item.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: T.accent, fontWeight: 700 }}>{item.shopPrice} 💰</div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {tab === 'leaderboard' && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 20 }}>🏆 Item Leaderboard</h3>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.accent }}>
              You: {(player.ownedItems || []).length} items
            </div>
            {(player.ownedItems || []).length >= (admin.lbMinItems || 15) && (
              <div style={{ fontSize: 14, color: '#FFD700', marginTop: 8 }}>
                💰 x{(admin.lbMult || 1.25).toFixed(2)} coin multiplier active!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Sidebar */}
      {profileOpen && (
        <div style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: 300,
          background: T.card,
          borderLeft: `1px solid ${T.border}`,
          overflowY: 'auto',
          zIndex: 500,
          padding: 16,
        }}>
          <button onClick={() => setProfileOpen(false)} style={{ background: 'none', border: 'none', color: T.text, fontSize: 20, cursor: 'pointer', float: 'right' }}>✕</button>
          <h2 style={{ margin: '16px 0 0 0', fontSize: 18 }}>👤 {player.name}</h2>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, marginTop: 16 }}>
            <button
              onClick={() => setProfileTab('avatar')}
              style={{
                flex: 1,
                padding: 8,
                background: profileTab === 'avatar' ? T.accent : T.border,
                border: 'none',
                borderRadius: 4,
                color: profileTab === 'avatar' ? '#111' : T.text,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Avatar
            </button>
            <button
              onClick={() => setProfileTab('pets')}
              style={{
                flex: 1,
                padding: 8,
                background: profileTab === 'pets' ? T.accent : T.border,
                border: 'none',
                borderRadius: 4,
                color: profileTab === 'pets' ? '#111' : T.text,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Pets
            </button>
          </div>

          {profileTab === 'avatar' && (
            <div>
              <AvatarSVG player={player} items={items} size={150} />
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['hat', 'shirt', 'pants'].map(type => {
                  const equipped = player[`equipped${type.charAt(0).toUpperCase() + type.slice(1)}`];
                  return (
                    <div key={type}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{type.toUpperCase()}</p>
                      <select
                        value={equipped}
                        onChange={e => setPlayer(p => ({ ...p, [`equipped${type.charAt(0).toUpperCase() + type.slice(1)}`]: e.target.value }))}
                        style={{ width: '100%', padding: 8, background: T.border, color: T.text, border: 'none', borderRadius: 4 }}
                      >
                        {items.filter(x => x.type === type).map(item => (
                          <option key={item.id} value={item.id}>{item.emoji} {item.name}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {profileTab === 'pets' && (
            <div>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>Click to equip/unequip a pet</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {items.filter(x => x.type === 'pet' && (player.ownedItems || []).includes(x.id)).map(pet => (
                  <div
                    key={pet.id}
                    onClick={() => setPlayer(p => ({ ...p, equippedPet: p.equippedPet === pet.id ? null : pet.id }))}
                    style={{
                      background: player.equippedPet === pet.id ? T.accent : T.border,
                      borderRadius: 6,
                      padding: 8,
                      textAlign: 'center',
                      cursor: 'pointer',
                      color: player.equippedPet === pet.id ? '#111' : T.text,
                      fontWeight: player.equippedPet === pet.id ? 700 : 400,
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{pet.emoji}</div>
                    <div style={{ fontSize: 10 }}>{pet.name}</div>
                    <div style={{ fontSize: 9, opacity: 0.7 }}>{pet.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Wrap with error boundary for crash protection
export default function DevWheel() {
  return (
    <ErrorBoundary>
      <DevWheelContent />
    </ErrorBoundary>
  );
}
