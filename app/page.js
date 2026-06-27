'use client';

import { useEffect, useMemo, useState } from 'react';

const defaultConfig = { coinMultiplier: 1, ticketMultiplier: 1, dailyTickets: 12, streakStep: 0.04, plinkoGravity: 0.52, collectibleChance: 36, collectibleReward: 3, collectibleLifetime: 16 };
const starterPlayer = { name: 'Player', coins: 460, tickets: 18, eliteTickets: 2, petTokens: 1, streak: 1, lastDaily: '', boardsDone: 0, mineLevel: 1, mineWins: 0, ownedItems: ['cap', 'teal-shirt', 'jeans'], equipped: { hat: 'cap', shirt: 'teal-shirt', pants: 'jeans', pet: '' }, ownedPets: [] };
const wheelPrizes = [
  { id: 'coins-75', label: '75 coins', emoji: '🪙', kind: 'coins', amount: 75, color: '#F6C945', weight: 34 },
  { id: 'tickets-8', label: '8 tickets', emoji: '🎫', kind: 'tickets', amount: 8, color: '#4ECDC4', weight: 24 },
  { id: 'coins-220', label: '220 coins', emoji: '💰', kind: 'coins', amount: 220, color: '#FF6B6B', weight: 15 },
  { id: 'token', label: 'pet token', emoji: '🐾', kind: 'petTokens', amount: 1, color: '#7BD389', weight: 12 },
  { id: 'elite', label: 'elite ticket', emoji: '⭐', kind: 'eliteTickets', amount: 1, color: '#B28DFF', weight: 9 },
  { id: 'jackpot', label: 'jackpot', emoji: '🏆', kind: 'coins', amount: 900, color: '#FF9F1C', weight: 6 }
];
const shopItems = [
  { id: 'cap', name: 'Arcade Cap', type: 'hat', cost: 80, color: '#ff6b6b', emoji: '🧢' },
  { id: 'crown', name: 'Tiny Crown', type: 'hat', cost: 260, color: '#f6c945', emoji: '👑' },
  { id: 'teal-shirt', name: 'Teal Tee', type: 'shirt', cost: 100, color: '#4ecdc4', emoji: '👕' },
  { id: 'hero-hoodie', name: 'Hero Hoodie', type: 'shirt', cost: 220, color: '#7bd389', emoji: '🧥' },
  { id: 'jeans', name: 'Comfy Jeans', type: 'pants', cost: 100, color: '#6fa8dc', emoji: '👖' },
  { id: 'star-boots', name: 'Star Boots', type: 'pants', cost: 320, color: '#b28dff', emoji: '⭐' }
];
const pets = [
  { id: 'sprout', name: 'Sprout', rarity: 'common', emoji: '🌱', cost: 1, effect: '+3 coins/min', coinRate: 3 },
  { id: 'spark', name: 'Spark', rarity: 'rare', emoji: '✨', cost: 2, effect: '+8 coins/min', coinRate: 8 },
  { id: 'nova', name: 'Nova', rarity: 'epic', emoji: '🌟', cost: 3, effect: 'x1.18 coins', coinRate: 4, coinMultiplier: 1.18 },
  { id: 'luck', name: 'Luck', rarity: 'legendary', emoji: '🍀', cost: 4, effect: '+18% ticket chance', coinRate: 6, ticketChance: 18 }
];
const collectibleTypes = [{ emoji: '🐣', name: 'Morning peeper' }, { emoji: '🍆', name: 'Eggplant' }, { emoji: '😳', name: 'Hourly surprise' }];
const starterTasks = ['Clear the counter', 'Send the message', 'Do one tiny chore', 'Drink water', 'Plan tomorrow'];

