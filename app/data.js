// ── THEMES ──────────────────────────────────────────────────────────────────
export const THEMES = {
  midnight:{ id:'midnight',name:'Midnight',bg:'linear-gradient(160deg,#050810,#0a0f1a)',accent:'#4ECDC4',secondary:'#FFE66D',card:'rgba(255,255,255,.03)',border:'#1a2535',text:'#fff' },
  crimson: { id:'crimson', name:'Crimson', bg:'linear-gradient(160deg,#1a0505,#2a0a0a)',accent:'#FF6B6B',secondary:'#FFE66D',card:'rgba(255,100,100,.05)',border:'#3a1515',text:'#fff' },
  forest:  { id:'forest',  name:'Forest',  bg:'linear-gradient(160deg,#051a0a,#0a2010)',accent:'#4CAF50',secondary:'#8BC34A',card:'rgba(76,175,80,.05)',border:'#1a3520',text:'#fff' },
  gold:    { id:'gold',    name:'Gold',    bg:'linear-gradient(160deg,#1a1500,#2a2000)',accent:'#FFD700',secondary:'#FFA500',card:'rgba(255,215,0,.05)',border:'#3a3000',text:'#fff' },
  ocean:   { id:'ocean',   name:'Ocean',   bg:'linear-gradient(160deg,#051020,#0a1830)',accent:'#00BCD4',secondary:'#4FC3F7',card:'rgba(0,188,212,.05)',border:'#0a2035',text:'#fff' },
  aurora:  { id:'aurora',  name:'Aurora',  bg:'linear-gradient(160deg,#0d0520,#150a2a)',accent:'#9C27B0',secondary:'#E91E63',card:'rgba(156,39,176,.05)',border:'#2a1535',text:'#fff' },
};

export const RARITY = {
  common:    { color:'#e0e0e0', label:'Common',    weight:60 },
  rare:      { color:'#4fc3f7', label:'Rare',      weight:25 },
  epic:      { color:'#ce93d8', label:'Epic',      weight:10 },
  legendary: { color:'#ffb74d', label:'Legendary', weight:5  },
};

// ── AVATAR LAYERS ────────────────────────────────────────────────────────────
export const LAYERS = {
  hat:   { x:22, y:3,  w:76, h:42 },
  shirt: { x:32, y:54, w:56, h:34 },
  pants: { x:26, y:78, w:68, h:38 },
};

// ── MINESWEEPER CONFIG ───────────────────────────────────────────────────────
export const MINE_LVL_REQ = [0,2,3,10,20,40,80,160,320,640];

// ── PLINKO CONFIG ────────────────────────────────────────────────────────────
export const PLINKO_MULTS = [20,8,3,1.5,0.5,1.5,3,8,20];
export const PLINKO_COLORS = ['#FFD700','#FF6B6B','#FF8B94','#4ECDC4','#666','#4ECDC4','#FF8B94','#FF6B6B','#FFD700'];

// ── HORSE NAMES FOR PLINKO ──────────────────────────────────────────────────
export const HORSE_NAMES = [
  'Sir Gallops-a-Lot','Thunderbottom','Princess Neigh','Baron Clipclop','Turbo Hay',
  'Disco Stallion','Captain Canter','Lord Neigh','Speedy McHooves','El Magnifico',
  'Count Hoofula','Flash Hoof','Neighvarro','Sir Trots-a-Lot','Lightning Mane'
];

