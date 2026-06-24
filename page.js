'use client';

import React, { useState, useEffect } from 'react';

export default function WheelOfFortune() {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('wof-players');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Player 1', coins: 0 },
      { id: 2, name: 'Player 2', coins: 0 }
    ];
  });

  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [taskName, setTaskName] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [lastReward, setLastReward] = useState(0);
  const [editingName, setEditingName] = useState(null);
  const [newName, setNewName] = useState('');

  // Difficulty-based wheel segments
  const difficultyConfig = {
    easy: [20, 30, 25, 35, 15, 40],
    medium: [50, 75, 100, 60, 85, 70],
    hard: [150, 200, 250, 180, 220, 190],
    epic: [400, 500, 600, 450, 550, 500]
  };

  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#C7CEEA', '#FF8B94'];
  const segments = difficultyConfig[difficulty];

  // Save players to localStorage
  useEffect(() => {
    localStorage.setItem('wof-players', JSON.stringify(players));
  }, [players]);

  const awardCoins = (amount) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === currentPlayer ? { ...p, coins: p.coins + amount } : p
      )
    );
    setLastReward(amount);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  const spin = () => {
    if (!taskName.trim()) {
      alert('Enter a task name!');
      return;
    }

    setIsSpinning(true);
    setShowReward(false);

    // Calculate winning segment
    const winningSegmentIndex = Math.floor(Math.random() * segments.length);
    const winningAmount = segments[winningSegmentIndex];

    // Spin animation: multiple rotations + final position
    const totalRotation = 360 * 5 + (winningSegmentIndex * (360 / segments.length));
    
    setWheelRotation(totalRotation);

    setTimeout(() => {
      awardCoins(winningAmount);
      setTaskName('');
      setIsSpinning(false);
    }, 3000);
  };

  const updatePlayerName = (id) => {
    if (newName.trim()) {
      setPlayers(prev =>
        prev.map(p =>
          p.id === id ? { ...p, name: newName } : p
        )
      );
    }
    setEditingName(null);
    setNewName('');
  };

  const addPlayer = () => {
    const newId = Math.max(...players.map(p => p.id)) + 1;
    setPlayers([...players, { id: newId, name: `Player ${newId}`, coins: 0 }]);
  };

  const player = players.find(p => p.id === currentPlayer);
  const sortedPlayers = [...players].sort((a, b) => b.coins - a.coins);

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(var(--rotation)); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-win {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .wheel-spinning {
          animation: spin 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          --rotation: ${wheelRotation}deg;
        }
        .reward-pop {
          animation: pulse-win 0.6s ease-out;
        }
        .floating {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🎡 Wheel of Fortune</h1>
        <p style={styles.subtitle}>Project Rewards</p>
      </div>

      {/* Main Content */}
      <div style={styles.mainGrid}>
        {/* Left: Wheel */}
        <div style={styles.wheelSection}>
          <div style={styles.wheelWrapper}>
            <svg
              width="300"
              height="300"
              viewBox="0 0 300 300"
              style={{
                ...styles.wheelSvg,
                transform: `rotate(${wheelRotation}deg)`,
                transition: isSpinning ? 'none' : 'transform 0.3s ease'
              }}
            >
              {segments.map((value, i) => {
                const angle = (i / segments.length) * 360;
                const nextAngle = ((i + 1) / segments.length) * 360;
                const startRad = (angle * Math.PI) / 180;
                const endRad = (nextAngle * Math.PI) / 180;
                const x1 = 150 + 120 * Math.cos(startRad);
                const y1 = 150 + 120 * Math.sin(startRad);
                const x2 = 150 + 120 * Math.cos(endRad);
                const y2 = 150 + 120 * Math.sin(endRad);
                const largeArc = nextAngle - angle > 180 ? 1 : 0;
                const midAngle = (angle + nextAngle) / 2;
                const midRad = (midAngle * Math.PI) / 180;
                const textX = 150 + 80 * Math.cos(midRad);
                const textY = 150 + 80 * Math.sin(midRad);

                return (
                  <g key={i}>
                    <path
                      d={`M 150 150 L ${x1} ${y1} A 120 120 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={colors[i]}
                      stroke="#222"
                      strokeWidth="2"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        fill: '#222',
                        pointerEvents: 'none'
                      }}
                      transform={`rotate(${midAngle + 90} ${textX} ${textY})`}
                    >
                      {value}
                    </text>
                  </g>
                );
              })}
              {/* Center circle */}
              <circle cx="150" cy="150" r="30" fill="#222" stroke="#fff" strokeWidth="3" />
              <text
                x="150"
                y="150"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fill: '#FFE66D',
                  pointerEvents: 'none'
                }}
              >
                💰
              </text>
            </svg>

            {/* Pointer */}
            <div style={styles.pointer}>▼</div>
          </div>
        </div>

        {/* Right: Controls & Leaderboard */}
        <div style={styles.rightPanel}>
          {/* Player Selection */}
          <div style={styles.playerSelector}>
            <label style={styles.label}>Playing as:</label>
            <select
              value={currentPlayer}
              onChange={(e) => setCurrentPlayer(Number(e.target.value))}
              style={styles.select}
            >
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Current Player Score */}
          <div style={styles.scoreBox}>
            <div style={styles.playerName}>{player?.name}</div>
            <div style={styles.coinsDisplay}>{player?.coins || 0}</div>
            <div style={styles.coinsLabel}>Coins</div>
          </div>

          {/* Task Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Task Name:</label>
            <input
              type="text"
              placeholder="e.g., Fix login bug"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isSpinning && spin()}
              style={styles.input}
              disabled={isSpinning}
            />
          </div>

          {/* Difficulty */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Difficulty:</label>
            <div style={styles.difficultyButtons}>
              {Object.keys(difficultyConfig).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    ...styles.difficultyBtn,
                    ...(difficulty === d ? styles.difficultyBtnActive : {})
                  }}
                  disabled={isSpinning}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={spin}
            disabled={isSpinning}
            style={{
              ...styles.spinButton,
              ...(isSpinning ? styles.spinButtonDisabled : {})
            }}
          >
            {isSpinning ? 'SPINNING...' : '🎡 SPIN'}
          </button>

          {/* Reward Display */}
          {showReward && (
            <div style={styles.rewardBox} className="reward-pop">
              <div style={styles.rewardText}>+{lastReward} Coins!</div>
              <div style={styles.rewardEmoji}>🎉</div>
            </div>
          )}

          {/* Add Player Button */}
          <button
            onClick={addPlayer}
            style={styles.addPlayerBtn}
          >
            + Add Player
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={styles.leaderboard}>
        <h2 style={styles.leaderboardTitle}>🏆 Leaderboard</h2>
        <div style={styles.leaderboardList}>
          {sortedPlayers.map((p, i) => (
            <div key={p.id} style={styles.leaderboardRow}>
              <span style={styles.rank}>#{i + 1}</span>
              <span
                style={{
                  ...styles.leaderboardName,
                  cursor: 'pointer',
                  opacity: editingName === p.id ? 0.5 : 1
                }}
                onClick={() => {
                  setEditingName(p.id);
                  setNewName(p.name);
                }}
              >
                {editingName === p.id ? (
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() => updatePlayerName(p.id)}
                    onKeyPress={(e) => e.key === 'Enter' && updatePlayerName(p.id)}
                    style={styles.nameInput}
                  />
                ) : (
                  p.name
                )}
              </span>
              <span style={styles.leaderboardCoins}>{p.coins}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          onClick={() => {
            if (window.confirm('Reset all coins? This cannot be undone.')) {
              setPlayers(players.map(p => ({ ...p, coins: 0 })));
            }
          }}
          style={styles.resetBtn}
        >
          🔄 Reset All Coins
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '48px',
    margin: '0 0 8px 0',
    fontWeight: '800',
    background: 'linear-gradient(45deg, #4ECDC4, #FFE66D)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '18px',
    color: '#aaa',
    margin: 0,
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  wheelSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelWrapper: {
    position: 'relative',
    width: '350px',
    height: '350px',
  },
  wheelSvg: {
    filter: 'drop-shadow(0 0 30px rgba(78, 205, 196, 0.3))',
  },
  pointer: {
    position: 'absolute',
    top: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '30px',
    color: '#FFE66D',
    fontWeight: 'bold',
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  playerSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4ECDC4',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  select: {
    padding: '12px 16px',
    background: '#0f3460',
    border: '2px solid #4ECDC4',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  scoreBox: {
    background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(78, 205, 196, 0.2)',
  },
  playerName: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '8px',
    fontWeight: '600',
  },
  coinsDisplay: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '4px',
  },
  coinsLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  input: {
    padding: '12px 16px',
    background: '#0f3460',
    border: '2px solid #555',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontFamily: 'inherit',
  },
  difficultyButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  difficultyBtn: {
    padding: '10px 12px',
    background: '#0f3460',
    border: '2px solid #555',
    borderRadius: '8px',
    color: '#aaa',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  difficultyBtnActive: {
    background: '#4ECDC4',
    borderColor: '#4ECDC4',
    color: '#222',
  },
  spinButton: {
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #FFE66D, #FF8B94)',
    border: 'none',
    borderRadius: '12px',
    color: '#222',
    fontSize: '18px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 24px rgba(255, 230, 109, 0.3)',
  },
  spinButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  rewardBox: {
    background: 'linear-gradient(135deg, #FFE66D, #FF8B94)',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#222',
  },
  rewardText: {
    fontSize: '28px',
    fontWeight: '800',
    marginBottom: '8px',
  },
  rewardEmoji: {
    fontSize: '40px',
  },
  addPlayerBtn: {
    padding: '12px 16px',
    background: '#0f3460',
    border: '2px dashed #4ECDC4',
    borderRadius: '8px',
    color: '#4ECDC4',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  leaderboard: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  leaderboardTitle: {
    fontSize: '28px',
    margin: '0 0 16px 0',
    color: '#FFE66D',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  leaderboardRow: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 80px',
    gap: '16px',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'rgba(78, 205, 196, 0.1)',
    borderLeft: '4px solid #4ECDC4',
    borderRadius: '8px',
  },
  rank: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#FFE66D',
  },
  leaderboardName: {
    fontSize: '16px',
    fontWeight: '600',
  },
  nameInput: {
    padding: '4px 8px',
    background: '#0f3460',
    border: '1px solid #4ECDC4',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
  },
  leaderboardCoins: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#4ECDC4',
    textAlign: 'right',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  resetBtn: {
    padding: '10px 20px',
    background: 'rgba(255, 107, 107, 0.2)',
    border: '1px solid #FF6B6B',
    borderRadius: '8px',
    color: '#FF6B6B',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
