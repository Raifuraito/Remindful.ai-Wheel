# 🎡 DevWheel Admin Guide

## 🔐 Accessing Admin Panel

**Method 1: Password**
1. On login screen, enter admin password (default: `admin`)
2. Click "🔓 Enter Admin"

**Method 2: Logo Tap (Backdoor)**
1. Click the 🎡 logo 5 times quickly (within 2.5 seconds)
2. Admin panel opens automatically
3. Works from any view

## 🏠 Admin Dashboard Overview

Once logged in, you'll see 9 configuration tabs:

| Tab | Purpose | Common Tasks |
|-----|---------|--------------|
| **⚙️ General** | Board name, password | Rename board, change admin password |
| **🎡 Wheels** | Wheel costs & unlocks | Adjust difficulty, set unlock requirements |
| **😊 Emojis** | Floating emoji config | Tweak spawn rates, reward amounts |
| **⛏️ Minesweeper** | Game settings | Set difficulty, unlock cost, daily limit |
| **🐾 Pets** | Pet overview | Info only; edit effects in data.js |
| **📈 Progression** | Streaks, multipliers | Adjust progression speed |
| **📋 Kanban** | File limits | Set max files per board |
| **🛍️ Shop** | Shop config | Adjust prices, reset time |
| **🎯 Segments** | Wheel segments | Edit wheel prizes, probabilities, colors |

---

## 🔧 Common Admin Tasks

### Task: Make the Game Harder

1. **⚙️ → Wheels Tab**
   - Increase `Spin Cost` for wheels (e.g., 1 → 2 tickets)
   - Increase `Unlock Cost` for Ultra Wheel/Plinko

2. **📈 → Progression Tab**
   - Increase `Items Needed for Multiplier` (e.g., 15 → 25)
   - Decrease `Coin Multiplier` (e.g., 1.25 → 1.1)

3. **⛏️ → Minesweeper Tab**
   - Increase `Cost Per Game` (more expensive)
   - Decrease `Daily Play Limit` (fewer attempts)

### Task: Make Rewards More Generous

1. **😊 → Emojis Tab**
   - Increase `Reward Tickets` for Peeper, Eggplant, Flushed
   - Increase `Spawn Chance` (%) to trigger more often

2. **🎯 → Segments Tab**
   - Select wheel (Regular, Elite, etc.)
   - Find highest-paying segments
   - Increase their `Weight` to make them more common

3. **📈 → Progression Tab**
   - Decrease `Items Needed for Multiplier`
   - Increase `Coin Multiplier` (e.g., 1.25 → 1.5)

### Task: Adjust Kanban File Limits

1. **📋 → Kanban Tab**
   - Change `Max Files Per Board (System)` to update default
   - Default is 5 files per board
   - Employees see upload counter: "Current / Limit"

### Task: Change Wheel Prizes

1. **🎯 → Segments Tab**
   - Click on the wheel (Regular, Elite, etc.)
   - For each segment:
     - **Label** - What prize is shown
     - **Weight** - Higher = more common (e.g., 20 = 20% chance)
     - **Color** - Segment color on wheel
   - Changes apply immediately

### Task: Prevent Cheating

1. **⚙️ → General Tab**
   - Change `Admin Password` to something secure
   - Note: 5-logo-tap backdoor still exists (remove if needed)

2. **📈 → Progression Tab**
   - Increase unlock costs to slow progression
   - Example: Make Ultra Wheel cost 10 tickets instead of 1

---

## 🎨 UI Control Guide

### Input Types You'll See:

**Text Input**
```
Enter any text value
Used for: board name, password, reset time
```

**Number Input**
```
Click arrows or type numbers
Used for: costs, limits, rewards, probabilities
```

**Range Slider**
```
Drag slider or click to set value
Used for: spawn chances (0-100%)
Shows current value on right
```

**Dropdown Select**
```
Click to see options
Used for: currency types (tickets vs elite tickets)
Common: 'tickets' or 'eliteTickets'
```

---

## 📊 Configuration Ranges (Recommended)

### Emoji Spawn Chances
- **Low** (10-20%): Rare, special events
- **Medium** (30-50%): Balanced, frequent
- **High** (70-90%): Very common, daily

### Wheel Costs
- **Regular**: 1 ticket (best for frequent play)
- **Elite**: 1-3 elite tickets (less frequent)
- **Ultra**: 1-5 elite tickets (special occasions)
- **Plinko**: 50-200 coins (varies by economy)

### Unlock Costs
- **Easy** (10-50): Players unlock within 1-2 days
- **Medium** (50-150): Within 1 week
- **Hard** (150-300): Within 2+ weeks

### Multipliers
- **Coin Multiplier**: 1.0-2.0 (1.25 = 25% bonus is standard)
- **Leaderboard Threshold**: 10-30 items needed

---

## 💾 Persisting Changes

All changes are **automatically saved** to storage when you modify them. No "Save" button needed!

### To Reset Everything
1. Clear browser localStorage
2. Restart the page
3. All settings revert to defaults (`DEF_ADMIN`)

---

## 🐛 Troubleshooting

### Emojis Not Appearing?
- Check `Spawn Chance (%)` - might be set to 0
- Check `Duration (ms)` - might be too short
- Reload page and try again

### File Upload Not Working?
- Check `Max Files Per Board` - might be at limit
- Try refreshing the page
- Check browser console for errors

### Wheel Changes Not Applying?
- Changes are live, but need to spin to see effect
- Check that weights add up (no required total)

### Admin Panel Not Loading?
- Logout and log back in
- Try 5-logo-tap method instead
- Check browser console for errors

---

## 🔑 Key Concepts

### Weight System (Wheels)
- Higher weight = more likely to land on that segment
- Example: Coin segments with weight 30, Prize with weight 5
- Probability = weight / (sum of all weights)
- Don't need to sum to 100

### Duration (Emojis)
- Time in milliseconds before emoji disappears
- 60,000 = 1 minute
- 300,000 = 5 minutes
- 900,000 = 15 minutes

### Multipliers
- 1.0 = no change
- 1.25 = 25% bonus (+25%)
- 1.5 = 50% bonus (+50%)
- 2.0 = 100% bonus (+100%, double)

### Currency Types
- `'tickets'` - Regular spin tickets (most common)
- `'eliteTickets'` - Rare tickets (unlock special features)

---

## 🎯 Power Admin Tips

### Tip 1: A/B Testing
- Change one setting at a time
- Note the impact before changing another
- Example: Increase peeper chance from 30% to 50%, observe engagement

### Tip 2: Seasonal Events
- Spike emoji spawn chances for holidays
- Reduce unlock costs for special periods
- Increase wheel rewards to boost participation

### Tip 3: Economy Balancing
- Monitor coin flow vs. consumption
- Adjust shop prices if coins become too easy
- Boost high-rarity pet rewards to maintain value

### Tip 4: Fast-Track Testing
- Lower all unlock costs to 1 for testing
- Set emoji chances to 100% to see them immediately
- Increase minesweeper daily limit to 100 for testing

---

## 📞 Questions?

Refer to:
- **README.md** - Technical architecture
- **CHANGELOG.md** - What's new in Conversation 4
- **data.js** - Default values (`DEF_ADMIN`)
- **admin.js** - Admin panel code

---

**Last Updated:** Conversation 4
**Admin Panel Version:** 1.0
