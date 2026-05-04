export function Controls({ difficulty, onDifficultyChange, onNewGame, onClear, onCheck, onHint, onUndo, canUndo }) {
  return (
    <div class="controls">
      <div class="difficulty-select">
        {['easy', 'medium', 'hard'].map(d => (
          <button
            key={d}
            class={difficulty === d ? 'active' : ''}
            onClick={() => onDifficultyChange(d)}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>
      <div class="action-buttons">
        <button onClick={onNewGame}>New Game</button>
        <button onClick={onUndo} disabled={!canUndo} class="undo-btn">Undo</button>
        <button onClick={onClear}>Clear</button>
        <button onClick={onCheck} class="check-btn">Check</button>
        <button onClick={onHint} class="hint-btn">Hint</button>
      </div>
    </div>
  );
}
