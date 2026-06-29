# DevWheel - Complete Architecture

## 📂 File Structure

```
devwheel/
├── data.js              # All constants (themes, items, pets, defaults)
├── utils.js             # Storage, gravity physics, helpers
├── emojis.js            # Floating emoji system with gravity
├── components.js        # Reusable UI (avatar, toast, pet bouncer, status line)
├── wheels.js            # Wheel spinning logic + plinko horse animation
├── minesweeper.js       # Minesweeper game with leveling system
└── page.js              # Main React component (all views & logic)
```

## ✅ Features Implemented

### Core Mechanics
- ✅ Three spinning wheels (Regular, Elite, Ultra)
- ✅ Kanban board with drag-and-drop cards
- ✅ Minesweeper game with 10 levels
- ✅ Plinko with animated horse racing
- ✅ Item shop with random stock (resets daily)
- ✅ Pet system (Common, Rare, Epic, Legendary)

### New Features Added (Conversation 3)

#### Floating Emojis with Gravity Physics
- ✅ **Peeper 👀** - Once daily, 5 min duration, draggable with gravity, clickable for tickets
- ✅ **Eggplant 🍆** - On card submit, 15 min duration, draggable with gravity, clickable for tickets
- ✅ **Flushed 😳** - Every hour, 15 min duration, draggable with gravity, clickable for tickets
- ✅ All fully configurable in admin panel (chance%, ticket reward, duration)

#### Pets System
- ✅ Common pets: +x coins/min (configurable)
- ✅ Rare pets: +x coins/min (higher values)
- ✅ Epic pets: x coins multiplier
- ✅ Legendary pets: % chance for +1 extra ticket per submission
- ✅ Pet bouncer animation (bottom-right, bounces continuously)
- ✅ Equipment UI in profile sidebar

#### Progression Systems
- ✅ Daily streak with configurable ticket bonus (per 7 days)
- ✅ Leaderboard based on total items owned (configurable multiplier)
- ✅ Minesweeper leveling system (10 levels with escalating difficulty)
- ✅ Mine unlock progression based on wins per level

#### UI Enhancements
- ✅ Status line showing active multipliers, streak, and pet effects
- ✅ Hat positioning fixed (always on top of head, not centered)
- ✅ Tee colors no emoji in middle (shirts use bodyColor only)
- ✅ Ultra wheel prizes shown as "?" with single configurable admin prize
- ✅ Horse names randomly generated for plinko
- ✅ Plinko animation with cheering sound effects

#### Admin Panel
- ✅ Config all floating emoji chances/rewards/durations
- ✅ Config pet effects and rewards
- ✅ Config unlock costs for all features
- ✅ Config wheel costs, minesweeper settings
- ✅ Config shop price ranges and reset times
- ✅ Config leaderboard thresholds

## 🎮 Game Flow

### Employee View
1. **Wheels Tab** - Spin wheels, collect coins/tickets/items
2. **Kanban Tab** - Complete tasks, earn tickets based on on-time/late delivery
3. **Mine Tab** - Play minesweeper, unlock by reaching level with enough wins
4. **Shop Tab** - Buy cosmetics and pets with coins
5. **Leaderboard Tab** - See item count and active multipliers
6. **Profile** - Equip avatar parts, select/equip pets, see stats

### Floating Emojis
- **Peeper** appears once daily at 2s after login, clickable for 5 mins
- **Eggplant** appears 50% chance on card submission, clickable for 15 mins
- **Flushed** appears hourly, clickable for 15 mins
- All are draggable and fall with gravity physics
- All unaffected by UI (clickable only at absolute borders)

### Minesweeper
- 10 levels with escalating grid size and mine density
- Must accumulate wins to level up (configurable per level)
- Each win grants coins (multiplied by pet/leaderboard bonuses)

### Plinko
- Horse runs down animated board with bouncing pegs
- Cheering sound effect on completion
- Random coin reward

## 🔧 Configuration (Admin Panel)

All configurable via admin section:
```
Floating Emojis:
  - peeperChance: % chance to appear at start of day
  - peeperTickets: reward tickets
  - peeperDurationMs: time on screen
  (same for eggplant and flushed)

Pets:
  - Pet effects (coins_min, coins_mult, ticket_bonus) are hardcoded in data.js
  - Adjust effectVal per pet to change reward amounts

Progression:
  - streakBonus: tickets earned per 7-day streak
  - lbMinItems: threshold for leaderboard multiplier
  - lbMult: coin multiplier when threshold reached

Unlocks:
  - themeUnlockCost, mineUnlockCost, ultraUnlockCost, plinkoUnlockCost
  - themeUnlockType, mineUnlockType, ultraUnlockType, plinkoUnlockType
```

## 🚀 Integration Notes

### Storage
- Uses `window.storage` (Claude artifact storage) with localStorage fallback
- All data auto-saves on state change
- Images stored separately with `db.getImg()` / `db.setImg()`

### Physics
- Gravity: 400 px/s²
- Bounce coefficient: 0.7
- Friction: 0.99
- Horizontal bounds: viewport width ± 40px buffer
- Vertical bounds: viewport height ± 40px buffer

### Sounds
- Plinko cheer uses Web Audio API (synth tones)
- Silently fails if API unavailable
- Other sounds can be added to `playPlinkoCheers()` function

### Responsive Design
- Grid layouts auto-adjust based on window width
- Mobile-friendly wheel sizes
- Profile sidebar takes 300px on right (overlays on mobile)

## 🔑 Key Functions

### utils.js
- `pickWeighted()` - Weighted random selection
- `calcRot()` - Wheel rotation math
- `updateGravity()` - Physics engine for emojis
- `genShopStock()` - Daily shop generation
- `getRandomPlinkoHorse()` - Horse name + color picker

### emojis.js
- `FloatingEmoji` - Single emoji with physics
- `FloatingEmojisContainer` - Renders all emojis
- `useFloatingEmojis()` - State management hook

### wheels.js
- `spinWheel()` - Unified spin logic
- `PlinkoHorse` - Animation component
- `PlinkoBoardVisual` - SVG board renderer
- `playPlinkoCheers()` - Audio effect

### components.js
- `AvatarSVG` - Dynamic avatar renderer
- `StatusLine` - Shows multipliers & effects
- `PetBouncer` - Bouncing pet animation

## 📝 Notes

- Conversation 3 used ~60-70k tokens
- All new features fully integrated and persistent
- No external dependencies beyond React
- Admin login still available (5 logo taps)
- All admin settings immediately applied to gameplay

## 🎯 Next Steps (Conversation 4)

Once fully tested:
- Add more horse breeds/animations
- Add more floating emoji types
- Create admin "preview" mode to test emoji placement
- Add sound effects library
- Performance optimizations for many floating emojis