function load(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
function today() { return new Date().toISOString().slice(0, 10); }
function pickWeighted(items) { const total = items.reduce((sum, item) => sum + item.weight, 0); let roll = Math.random() * total; return items.find((item) => { roll -= item.weight; return roll <= 0; }) || items[0]; }
function award(player, prize, config) { const next = { ...player }; const amount = prize.kind === 'coins' ? Math.round(prize.amount * config.coinMultiplier) : Math.round(prize.amount * config.ticketMultiplier); next[prize.kind] = (next[prize.kind] || 0) + amount; return next; }

function Avatar({ player }) {
  const itemById = Object.fromEntries(shopItems.map((item) => [item.id, item]));
  const hat = itemById[player.equipped.hat]; const shirt = itemById[player.equipped.shirt]; const pants = itemById[player.equipped.pants];
  return <div className="avatarStage"><div className="avatar"><div className="hat" style={{ color: hat && hat.color }}>{hat && hat.emoji}</div><div className="head">🙂</div><div className="shirt" style={{ background: shirt && shirt.color }}>{shirt && shirt.emoji}</div><div className="pants" style={{ background: pants && pants.color }}>{pants && pants.emoji}</div></div>{player.equipped.pet && <div className="petBuddy">{player.equipped.pet}</div>}</div>;
}
function EffectsBar({ player, config }) { const pet = pets.find((entry) => entry.emoji === player.equipped.pet); const streakBoost = (1 + Math.max(0, player.streak - 1) * config.streakStep).toFixed(2); return <div className="effectsBar"><span>🔥 Day {player.streak}</span><span>🏆 x{streakBoost} coins</span><span>🎫 x{config.ticketMultiplier.toFixed(2)} tickets</span>{pet && <span>{pet.emoji} {pet.effect}</span>}</div>; }

function UltraWheel({ player, setPlayer, config, toast }) {
  const [spinning, setSpinning] = useState(false); const [rotation, setRotation] = useState(0);
  const gradient = useMemo(() => { const size = 100 / wheelPrizes.length; return 'conic-gradient(' + wheelPrizes.map((p, i) => p.color + ' ' + (i * size) + '% ' + ((i + 1) * size) + '%').join(',') + ')'; }, []);
  function spin() { if (spinning || player.tickets < 1) return; const prize = pickWeighted(wheelPrizes); const index = wheelPrizes.findIndex((entry) => entry.id === prize.id); setSpinning(true); setPlayer((prev) => ({ ...prev, tickets: prev.tickets - 1 })); setRotation((prev) => prev + 1440 + (360 - index * 60)); setTimeout(() => { setPlayer((prev) => award(prev, prize, config)); toast('Ultra Wheel: ' + prize.label); setSpinning(false); }, 1550); }
  return <section className="panel wheelPanel"><div className="panelHeader"><h2>Ultra Wheel</h2><span>{player.tickets} tickets</span></div><div className="wheelWrap"><div className="pointer">▼</div><div className="wheel" style={{ background: gradient, transform: 'rotate(' + rotation + 'deg)' }}>{wheelPrizes.map((prize, index) => <span key={prize.id} style={{ transform: 'rotate(' + (index * 60) + 'deg) translateY(-112px)' }}>{prize.emoji}</span>)}</div></div><button className="primaryButton" onClick={spin} disabled={spinning || player.tickets < 1}>{spinning ? 'Spinning' : 'Spin for 1 ticket'}</button></section>;
}

function HorsePlinko({ player, setPlayer, config, toast }) {
  const lanes = [10, 40, 120, 300, 120, 40, 10]; const [running, setRunning] = useState(false); const [lane, setLane] = useState(3);
  function drop() { if (running || player.eliteTickets < 1) return; const nextLane = Math.floor(Math.random() * lanes.length); setLane(nextLane); setRunning(true); setPlayer((prev) => ({ ...prev, eliteTickets: prev.eliteTickets - 1 })); setTimeout(() => { const coins = Math.round(lanes[nextLane] * config.coinMultiplier); setPlayer((prev) => ({ ...prev, coins: prev.coins + coins })); toast('Horse Plinko: +' + coins + ' coins'); setRunning(false); }, 1800); }
  return <section className="panel"><div className="panelHeader"><h2>Horse Plinko</h2><span>{player.eliteTickets} elite</span></div><div className="plinkoBoard"><div className={running ? 'horseBall dropping' : 'horseBall'} style={{ left: (14 + lane * 12) + '%', '--gravity': config.plinkoGravity }}>🐴</div>{Array.from({ length: 35 }, (_, index) => <i key={index} />)}<b>{player.equipped.pet || '🐾'}</b></div><div className="lanes">{lanes.map((value, index) => <span key={index}>{value}</span>)}</div><button className="primaryButton" onClick={drop} disabled={running || player.eliteTickets < 1}>Drop elite ticket</button></section>;
}

function FloatingCollectibles({ config, setPlayer, toast }) {
  const [items, setItems] = useState([]);
  useEffect(() => { const timer = setInterval(() => { if (Math.random() * 100 > config.collectibleChance) return; const kind = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)]; const id = crypto.randomUUID(); setItems((prev) => [...prev, { ...kind, id, x: Math.random() * 78 + 8, y: Math.random() * 50 + 8 }]); setTimeout(() => setItems((prev) => prev.filter((item) => item.id !== id)), config.collectibleLifetime * 1000); }, 4800); return () => clearInterval(timer); }, [config.collectibleChance, config.collectibleLifetime]);
  function collect(item) { setItems((prev) => prev.filter((entry) => entry.id !== item.id)); setPlayer((prev) => ({ ...prev, tickets: prev.tickets + config.collectibleReward })); toast(item.name + ': +' + config.collectibleReward + ' tickets'); }
  return <div className="collectibleLayer">{items.map((item) => <button key={item.id} className="collectible" style={{ left: item.x + '%', top: item.y + '%' }} onClick={() => collect(item)}>{item.emoji}</button>)}</div>;
}

