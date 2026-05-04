import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import { findConflicts } from '../utils/generator.js';

export function Board({ puzzle, grid, onCellChange }) {
  const [pencilMode, setPencilMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [pencils, setPencils] = useState(
    () => Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()))
  );
  const boardRef = useRef(null);

  const conflictsNow = findConflicts(grid);

  // When pencil mode changes, clear pencils
  useEffect(() => {
    if (!pencilMode) {
      setPencils(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set())));
    }
  }, [pencilMode]);

  const highlight = useCallback((r, c) => {
    if (!selected) return '';
    const [sr, sc] = selected;
    if (r === sr && c === sc) return 'selected';
    if (r === sr || c === sc) return 'highlight';
    const br = (Math.floor(sr / 3)) * 3;
    const bc = (Math.floor(sc / 3)) * 3;
    if (r >= br && r < br + 3 && c >= bc && c < bc + 3) return 'highlight';
    return '';
  }, [selected]);

  const isGiven = (r, c) => puzzle[r][c] !== 0;

  const handleInput = useCallback((r, c, val) => {
    if (isGiven(r, c)) return;
    if (pencilMode) {
      setPencils(prev => {
        const next = prev.map(row => row.map(s => new Set(s)));
        if (next[r][c].has(val)) next[r][c].delete(val);
        else next[r][c].add(val);
        return next;
      });
    } else {
      onCellChange(r, c, val);
    }
  }, [pencilMode, onCellChange]);

  const handleKeyDown = useCallback((e) => {
    if (!selected) return;
    const [r, c] = selected;
    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      handleInput(r, c, parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      handleInput(r, c, 0);
      setPencils(prev => {
        const next = prev.map(row => row.map(s => new Set(s)));
        next[r][c].clear();
        return next;
      });
    } else if (e.key === 'ArrowUp' && r > 0) { e.preventDefault(); setSelected([r - 1, c]); }
    else if (e.key === 'ArrowDown' && r < 8) { e.preventDefault(); setSelected([r + 1, c]); }
    else if (e.key === 'ArrowLeft' && c > 0) { e.preventDefault(); setSelected([r, c - 1]); }
    else if (e.key === 'ArrowRight' && c < 8) { e.preventDefault(); setSelected([r, c + 1]); }
  }, [selected, handleInput]);

  const cells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      const hasConflict = conflictsNow.has(`${r},${c}`);
      const hl = highlight(r, c);
      const given = isGiven(r, c);
      const pmarks = pencils[r][c];

      cells.push(
        <div
          key={`${r},${c}`}
          class={`cell ${hl} ${given ? 'given' : ''} ${hasConflict ? 'conflict' : ''}`}
          onClick={() => { setSelected([r, c]); boardRef.current?.focus(); }}
          onDblClick={() => { handleInput(r, c, 0); }}
        >
          {val ? (
            <span class="num">{val}</span>
          ) : (
            <div class="pencil-grid">
              {[1,2,3,4,5,6,7,8,9].map(n =>
                <span key={n} class={pmarks.has(n) ? 'pen' : 'pen empty'}>{n}</span>
              )}
            </div>
          )}
        </div>
      );
    }
  }

  return (
    <div class="board-wrap" ref={boardRef} onKeyDown={handleKeyDown} tabIndex={0}>
      <div class="board">{cells}</div>
      <div class="mode-toggle">
        <button onClick={() => setPencilMode(m => !m)} class={pencilMode ? 'active' : ''}>
          {pencilMode ? 'Pencil ON' : 'Pencil OFF'}
        </button>
        <span class="hint">1-9 to input · Del to clear · Arrow keys to move</span>
      </div>
    </div>
  );
}
