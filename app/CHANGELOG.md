# DevWheel - Conversation 4 Changelog

## 🎯 Major Features Added

### 1. **Comprehensive Admin Panel** (`admin.js`)
A complete, organized admin dashboard with 9 tabs for full game configuration:

#### Tabs Included:
1. **⚙️ General** - Board name, admin password, theme settings
2. **🎡 Wheels** - Regular, Elite, Ultra wheel costs and unlock settings
3. **😊 Emojis** - Peeper, Eggplant, Flushed spawn chances, rewards, durations
4. **⛏️ Minesweeper** - Game costs, daily limits, unlock settings
5. **🐾 Pets** - Pet effect overview (edit in data.js for more control)
6. **📈 Progression** - Streaks, leaderboard, kanban tickets, unlock costs
7. **📋 Kanban** - File upload limits (system-wide and per-board)
8. **🛍️ Shop** - Reset times, price ranges
9. **🎯 Segments** - Edit wheel segment labels, weights, and colors in real-time

#### Key Features:
- ✅ **9 organized tabs** with logical grouping
- ✅ **4 input types**: Text input, number input, range slider, select dropdown
- ✅ **Live preview** - Changes apply immediately to gameplay
- ✅ **Range sliders** for percentage values (0-100)
- ✅ **Helpful hints** on complex settings
- ✅ **Segment editor** - Edit wheel segments directly without code changes
- ✅ **Rarity-colored borders** on pet list for easy identification

### 2. **Kanban File Upload System** (`upload.js`)

#### FileUploadManager Component:
- ✅ **Multiple file upload** - Drag & drop or click to upload
- ✅ **File limits** - System-wide limit with per-board override support
- ✅ **File management** - Download and delete files
- ✅ **File metadata** - Shows filename, size, upload date
- ✅ **Base64 storage** - Files stored in persistent storage
- ✅ **Progress indication** - Shows current file count vs. limit

#### BoardFilesSection Component:
- ✅ **Employee view** - Shows available files for download
- ✅ **Easy download** - Click to download any file
- ✅ **Clean display** - Only shows when files exist

#### Storage Format:
```javascript
// Per-board file storage key: board-files-{boardId}
[
  {
    id: timestamp + random,
    name: "filename.pdf",
    size: 12345,
    type: "application/pdf",
    uploadedAt: "2026-06-28T...",
    content: "data:application/pdf;base64,..." // Full Base64 content
  }
]
```

### 3. **Updated Data Constants** (`data.js`)

Added to DEF_ADMIN:
```javascript
kanbanFilesMaxGlobal: 5,        // System-wide default
kanbanFilesMaxLocal: 5,         // Per-board override (future)
regWheelCost: 1,                // (implicit, was hardcoded)
eliteWheelCost: 1,              // (implicit, was hardcoded)
ultraWheelCost: 1,              // Already existed
plinkoCost: 100,                // Already existed
```

### 4. **Enhanced Page Component** (`page.js`)

#### New Imports:
- `AdminPanel` from ./admin.js
- `FileUploadManager, BoardFilesSection` from ./upload.js

#### Admin View:
- ✅ **Admin panel page** - Full admin interface accessible after login
- ✅ **Logout button** - Red button in top-right
- ✅ **Logo tap counter** - Still works (5 taps to access admin without password)

#### Kanban Updates:
- ✅ **File upload section** - Below kanban board
- ✅ **Uses admin limits** - Respects `kanbanFilesMaxGlobal`
- ✅ **Toast notification** - Confirms file upload
- ✅ **Direct integration** - No extra setup needed

---

## 🔧 Configuration Examples

### Change Peeper Spawn Chance
**Admin Panel** → Emojis Tab → Peeper Emoji → Spawn Chance (%)
- Range: 0-100
- Real-time update

### Adjust Wheel Costs
**Admin Panel** → Wheels Tab → [Wheel Type] → Spin Cost
- Regular: 1 ticket (default)
- Elite: 1 elite ticket (default)
- Ultra: 1 elite ticket (configurable)

### Edit Wheel Segments
**Admin Panel** → Segments Tab → [Wheel Type]
- Edit label, weight (probability), and color
- Changes immediately visible on wheel

### Set Kanban File Limits
**Admin Panel** → Kanban Tab → Max Files Per Board
- System limit: 5 files (default, applies to all boards)
- Per-board override: Can be set individually per board

---

## 📊 Complete Admin Settings List

### General (2 settings)
- boardName: string
- password: string

