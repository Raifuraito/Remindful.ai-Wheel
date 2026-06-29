import React, { useState, useEffect } from 'react';
import { MINE_LVL_REQ } from './data.js';

// ── MINESWEEPER GAME ─────────────────────────────────────────────────────────
export function MinesweeperGame({ player, admin, onClose, onWin, onLose }) {
  const [board, setBoard] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const level = player.mineLevel || 1;
  const gridSize = 5 + level;
  const mineCount = Math.floor(gridSize * gridSize * 0.15);

  // Initialize board
  useEffect(() => {
    initializeGame();
  }, [level]);

  const initializeGame = () => {
    const newBoard = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    
    // Place mines randomly
    let placed = 0;
    while(placed < mineCount) {
      const r = Math.floor(Math.random() * gridSize);
      const c = Math.floor(Math.random() * gridSize);
      if(newBoard[r][c] !== 'M') {
        newBoard[r][c] = 'M';
        placed++;
      }
    }

    // Count adjacent mines
    for(let r = 0; r < gridSize; r++) {
      for(let c = 0; c < gridSize; c++) {
        if(newBoard[r][c] === 'M') continue;
        let count = 0;
        for(let dr = -1; dr <= 1; dr++) {
          for(let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if(nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && newBoard[nr][nc] === 'M') count++;
          }
        }
        newBoard[r][c] = count;
      }
    }

    setBoard(newBoard);
    setRevealed(Array(gridSize).fill(null).map(() => Array(gridSize).fill(false)));
    setGameOver(false);
    setWon(false);
  };

  const handleCellClick = (r, c) => {
    if(gameOver || won || revealed[r][c]) return;

    const newRevealed = revealed.map(row => [...row]);

    if(board[r][c] === 'M') {
      // Hit mine - game over
      newRevealed[r][c] = true;
      setRevealed(newRevealed);
      setGameOver(true);
      onLose();
      return;
    }

    // Flood fill for empty cells
    const flood = (row, col) => {
      if(row < 0 || row >= gridSize || col < 0 || col >= gridSize || newRevealed[row][col]) return;
      newRevealed[row][col] = true;
      if(board[row][col] === 0) {
        for(let dr = -1; dr <= 1; dr++) {
          for(let dc = -1; dc <= 1; dc++) {
            flood(row + dr, col + dc);
          }
        }
      }
    };

    flood(r, c);
    setRevealed(newRevealed);

    // Check if won
    const allSafe = newRevealed.every((row, ri) =>
      row.every((rev, ci) => rev || board[ri][ci] === 'M')
    );

    if(allSafe) {
      setWon(true);
      onWin(level);
    }
  };

  const cellSize = Math.max(30, Math.min(50, 400 / gridSize));

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#1a2535',
        borderRadius: 16,
        padding: 24,
        textAlign: 'center',
        color: '#fff',
      }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>⛏️ Minesweeper - Level {level}</h2>
        <p style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>
          {mineCount} mines • {gridSize}×{gridSize} grid
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gap: 2,
          marginBottom: 16,
          padding: 8,
          background: '#0a0f1a',
          borderRadius: 8,
        }}>
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                style={{
                  width: cellSize,
                  height: cellSize,
                  border: 'none',
                  background: revealed[r][c] ? '#333' : '#555',
                  color: '#fff',
                  cursor: revealed[r][c] ? 'default' : 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 2,
                }}
                disabled={gameOver || won}
              >
                {revealed[r][c] ? (cell === 'M' ? '💣' : cell === 0 ? '' : cell) : ''}
              </button>
            ))
          )}
        </div>

        {gameOver && <div style={{ fontSize: 16, color: '#FF6B6B', marginBottom: 12 }}>💥 Game Over!</div>}
        {won && <div style={{ fontSize: 16, color: '#4ECDC4', marginBottom: 12 }}>✅ You Won!</div>}

        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: '#4ECDC4',
            border: 'none',
            borderRadius: 8,
            color: '#111',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── MINE LEVEL INFO ──────────────────────────────────────────────────────────
export function MinesweeperInfo({ level, wins, losses, T }) {
  const nextLevelReq = MINE_LVL_REQ[level] || MINE_LVL_REQ[MINE_LVL_REQ.length - 1];
  const winsNeeded = nextLevelReq - (wins || 0);

  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: 16,
      textAlign: 'center',
      color: T.text,
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>⛏️</div>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Level {level}</div>
      <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
        {wins || 0} / {nextLevelReq} wins
      </div>
      {winsNeeded > 0 && (
        <div style={{ fontSize: 11, color: T.accent }}>
          {winsNeeded} more wins to level up
        </div>
      )}
    </div>
  );
}