// ── BASE ITEMS CATALOG ───────────────────────────────────────────────────────
export const BASE_ITEMS = [
  // Hats
  { id:'hat_none',   name:'No Hat',      type:'hat',   rarity:'common',    cost:0,   emoji:'',      imageUrl:'' },
  { id:'hat_cap_r',  name:'Red Cap',     type:'hat',   rarity:'common',    cost:80,  emoji:'🧢',    imageUrl:'', color:'#e53935' },
  { id:'hat_cap_b',  name:'Blue Cap',    type:'hat',   rarity:'common',    cost:80,  emoji:'🧢',    imageUrl:'', color:'#1e88e5' },
  { id:'hat_crown',  name:'Crown',       type:'hat',   rarity:'rare',      cost:200, emoji:'👑',    imageUrl:'' },
  { id:'hat_tophat', name:'Top Hat',     type:'hat',   rarity:'common',    cost:150, emoji:'🎩',    imageUrl:'' },
  { id:'hat_party',  name:'Party Hat',   type:'hat',   rarity:'common',    cost:100, emoji:'🎉',    imageUrl:'' },
  { id:'hat_dino',   name:'Dino Spike',  type:'hat',   rarity:'rare',      cost:300, emoji:'🦖',    imageUrl:'', theme:'dino' },
  { id:'hat_astro',  name:'Astronaut',   type:'hat',   rarity:'rare',      cost:300, emoji:'🪐',    imageUrl:'', theme:'space' },
  { id:'hat_shell',  name:'Sea Shell',   type:'hat',   rarity:'rare',      cost:300, emoji:'🐚',    imageUrl:'', theme:'ocean' },

  // Shirts (tees have bodyColor, NO emoji in middle)
  { id:'shirt_none', name:'No Shirt',    type:'shirt', rarity:'common',    cost:0,   emoji:'',      imageUrl:'', bodyColor:'#4ECDC4' },
  { id:'shirt_r',    name:'Red Tee',     type:'shirt', rarity:'common',    cost:80,  emoji:'',      imageUrl:'', bodyColor:'#e53935' },
  { id:'shirt_b',    name:'Blue Tee',    type:'shirt', rarity:'common',    cost:80,  emoji:'',      imageUrl:'', bodyColor:'#1e88e5' },
  { id:'shirt_grn',  name:'Green Tee',   type:'shirt', rarity:'common',    cost:80,  emoji:'',      imageUrl:'', bodyColor:'#43a047' },
  { id:'shirt_ylw',  name:'Yellow Tee',  type:'shirt', rarity:'common',    cost:80,  emoji:'',      imageUrl:'', bodyColor:'#f9a825' },
  { id:'shirt_purp', name:'Purple Tee',  type:'shirt', rarity:'common',    cost:80,  emoji:'',      imageUrl:'', bodyColor:'#7b1fa2' },
  { id:'shirt_orn',  name:'Orange Tee',  type:'shirt', rarity:'common',    cost:80,  emoji:'',      imageUrl:'', bodyColor:'#e65100' },
  { id:'shirt_hood', name:'Hoodie',      type:'shirt', rarity:'common',    cost:120, emoji:'🧥',    imageUrl:'', bodyColor:'#37474f' },
  { id:'shirt_suit', name:'Suit',        type:'shirt', rarity:'common',    cost:200, emoji:'👔',    imageUrl:'', bodyColor:'#1a237e' },
  { id:'shirt_dino', name:'Dino Jacket', type:'shirt', rarity:'rare',      cost:300, emoji:'🦎',    imageUrl:'', bodyColor:'#2e7d32', theme:'dino' },
  { id:'shirt_space',name:'Space Suit',  type:'shirt', rarity:'rare',      cost:300, emoji:'🚀',    imageUrl:'', bodyColor:'#0d47a1', theme:'space' },
  { id:'shirt_dive', name:'Dive Suit',   type:'shirt', rarity:'rare',      cost:300, emoji:'🤿',    imageUrl:'', bodyColor:'#006064', theme:'ocean' },

  // Pants
  { id:'pants_none', name:'No Pants',    type:'pants', rarity:'common',    cost:0,   emoji:'',      imageUrl:'', bodyColor:'#555' },
  { id:'pants_r',    name:'Red Shorts',  type:'pants', rarity:'common',    cost:80,  emoji:'',      imageUrl:'', bodyColor:'#e53935' },
  { id:'pants_b',    name:'Blue Jeans',  type:'pants', rarity:'common',    cost:80,  emoji:'',      imageUrl:'', bodyColor:'#1565c0' },
  { id:'pants_grn',  name:'Green Cargo', type:'pants', rarity:'common',    cost:80,  emoji:'',      imageUrl:'', bodyColor:'#388e3c' },
  { id:'pants_jog',  name:'Joggers',     type:'pants', rarity:'common',    cost:100, emoji:'',      imageUrl:'', bodyColor:'#424242' },
  { id:'pants_dino', name:'Dino Tail',   type:'pants', rarity:'rare',      cost:300, emoji:'🦕',    imageUrl:'', theme:'dino' },
  { id:'pants_space',name:'Space Boots', type:'pants', rarity:'rare',      cost:300, emoji:'👩‍🚀', imageUrl:'', theme:'space' },
  { id:'pants_fins', name:'Fins',        type:'pants', rarity:'rare',      cost:300, emoji:'🐟',    imageUrl:'', theme:'ocean' },

  // Kanban skins
  { id:'kb_plain',   name:'Plain',       type:'kbskin',rarity:'common',    cost:0,   emoji:'',      imageUrl:'', banner:'#1a2535' },
  { id:'kb_leaves',  name:'Leafy Dreams',type:'kbskin',rarity:'common',    cost:100, emoji:'🌿',    imageUrl:'', banner:'linear-gradient(135deg,#2d5a27,#4a7c59)' },
  { id:'kb_teddy',   name:'Teddy Town',  type:'kbskin',rarity:'common',    cost:100, emoji:'🧸',    imageUrl:'', banner:'linear-gradient(135deg,#8B6914,#c4973a)' },
  { id:'kb_flowers', name:'Bloom',       type:'kbskin',rarity:'common',    cost:100, emoji:'🌸',    imageUrl:'', banner:'linear-gradient(135deg,#c2185b,#f06292)' },
  { id:'kb_birds',   name:'Little Birbs',type:'kbskin',rarity:'common',    cost:100, emoji:'🐦',    imageUrl:'', banner:'linear-gradient(135deg,#0288d1,#4fc3f7)' },
  { id:'kb_dino',    name:'Dino World',  type:'kbskin',rarity:'epic',      cost:500, emoji:'🦕',    imageUrl:'', banner:'linear-gradient(135deg,#2e7d32,#66bb6a)', theme:'dino' },
  { id:'kb_space',   name:'Cosmic Board',type:'kbskin',rarity:'epic',      cost:500, emoji:'🌌',    imageUrl:'', banner:'linear-gradient(135deg,#1a237e,#7c4dff)', theme:'space' },
  { id:'kb_ocean',   name:'Deep Blue',   type:'kbskin',rarity:'epic',      cost:500, emoji:'🌊',    imageUrl:'', banner:'linear-gradient(135deg,#006064,#00bcd4)', theme:'ocean' },

  // Mine skins
  { id:'ms_classic', name:'Classic',     type:'msskin',rarity:'common',    cost:0,   emoji:'',      imageUrl:'', flag:'🚩', bomb:'💣' },
  { id:'ms_flower',  name:'Flower Sweep',type:'msskin',rarity:'common',    cost:150, emoji:'🌸',    imageUrl:'', flag:'🌸', bomb:'🌵' },
  { id:'ms_fruit',   name:'Fruity',      type:'msskin',rarity:'common',    cost:150, emoji:'🍓',    imageUrl:'', flag:'🍓', bomb:'💥' },
  { id:'ms_dino',    name:'Dino Sweep',  type:'msskin',rarity:'legendary', cost:800, emoji:'🦕',    imageUrl:'', flag:'🦕', bomb:'🥚',  theme:'dino' },
  { id:'ms_space',   name:'Space Sweep', type:'msskin',rarity:'legendary', cost:800, emoji:'🛸',    imageUrl:'', flag:'🛸', bomb:'☄️',  theme:'space' },
  { id:'ms_ocean',   name:'Ocean Sweep', type:'msskin',rarity:'legendary', cost:800, emoji:'🐠',    imageUrl:'', flag:'🐠', bomb:'🦑',  theme:'ocean' },

  // PETS ─────────────────────────────────────────────────────────────────────
  // Common: +x coins/min
  { id:'pet_cat',      name:'Lucky Cat',    type:'pet', rarity:'common',    cost:200, emoji:'🐱', imageUrl:'', effect:'coins_min',   effectVal:2,   desc:'+2/min' },
  { id:'pet_dog',      name:'Good Boy',     type:'pet', rarity:'common',    cost:200, emoji:'🐶', imageUrl:'', effect:'coins_min',   effectVal:3,   desc:'+3/min' },
  { id:'pet_bunny',    name:'Happy Bunny',  type:'pet', rarity:'common',    cost:180, emoji:'🐰', imageUrl:'', effect:'coins_min',   effectVal:2,   desc:'+2/min' },
  { id:'pet_frog',     name:'Lucky Frog',   type:'pet', rarity:'common',    cost:160, emoji:'🐸', imageUrl:'', effect:'coins_min',   effectVal:1,   desc:'+1/min' },
  // Rare: +x coins/min (higher values)
  { id:'pet_fox',      name:'Clever Fox',   type:'pet', rarity:'rare',      cost:500, emoji:'🦊', imageUrl:'', effect:'coins_min',   effectVal:10,  desc:'+10/min' },
  { id:'pet_owl',      name:'Wise Owl',     type:'pet', rarity:'rare',      cost:500, emoji:'🦉', imageUrl:'', effect:'coins_min',   effectVal:12,  desc:'+12/min' },
  { id:'pet_panda',    name:'Panda Pal',    type:'pet', rarity:'rare',      cost:450, emoji:'🐼', imageUrl:'', effect:'coins_min',   effectVal:8,   desc:'+8/min' },
  // Epic: x coins multiplier
  { id:'pet_dragon',   name:'Mini Dragon',  type:'pet', rarity:'epic',      cost:1000,emoji:'🐉', imageUrl:'', effect:'coins_mult',  effectVal:1.5, desc:'x1.5 coins' },
  { id:'pet_dino2',    name:'Tiny Rex',     type:'pet', rarity:'epic',      cost:1000,emoji:'🦕', imageUrl:'', effect:'coins_mult',  effectVal:2,   desc:'x2 coins' },
  { id:'pet_unicorn',  name:'Unicorn',      type:'pet', rarity:'epic',      cost:900, emoji:'🦄', imageUrl:'', effect:'coins_mult',  effectVal:1.8, desc:'x1.8 coins' },
  // Legendary: ticket bonus
  { id:'pet_phoenix',  name:'Baby Phoenix', type:'pet', rarity:'legendary', cost:3000,emoji:'🦅', imageUrl:'', effect:'ticket_bonus', effectVal:0.2, desc:'20% +1tix' },
  { id:'pet_golddragon',name:'Gold Dragon', type:'pet', rarity:'legendary', cost:3000,emoji:'🐲', imageUrl:'', effect:'ticket_bonus', effectVal:0.3, desc:'30% +1tix' },
];

