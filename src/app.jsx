import { useState, useEffect, useRef } from 'preact/hooks';
import { generatePuzzle, isComplete } from './utils/generator.js';
import { Board } from './components/Board.jsx';
import { Controls } from './components/Controls.jsx';
import './index.css';

export function App() {
  const [difficulty, setDifficulty] = useState('medium');
  const [game, setGame] = useState(() => generatePuzzle('medium'));
  const [grid, setGrid] = useState(() => game.puzzle.map(r => [...r]));
  const [hintPos, setHintPos] = useState(0);
  const [history, setHistory] = useState([]);
  const [moveCount, setMoveCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const newGame = (d) => {
    const g = generatePuzzle(d);
    setGame(g);
    setGrid(g.puzzle.map(r => [...r]));
    setHintPos(0);
    setHistory([]);
    setMoveCount(0);
    setElapsed(0);
    setCompleted(false);
    startTimer();
  };

  // Start timer on first render
  useEffect(() => { startTimer(); return () => stopTimer(); }, []);

  const handleCellChange = (r, c, val) => {
    setHistory(h => [...h, grid.map(row => [...row])]);
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = val;
      return next;
    });
    setMoveCount(n => n + 1);
  };

  const handleHint = () => {
    const { solved } = game;
    let found = 0;
    for (let i = 0; i < 81; i++) {
      const idx = (hintPos + i) % 81;
      const r = Math.floor(idx / 9);
      const c = idx % 9;
      if (grid[r][c] === 0) {
        setHintPos((idx + 1) % 81);
        setGrid(prev => {
          const next = prev.map(row => [...row]);
          next[r][c] = solved[r][c];
          return next;
        });
        setMoveCount(n => n + 1);
        return;
      }
    }
  };

  const handleClear = () => {
    setGrid(game.puzzle.map(r => [...r]));
    setHintPos(0);
    setHistory([]);
    setMoveCount(0);
    setElapsed(0);
    setCompleted(false);
    startTimer();
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setGrid(last.map(row => [...row]));
  };

  const handleCheck = () => {
    if (isComplete(grid)) {
      stopTimer();
      setCompleted(true);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div class="sudoku-app">
      <h1>Sudoku</h1>
      <div class="stats-bar">
        <span class="stat">Moves: {moveCount}</span>
        <span class="stat">Time: {formatTime(elapsed)}</span>
      </div>
      <Controls
        difficulty={difficulty}
        onDifficultyChange={(d) => { setDifficulty(d); newGame(d); }}
        onNewGame={() => newGame(difficulty)}
        onClear={handleClear}
        onCheck={handleCheck}
        onHint={handleHint}
        onUndo={handleUndo}
        canUndo={history.length > 0}
      />
      <Board
        puzzle={game.puzzle}
        grid={grid}
        onCellChange={handleCellChange}
      />
      {completed && (
        <div class="modal-overlay">
          <div class="modal">
            <div class="modal-icon">🎉</div>
            <h2>Tebrikler!</h2>
            <p>Puzzle {difficulty} seviyesinde {formatTime(elapsed)} sürede {moveCount} hamlede tamamlandı.</p>
            <button onClick={() => newGame(difficulty)}>Yeni Oyun</button>
          </div>
        </div>
      )}
    </div>
  );
}