function makeBoard(level) { const grid = Math.min(8, 4 + level); const bombs = Math.min(grid * grid - 2, 3 + level); const bombSet = new Set(); while (bombSet.size < bombs) bombSet.add(Math.floor(Math.random() * grid * grid)); return Array.from({ length: grid * grid }, (_, id) => ({ id, bomb: bombSet.has(id), open: false })); }
function Minesweeper({ player, setPlayer, toast }) {
  const [board, setBoard] = useState(() => makeBoard(player.mineLevel)); const size = Math.sqrt(board.length); const safeLeft = board.filter((cell) => !cell.bomb && !cell.open).length;
  function reset(level) { setBoard(makeBoard(level)); }
  function open(cell) { if (cell.open) return; if (cell.bomb) { const level = Math.max(1, player.mineLevel - 1); setPlayer((prev) => ({ ...prev, mineLevel: level })); reset(level); toast('Mine hit. Level adjusted.'); return; } const next = board.map((entry) => entry.id === cell.id ? { ...entry, open: true } : entry); setBoard(next); if (next.filter((entry) => !entry.bomb && !entry.open).length === 0) { const level = player.mineLevel + 1; const coins = 70 + level * 20; setPlayer((prev) => ({ ...prev, mineLevel: level, mineWins: prev.mineWins + 1, coins: prev.coins + coins })); reset(level); toast('Mine cleared: +' + coins + ' coins'); } }
  return <section className="panel"><div className="panelHeader"><h2>Minesweeper</h2><span>Level {player.mineLevel}</span></div><div className="mineGrid" style={{ gridTemplateColumns: 'repeat(' + size + ', 1fr)' }}>{board.map((cell) => <button key={cell.id} className={cell.open ? 'open' : ''} onClick={() => open(cell)}>{cell.open ? '✓' : ''}</button>)}</div><div className="miniStats"><span>{safeLeft} safe</span><span>{player.mineWins} wins</span></div></section>;
}