// ── PLAYER DEFAULTS ──────────────────────────────────────────────────────────
export const DEF_P = {
  name:'Employee',
  coins:0,
  tickets:0,
  eliteTickets:0,
  ownedItems:['hat_none','shirt_none','pants_none','kb_plain','ms_classic'],
  equippedTheme:'midnight',
  equippedHat:'hat_none',
  equippedShirt:'shirt_none',
  equippedPants:'pants_none',
  equippedKbSkin:'kb_plain',
  equippedMsSkin:'ms_classic',
  equippedPet:null,
  skinColor:'#FDBCB4',
  mineLevel:1,
  mineWins:0,
  mineLosses:0,
  winsAtLevel:0,
  boardsDone:0,
  notifications:[],
  streak:0,
  lastLoginDate:'',
  lastPeeperDate:'',
  minePlaysToday:0,
  minePlaysDate:'',
};

// ── FRIEND DEFAULTS ──────────────────────────────────────────────────────────
export const DEF_F = {
  name:'Alex',
  coins:0,
  tickets:0,
  eliteTickets:0,
  mineLevel:1,
  mineWins:0,
  messages:[],
};

// ── KANBAN DEFAULTS ──────────────────────────────────────────────────────────
export const DEF_CARDS = [
  { id:'c1',title:'Setup auth',desc:'Login flow',list:'todo',dueDate:'',submittedAt:'',files:[],image:'🔐' },
  { id:'c2',title:'Dashboard UI',desc:'Main layout',list:'inprogress',dueDate:'',submittedAt:'',files:[],image:'📊' },
];