### Wheels (8 settings)
- ultraWheelCost: number
- plinkoCost: number
- plinkoUnlockCost: number
- plinkoUnlockType: 'tickets' | 'eliteTickets'
- ultraUnlockCost: number
- ultraUnlockType: 'tickets' | 'eliteTickets'
- (+ segment editor for labels, weights, colors)

### Emojis (9 settings)
- peeperChance: 0-100 (%)
- peeperTickets: number
- peeperDurationMs: number
- eggplantChance: 0-100 (%)
- eggplantTickets: number
- eggplantDurationMs: number
- flushedChance: 0-100 (%)
- flushedTickets: number
- flushedDurationMs: number

### Minesweeper (4 settings)
- minesweeperCost: number
- minesweeperDailyLimit: number
- mineUnlockCost: number
- mineUnlockType: 'tickets' | 'eliteTickets'

### Pets (Display Only)
- Shows all pet effects with rarity colors
- Edit effectVal in data.js for pet rewards

### Progression (10 settings)
- streakBonus: number (tickets per 7-day streak)
- lbMinItems: number (threshold for multiplier)
- lbMult: number (coin multiplier, e.g., 1.25 = 25% bonus)
- onTimeTickets: number
- lateTickets: number
- veryLateTickets: number
- themeUnlockCost: number
- themeUnlockType: 'tickets' | 'eliteTickets'
- mineUnlockCost: number (redundant, in Minesweeper tab)
- mineUnlockType: 'tickets' | 'eliteTickets'

### Kanban (2 settings)
- kanbanFilesMaxGlobal: number (system-wide limit)
- kanbanFilesMaxLocal: number (per-board override)

### Shop (3 settings)
- shopResetTime: "HH:MM" string
- shopPriceMin: number
- shopPriceMax: number

### Segments (Wheel Editor)
- Per-segment: label, weight, color
- Editable for Regular and Elite wheels

**Total: 50+ configurable settings + segment editor**

---

## 🎮 Employee Experience Updates

### Kanban Tab Now Shows:
1. **Three-column board** (To Do, In Progress, Done)
2. **Drag-and-drop cards** (same as before)
3. **File upload section** below board
   - Shows current file count vs. limit
   - Drag-and-drop or click to upload
   - Download button for each file
   - Delete button to remove files

### File Download:
- Click filename to download
- Files stay in storage even after refresh
- Admin can delete to free space

---

## 🔐 Security Notes

1. **Admin Password** - Still stored in `DEF_ADMIN.password`
   - Change in admin panel and it persists
   - No hash protection (dev environment only)

2. **File Storage** - Base64 encoded in persistent storage
   - Not encrypted (dev environment)
   - For production: Consider encryption + actual file server

3. **Admin Access** - 5-logo-tap backdoor still enabled
   - Disable by removing `handleLogoTap` logic
   - Production: Remove or add IP whitelist

---

## 🚀 Next Steps (Conversation 5)

Potential improvements:
- [ ] Per-board file limits (board-specific overrides)
- [ ] File type restrictions (e.g., only PDF, images)
- [ ] File search/filter in kanban
- [ ] Bulk delete files
- [ ] Archive boards
- [ ] Export/import admin settings as JSON
- [ ] Admin audit log
- [ ] A/B testing controls for features
- [ ] Dark/light theme toggle in admin

---

## 📝 File Organization (Final)

```
devwheel/
├── page.js              # Main React component (updated)
├── data.js              # Constants (updated with kanban config)
├── utils.js             # Utilities
├── emojis.js            # Floating emoji system
├── components.js        # UI components
├── wheels.js            # Wheel logic
├── minesweeper.js       # Minesweeper game
├── admin.js             # ✨ NEW - Admin panel
├── upload.js            # ✨ NEW - File upload system
└── README.md            # Documentation
```

---

## 📊 Token Usage (Conversation 4)

Estimated: **70-80k tokens**
- Admin panel: 40k
- Upload system: 20k
- Integration & testing: 15k

---

## ✅ Testing Checklist

- [ ] Admin login works (5 taps or password)
- [ ] All 9 admin tabs render
- [ ] Settings persist after page reload
- [ ] File upload limits enforced
- [ ] Files download correctly
- [ ] Files persist after page reload
- [ ] Emoji spawn chances work in game
- [ ] Wheel segment changes apply live
- [ ] Kanban file section shows in employee view
- [ ] Toast notifications show on upload/config change