function Shop({ player, setPlayer, toast }) { function click(item) { const owned = player.ownedItems.includes(item.id); if (owned) { setPlayer((prev) => ({ ...prev, equipped: { ...prev.equipped, [item.type]: item.id } })); return; } if (player.coins < item.cost) return; setPlayer((prev) => ({ ...prev, coins: prev.coins - item.cost, ownedItems: [...prev.ownedItems, item.id], equipped: { ...prev.equipped, [item.type]: item.id } })); toast(item.name + ' unlocked'); } return <section className="panel wide"><div className="panelHeader"><h2>Shop</h2><span>{player.coins.toLocaleString()} coins</span></div><div className="cardGrid">{shopItems.map((item) => <button key={item.id} className={player.equipped[item.type] === item.id ? 'shopCard active' : 'shopCard'} onClick={() => click(item)}><b style={{ background: item.color }}>{item.emoji}</b><strong>{item.name}</strong><span>{player.ownedItems.includes(item.id) ? 'Equip' : item.cost + ' coins'}</span></button>)}</div></section>; }
function Pets({ player, setPlayer, toast }) { function click(pet) { const owned = player.ownedPets.includes(pet.id); if (owned) { setPlayer((prev) => ({ ...prev, equipped: { ...prev.equipped, pet: pet.emoji } })); return; } if (player.petTokens < pet.cost) return; setPlayer((prev) => ({ ...prev, petTokens: prev.petTokens - pet.cost, ownedPets: [...prev.ownedPets, pet.id], equipped: { ...prev.equipped, pet: pet.emoji } })); toast(pet.name + ' joined you'); } return <section className="panel wide"><div className="panelHeader"><h2>Pets</h2><span>{player.petTokens} tokens</span></div><div className="cardGrid">{pets.map((pet) => <button key={pet.id} className={player.equipped.pet === pet.emoji ? 'petCard active' : 'petCard'} onClick={() => click(pet)}><b>{pet.emoji}</b><strong>{pet.name}</strong><small>{pet.rarity}</small><span>{pet.effect}</span><em>{player.ownedPets.includes(pet.id) ? 'Equip' : pet.cost + ' token'}</em></button>)}</div></section>; }
function TaskBoard({ player, setPlayer, toast }) { const [list, setList] = useState(starterTasks.map((text, id) => ({ id, text, done: false }))); const [text, setText] = useState(''); function complete(task) { setList((prev) => prev.map((entry) => entry.id === task.id ? { ...entry, done: !entry.done } : entry)); if (!task.done) { setPlayer((prev) => ({ ...prev, coins: prev.coins + 35, tickets: prev.tickets + 1, boardsDone: prev.boardsDone + 1 })); toast('Task complete: +35 coins, +1 ticket'); } } function add(event) { event.preventDefault(); if (!text.trim()) return; setList((prev) => [...prev, { id: Date.now(), text: text.trim(), done: false }]); setText(''); } return <section className="panel wide"><div className="panelHeader"><h2>Task Board</h2><span>{player.boardsDone} done</span></div><form className="taskForm" onSubmit={add}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Add task" /><button>Add</button></form><div className="taskList">{list.map((task) => <button key={task.id} className={task.done ? 'done' : ''} onClick={() => complete(task)}><span>{task.done ? '✓' : ''}</span>{task.text}</button>)}</div></section>; }
function Admin({ config, setConfig }) { const controls = [['coinMultiplier', 'Coin multiplier', 0.5, 3, 0.05], ['ticketMultiplier', 'Ticket multiplier', 0.5, 3, 0.05], ['dailyTickets', 'Daily tickets', 1, 50, 1], ['plinkoGravity', 'Plinko gravity', 0.15, 1.2, 0.01], ['collectibleChance', 'Collectible chance', 0, 100, 1], ['collectibleReward', 'Collectible reward', 1, 20, 1]]; return <section className="panel wide"><div className="panelHeader"><h2>Admin</h2><span>Live tuning</span></div><div className="controlGrid">{controls.map(([key, label, min, max, step]) => <label key={key}><span>{label}</span><input type="range" min={min} max={max} step={step} value={config[key]} onChange={(event) => setConfig((prev) => ({ ...prev, [key]: Number(event.target.value) }))} /><b>{config[key]}</b></label>)}</div></section>; }

export default function Home() {
  const [ready, setReady] = useState(false); const [tab, setTab] = useState('arcade'); const [player, setPlayer] = useState(starterPlayer); const [config, setConfig] = useState(defaultConfig); const [toasts, setToasts] = useState([]);
  useEffect(() => { setPlayer(load('reward-player', starterPlayer)); setConfig(load('reward-config', defaultConfig)); setReady(true); }, []);
  useEffect(() => { if (ready) save('reward-player', player); }, [player, ready]); useEffect(() => { if (ready) save('reward-config', config); }, [config, ready]);
  useEffect(() => { const timer = setInterval(() => { const pet = pets.find((entry) => entry.emoji === player.equipped.pet); if (!pet) return; setPlayer((prev) => ({ ...prev, coins: prev.coins + Math.max(1, Math.round(pet.coinRate / 3)) })); }, 20000); return () => clearInterval(timer); }, [player.equipped.pet]);
  function toast(message) { const id = Date.now() + Math.random(); setToasts((prev) => [...prev, { id, message }]); setTimeout(() => setToasts((prev) => prev.filter((entry) => entry.id !== id)), 2600); }
  function daily() { if (player.lastDaily === today()) return; const tickets = Math.round(config.dailyTickets * config.ticketMultiplier); setPlayer((prev) => ({ ...prev, tickets: prev.tickets + tickets, streak: prev.lastDaily ? prev.streak + 1 : 1, lastDaily: today() })); toast('Daily streak: +' + tickets + ' tickets'); }
  const nav = [['arcade', 'Arcade'], ['tasks', 'Tasks'], ['shop', 'Shop'], ['pets', 'Pets'], ['admin', 'Admin']];
  return <main className="appShell"><FloatingCollectibles config={config} setPlayer={setPlayer} toast={toast} /><header className="topBar"><div><h1>Reward Arcade</h1><p>{player.coins.toLocaleString()} coins · {player.tickets} tickets · {player.eliteTickets} elite</p></div><button className="dailyButton" onClick={daily} disabled={player.lastDaily === today()}>{player.lastDaily === today() ? 'Claimed' : 'Daily'}</button></header><EffectsBar player={player} config={config} /><section className="profileStrip"><Avatar player={player} /><div><strong>{player.name}</strong><span>Mine level {player.mineLevel} · {player.petTokens} pet tokens</span></div><nav>{nav.map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</nav></section>{tab === 'arcade' && <div className="contentGrid"><UltraWheel player={player} setPlayer={setPlayer} config={config} toast={toast} /><HorsePlinko player={player} setPlayer={setPlayer} config={config} toast={toast} /><Minesweeper player={player} setPlayer={setPlayer} toast={toast} /></div>}{tab === 'tasks' && <TaskBoard player={player} setPlayer={setPlayer} toast={toast} />}{tab === 'shop' && <Shop player={player} setPlayer={setPlayer} toast={toast} />}{tab === 'pets' && <Pets player={player} setPlayer={setPlayer} toast={toast} />}{tab === 'admin' && <Admin config={config} setConfig={setConfig} />}<div className="toastStack">{toasts.map((entry) => <div key={entry.id}>{entry.message}</div>)}</div></main>;
}