// ── REGULAR WHEEL SEGMENTS ───────────────────────────────────────────────────
export const DEF_REG = [
  { id:0, label:'50 Coins',  type:'coins',         val:50,    weight:30, color:'#4ECDC4',  emoji:'', imageUrl:'' },
  { id:1, label:'100 Coins', type:'coins',         val:100,   weight:25, color:'#FFE66D',  emoji:'', imageUrl:'' },
  { id:2, label:'200 Coins', type:'coins',         val:200,   weight:20, color:'#95E1D3',  emoji:'', imageUrl:'' },
  { id:3, label:'500 Coins', type:'coins',         val:500,   weight:12, color:'#FF8B94',  emoji:'', imageUrl:'' },
  { id:4, label:'+2 Tickets',type:'tickets',       val:2,     weight:8,  color:'#C7CEEA',  emoji:'', imageUrl:'' },
  { id:5, label:'ELITE',     type:'elite_ticket',  val:1,     weight:5,  color:'#FF6B6B',  emoji:'', imageUrl:'' },
];

// ── ELITE WHEEL SEGMENTS ─────────────────────────────────────────────────────
export const DEF_ELITE = [
  { id:0, label:'1K',     type:'coins', val:1000,  weight:35, color:'#4ECDC4', emoji:'', imageUrl:'' },
  { id:1, label:'2.5K',   type:'coins', val:2500,  weight:25, color:'#FFE66D', emoji:'', imageUrl:'' },
  { id:2, label:'5K',     type:'coins', val:5000,  weight:15, color:'#95E1D3', emoji:'', imageUrl:'' },
  { id:3, label:'Prize',  type:'custom',val:'Boss buys lunch!',weight:13,color:'#C7CEEA',emoji:'',imageUrl:'' },
  { id:4, label:'10K',    type:'coins', val:10000, weight:8,  color:'#FF8B94', emoji:'', imageUrl:'' },
  { id:5, label:'JACKPOT',type:'jackpot',val:25000,weight:4,  color:'#FF6B6B', emoji:'', imageUrl:'' },
];

