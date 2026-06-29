import React, { useState } from 'react';
import { THEMES, DEF_ADMIN, RARITY } from './data.js';

// ── ADMIN CONFIG PANEL ───────────────────────────────────────────────────────
export function AdminPanel({ admin, setAdmin, items, regSegs, eliteSegs, ultraSegs, setRegSegs, setEliteSegs, setUltraSegs, T }) {
  const [adminTab, setAdminTab] = useState('general');
  const [searchFilter, setSearchFilter] = useState('');

  // ── HELPER FUNCTION ──────────────────────────────────────────────────────
  const updateAdmin = (key, value) => {
    setAdmin(prev => ({ ...prev, [key]: value }));
  };

  const updateSegment = (type, id, field, value) => {
    const setSeg = type === 'reg' ? setRegSegs : type === 'elite' ? setEliteSegs : setUltraSegs;
    const segs = type === 'reg' ? regSegs : type === 'elite' ? eliteSegs : ultraSegs;
    setSeg(segs.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // ── CONFIG SECTIONS ─────────────────────────────────────────────────────
  const renderSection = (title, icon, fields) => (
    <div style={{ marginBottom: 24, padding: 16, background: T.card, borderRadius: 8, border: `1px solid ${T.border}` }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon} {title}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
        {fields.map((field, i) => (
          <div key={i}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: '#999' }}>
              {field.label}
            </label>
            {field.type === 'input' && (
              <input
                type={field.inputType || 'text'}
                value={admin[field.key]}
                onChange={e => updateAdmin(field.key, field.inputType === 'number' ? parseInt(e.target.value) : e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: T.border,
                  border: `1px solid ${T.border}`,
                  borderRadius: 4,
                  color: T.text,
                  boxSizing: 'border-box',
                }}
              />
            )}
            {field.type === 'select' && (
              <select
                value={admin[field.key]}
                onChange={e => updateAdmin(field.key, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: T.border,
                  border: `1px solid ${T.border}`,
                  borderRadius: 4,
                  color: T.text,
                }}
              >
                {field.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {field.type === 'range' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="range"
                  min={field.min || 0}
                  max={field.max || 100}
                  value={admin[field.key]}
                  onChange={e => updateAdmin(field.key, parseFloat(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, minWidth: 40 }}>{admin[field.key].toFixed(2)}</span>
              </div>
            )}
            {field.type === 'toggle' && (
              <button
                onClick={() => updateAdmin(field.key, !admin[field.key])}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: admin[field.key] ? T.accent : T.border,
                  border: 'none',
                  borderRadius: 4,
                  color: admin[field.key] ? '#111' : T.text,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {admin[field.key] ? '✅ Enabled' : '❌ Disabled'}
              </button>
            )}
            {field.hint && <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{field.hint}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px' }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 8 }}>
        {[
          { key: 'general', label: '⚙️ General', icon: '⚙️' },
          { key: 'wheels', label: '🎡 Wheels', icon: '🎡' },
          { key: 'emojis', label: '😊 Emojis', icon: '😊' },
          { key: 'minesweeper', label: '⛏️ Minesweeper', icon: '⛏️' },
          { key: 'pets', label: '🐾 Pets', icon: '🐾' },
          { key: 'progression', label: '📈 Progression', icon: '📈' },
          { key: 'kanban', label: '📋 Kanban', icon: '📋' },
          { key: 'shop', label: '🛍️ Shop', icon: '🛍️' },
          { key: 'segments', label: '🎯 Segments', icon: '🎯' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setAdminTab(t.key)}
            style={{
              padding: '10px 16px',
              background: adminTab === t.key ? T.accent : T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              color: adminTab === t.key ? '#111' : T.text,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* GENERAL TAB */}
      {adminTab === 'general' && (
        <>
          {renderSection('🏢 Board Settings', '🏢', [
            { key: 'boardName', label: 'Board Name', type: 'input' },
            { key: 'password', label: 'Admin Password', type: 'input' },
          ])}
          {renderSection('🎨 Theme Settings', '🎨', [
            { key: 'boardName', label: 'Primary Board Color', type: 'input', hint: 'Accent color for board' },
          ])}
        </>
      )}

      {/* WHEELS TAB */}
      {adminTab === 'wheels' && (
        <>
          {renderSection('💳 Regular Wheel', '💳', [
            { key: 'regWheelCost', label: 'Spin Cost (Tickets)', type: 'input', inputType: 'number' },
          ])}
          {renderSection('⭐ Elite Wheel', '⭐', [
            { key: 'eliteWheelCost', label: 'Spin Cost (Elite Tickets)', type: 'input', inputType: 'number' },
          ])}
          {renderSection('🎁 Ultra Wheel', '🎁', [
            { key: 'ultraWheelCost', label: 'Spin Cost (Elite Tickets)', type: 'input', inputType: 'number' },
            { key: 'ultraUnlockCost', label: 'Unlock Cost', type: 'input', inputType: 'number' },
            { key: 'ultraUnlockType', label: 'Unlock Currency', type: 'select', options: [{ value: 'tickets', label: 'Tickets' }, { value: 'eliteTickets', label: 'Elite Tickets' }] },
          ])}
          {renderSection('🎰 Plinko', '🎰', [
            { key: 'plinkoCost', label: 'Cost Per Game (Coins)', type: 'input', inputType: 'number' },
            { key: 'plinkoUnlockCost', label: 'Unlock Cost', type: 'input', inputType: 'number' },
            { key: 'plinkoUnlockType', label: 'Unlock Currency', type: 'select', options: [{ value: 'tickets', label: 'Tickets' }, { value: 'eliteTickets', label: 'Elite Tickets' }] },
          ])}
        </>
      )}

      {/* EMOJIS TAB */}
      {adminTab === 'emojis' && (
        <>
          {renderSection('👀 Peeper Emoji', '👀', [
            { key: 'peeperChance', label: 'Spawn Chance (%)', type: 'range', min: 0, max: 100 },
            { key: 'peeperTickets', label: 'Reward Tickets', type: 'input', inputType: 'number' },
            { key: 'peeperDurationMs', label: 'Duration (ms)', type: 'input', inputType: 'number', hint: '300000 = 5 min' },
          ])}
          {renderSection('🍆 Eggplant Emoji', '🍆', [
            { key: 'eggplantChance', label: 'Spawn Chance (%)', type: 'range', min: 0, max: 100 },
            { key: 'eggplantTickets', label: 'Reward Tickets', type: 'input', inputType: 'number' },
            { key: 'eggplantDurationMs', label: 'Duration (ms)', type: 'input', inputType: 'number', hint: '900000 = 15 min' },
          ])}
          {renderSection('😳 Flushed Emoji', '😳', [
            { key: 'flushedChance', label: 'Spawn Chance (%)', type: 'range', min: 0, max: 100 },
            { key: 'flushedTickets', label: 'Reward Tickets', type: 'input', inputType: 'number' },
            { key: 'flushedDurationMs', label: 'Duration (ms)', type: 'input', inputType: 'number', hint: '900000 = 15 min' },
          ])}
        </>
      )}

      {/* MINESWEEPER TAB */}
      {adminTab === 'minesweeper' && (
        <>
          {renderSection('⛏️ Minesweeper', '⛏️', [
            { key: 'minesweeperCost', label: 'Cost Per Game (Tickets)', type: 'input', inputType: 'number' },
            { key: 'minesweeperDailyLimit', label: 'Daily Play Limit', type: 'input', inputType: 'number' },
            { key: 'mineUnlockCost', label: 'Unlock Cost', type: 'input', inputType: 'number' },
            { key: 'mineUnlockType', label: 'Unlock Currency', type: 'select', options: [{ value: 'tickets', label: 'Tickets' }, { value: 'eliteTickets', label: 'Elite Tickets' }] },
          ])}
        </>
      )}

      {/* PETS TAB */}
      {adminTab === 'pets' && (
        <div style={{ padding: 16, background: T.card, borderRadius: 8, border: `1px solid ${T.border}` }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>🐾 Pet Effects</h3>
          <p style={{ color: '#999', fontSize: 12, marginBottom: 16 }}>
            Pet effects are configured in data.js. Edit these values to adjust rewards:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            {items.filter(x => x.type === 'pet').slice(0, 6).map(pet => (
              <div
                key={pet.id}
                style={{
                  padding: 12,
                  background: T.border,
                  borderRadius: 6,
                  border: `2px solid ${RARITY[pet.rarity]?.color || '#999'}`,
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{pet.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{pet.name}</div>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{pet.desc}</div>
                <div style={{ fontSize: 10, background: T.card, padding: 6, borderRadius: 3 }}>
                  Effect: <strong>{pet.effect}</strong> ({pet.effectVal})
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#666', marginTop: 16 }}>
            💡 Edit pet.effectVal in data.js to change pet rewards. Common (coins_min): +x/min | Epic (coins_mult): x multiplier | Legendary (ticket_bonus): % chance
          </p>
        </div>
      )}

      {/* PROGRESSION TAB */}
      {adminTab === 'progression' && (
        <>
          {renderSection('🔥 Daily Streak', '🔥', [
            { key: 'streakBonus', label: 'Tickets Per 7-Day Streak', type: 'input', inputType: 'number' },
          ])}
          {renderSection('🏆 Leaderboard', '🏆', [
            { key: 'lbMinItems', label: 'Items Needed for Multiplier', type: 'input', inputType: 'number' },
            { key: 'lbMult', label: 'Coin Multiplier', type: 'input', inputType: 'number', hint: '1.25 = 25% bonus' },
          ])}
          {renderSection('📋 Kanban Tickets', '📋', [
            { key: 'onTimeTickets', label: 'On-Time Completion', type: 'input', inputType: 'number' },
            { key: 'lateTickets', label: 'Late (0-2 days)', type: 'input', inputType: 'number' },
            { key: 'veryLateTickets', label: 'Very Late (2+ days)', type: 'input', inputType: 'number' },
          ])}
          {renderSection('🔒 Unlock Costs', '🔒', [
            { key: 'themeUnlockCost', label: 'Theme Unlock Cost', type: 'input', inputType: 'number' },
            { key: 'themeUnlockType', label: 'Theme Unlock Type', type: 'select', options: [{ value: 'tickets', label: 'Tickets' }, { value: 'eliteTickets', label: 'Elite Tickets' }] },
            { key: 'mineUnlockCost', label: 'Minesweeper Unlock Cost', type: 'input', inputType: 'number' },
            { key: 'mineUnlockType', label: 'Minesweeper Unlock Type', type: 'select', options: [{ value: 'tickets', label: 'Tickets' }, { value: 'eliteTickets', label: 'Elite Tickets' }] },
          ])}
        </>
      )}

      {/* KANBAN TAB */}
      {adminTab === 'kanban' && (
        <>
          {renderSection('📋 Kanban Files', '📋', [
            { key: 'kanbanFilesMaxGlobal', label: 'Max Files Per Board (System)', type: 'input', inputType: 'number', hint: 'Default limit across all boards' },
            { key: 'kanbanFilesMaxLocal', label: 'Max Files Per Board (Individual)', type: 'input', inputType: 'number', hint: 'Can override per board' },
          ])}
          <div style={{ padding: 16, background: T.card, borderRadius: 8, border: `1px solid ${T.border}`, marginTop: 20 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>📝 Per-Board Overrides</h3>
            <p style={{ color: '#999', fontSize: 12, marginBottom: 12 }}>
              Set custom file limits for individual boards in the Employee Kanban view
            </p>
          </div>
        </>
      )}

      {/* SHOP TAB */}
      {adminTab === 'shop' && (
        <>
          {renderSection('🛍️ Shop Settings', '🛍️', [
            { key: 'shopResetTime', label: 'Daily Reset Time (HH:MM)', type: 'input' },
            { key: 'shopPriceMin', label: 'Min Item Price', type: 'input', inputType: 'number' },
            { key: 'shopPriceMax', label: 'Max Item Price', type: 'input', inputType: 'number' },
          ])}
        </>
      )}

      {/* SEGMENTS TAB - Edit Wheel Segments */}
      {adminTab === 'segments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
          {/* Regular Wheel Segments */}
          <div style={{ padding: 16, background: T.card, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>💳 Regular Wheel Segments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {regSegs.map(seg => (
                <div key={seg.id} style={{ padding: 8, background: T.border, borderRadius: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Segment {seg.id}</div>
                  <input
                    type="text"
                    value={seg.label}
                    onChange={e => updateSegment('reg', seg.id, 'label', e.target.value)}
                    placeholder="Label"
                    style={{ width: '100%', padding: 4, marginBottom: 4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 2, color: T.text }}
                  />
                  <input
                    type="number"
                    value={seg.weight}
                    onChange={e => updateSegment('reg', seg.id, 'weight', parseInt(e.target.value))}
                    placeholder="Weight"
                    style={{ width: '100%', padding: 4, marginBottom: 4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 2, color: T.text }}
                  />
                  <input
                    type="text"
                    value={seg.color || '#4ECDC4'}
                    onChange={e => updateSegment('reg', seg.id, 'color', e.target.value)}
                    placeholder="Color"
                    style={{ width: '100%', padding: 4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 2, color: T.text }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Elite Wheel Segments */}
          <div style={{ padding: 16, background: T.card, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>⭐ Elite Wheel Segments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {eliteSegs.map(seg => (
                <div key={seg.id} style={{ padding: 8, background: T.border, borderRadius: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Segment {seg.id}</div>
                  <input
                    type="text"
                    value={seg.label}
                    onChange={e => updateSegment('elite', seg.id, 'label', e.target.value)}
                    placeholder="Label"
                    style={{ width: '100%', padding: 4, marginBottom: 4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 2, color: T.text }}
                  />
                  <input
                    type="number"
                    value={seg.weight}
                    onChange={e => updateSegment('elite', seg.id, 'weight', parseInt(e.target.value))}
                    placeholder="Weight"
                    style={{ width: '100%', padding: 4, marginBottom: 4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 2, color: T.text }}
                  />
                  <input
                    type="text"
                    value={seg.color || '#FFE66D'}
                    onChange={e => updateSegment('elite', seg.id, 'color', e.target.value)}
                    placeholder="Color"
                    style={{ width: '100%', padding: 4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 2, color: T.text }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