// ── ULTRA WHEEL SEGMENTS (1 configurable prize + 2 fixed) ────────────────────
export const DEF_ULTRA = [
  { id:0, label:'Prize A', type:'custom', val:'Day Off!',      weight:40, color:'#FFD700',  emoji:'', imageUrl:'' },
  { id:1, label:'Prize B', type:'custom', val:'Free Lunch!',   weight:35, color:'#FF8B94',  emoji:'', imageUrl:'' },
  { id:2, label:'Prize C', type:'custom', val:'Early Finish!', weight:25, color:'#4ECDC4',  emoji:'', imageUrl:'' },
];

// ── ADMIN DEFAULTS ───────────────────────────────────────────────────────────
export const DEF_ADMIN = {
  password:'admin',
  // Kanban tickets
  onTimeTickets:2,
  lateTickets:1,
  veryLateTickets:0,
  // Unlock costs
  themeUnlockCost:50,
  mineUnlockCost:100,
  ultraUnlockCost:1,
  plinkoUnlockCost:200,
  // Unlock types
  themeUnlockType:'tickets',
  mineUnlockType:'tickets',
  ultraUnlockType:'eliteTickets',
  plinkoUnlockType:'tickets',
  // Minesweeper
  minesweeperCost:50,
  minesweeperReturn:5,
  minesweeperDailyLimit:5,
  // Wheels
  ultraWheelCost:1,
  plinkoCost:100,
  // Board
  boardName:'Dev Board',
  shopResetTime:'09:00',
  shopPriceMin:10,
  shopPriceMax:200,
  // Floating emojis
  peeperChance:30,
  peeperTickets:3,
  peeperDurationMs:5*60*1000,
  eggplantChance:20,
  eggplantTickets:5,
  eggplantDurationMs:15*60*1000,
  flushedChance:15,
  flushedTickets:8,
  flushedDurationMs:15*60*1000,
  // Leaderboard
  lbMinItems:15,
  lbMult:1.25,
  // Daily streak
  streakBonus:1,
  // Kanban files
  kanbanFilesMaxGlobal:5,
  kanbanFilesMaxLocal:5,
};

// ── UNLOCKED FEATURES DEFAULTS ───────────────────────────────────────────────
export const DEF_UNLOCKED = {
  themes:false,
  minesweeper:false,
  ultraWheel:false,
  plinko:false,
};
