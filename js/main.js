/* WARCHESS 2 — Main Interface Logic */

function openMenu() {
  document.getElementById('side-menu').hidden = false;
  document.getElementById('side-menu').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  document.getElementById('side-menu').hidden = true;
  document.getElementById('side-menu').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function backToMenu() {
  document.getElementById('game-area').hidden = true;
  document.getElementById('main-menu').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startMode(mode) {
  document.getElementById('main-menu').hidden = true;
  document.getElementById('game-area').hidden = false;
  if (mode === 'training') {
    document.getElementById('game-area').classList.add('training-active');
    document.getElementById('game-status').textContent = 'ОБУЧЕНИЕ';
    if (window.trainingMode) window.trainingMode.startTraining();
    else { window.chessEngine.resetGame(); initBoard(); renderBoard(); }
  } else {
    document.getElementById('game-status').textContent = mode === 'ai' ? 'AI MODE' : 'ОДИН НА ОДИН';
    window.chessEngine.resetGame();
    initBoard();
    renderBoard();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function newGame() {
  document.getElementById('game-status').textContent = 'НОВАЯ ПАРТИЯ';
  window.chessEngine.resetGame();
  initBoard();
  renderBoard();
}

function inviteLink() {
  const url = window.location.href.split('?')[0] + '?invite=' + Math.random().toString(36).slice(2, 10);
  navigator.clipboard.writeText(url).then(() => alert('Пригласительная ссылка скопирована: ' + url));
}

function initBoard() {
  const board = document.getElementById('chessboard');
  board.innerHTML = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement('button');
      cell.className = 'cell ' + ((r + c) % 2 === 0 ? 'dark' : 'light');
      cell.setAttribute('aria-label', 'Cell ' + (8 - r) + '-' + String.fromCharCode(97 + c));
      cell.setAttribute('data-row', r);
      cell.setAttribute('data-col', c);
      cell.onclick = () => cellClick(r, c);
      board.appendChild(cell);
    }
  }
}

function renderBoard() {
  const engine = window.chessEngine;
  const boardState = engine.getBoardState();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.querySelector('.cell[data-row="' + r + '"][data-col="' + c + '"]');
      if (!cell) continue;
      // Clear previous piece text
      cell.innerHTML = '';
      const piece = boardState[r][c];
      if (piece) {
        const span = document.createElement('span');
        span.textContent = engine.PIECES[piece.color][piece.type];
        span.style.fontSize = 'clamp(1.2rem, 5vw, 2.2rem)';
        span.style.display = 'block';
        cell.appendChild(span);
      }
      // Highlight selected and valid moves
      cell.classList.remove('selected', 'valid-move');
      if (engine.selected && engine.selected.r === r && engine.selected.c === c) {
        cell.classList.add('selected');
      }
      const isValid = engine.validMoves.some(m => m.r === r && m.c === c);
      if (isValid) {
        cell.classList.add('valid-move');
        // Add a small indicator dot for valid moves
        if (!cell.querySelector('.move-dot')) {
          const dot = document.createElement('span');
          dot.className = 'move-dot';
          dot.style.position = 'absolute';
          dot.style.bottom = '8%';
          dot.style.left = '50%';
          dot.style.transform = 'translateX(-50%)';
          dot.style.width = '12px';
          dot.style.height = '12px';
          dot.style.background = 'var(--gold)';
          dot.style.borderRadius = '50%';
          dot.style.opacity = '0.8';
          cell.appendChild(dot);
        }
      } else {
        const existingDot = cell.querySelector('.move-dot');
        if (existingDot) existingDot.remove();
      }
    }
  }
  // Update status
  const status = document.getElementById('game-status');
  if (status) {
    status.textContent = 'Ход: ' + (engine.getTurn() === 'white' ? 'РИМ (ЦЕЗАРЬ)' : 'МАКЕДОНИЯ (АЛЕКСАНДР)');
  }
}

function cellClick(r, c) {
  // Training mode override
  if (window.trainingMode && document.getElementById('game-status').textContent.includes('ОБУЧЕНИЕ')) {
    const from = window.chessEngine.selected ? window.chessEngine.selected : null;
    if (!from) {
      // First click: select piece if it's the player's turn
      window.chessEngine.selectCell(r, c);
      renderBoard();
      return;
    }
    const ok = window.trainingMode.checkTrainingMove(from, { r, c });
    if (!ok) {
      // Try selecting another piece
      window.chessEngine.selected = null;
      window.chessEngine.validMoves = [];
      window.chessEngine.selectCell(r, c);
      renderBoard();
    }
    return;
  }

  const engine = window.chessEngine;
  engine.selectCell(r, c);
  renderBoard();
  // Basic AI turn after white (player) moves
  if (engine.getTurn() === 'black' && document.getElementById('game-area').hidden === false) {
    setTimeout(() => makeAIMove(), 400);
  }
}

function makeAIMove() {
  const engine = window.chessEngine;
  if (engine.getTurn() !== 'black' || document.getElementById('game-area').hidden === true) return;

  // Use enhanced AI engine
  if (window.aiEngine) {
    const bestMove = window.aiEngine.findBestMove(engine.getBoardState(), 'black');
    if (bestMove) {
      // Execute the move through the engine
      engine.selectCell(bestMove.from.r, bestMove.from.c);
      engine.selectCell(bestMove.to.r, bestMove.to.c);
      renderBoard();
      return;
    }
  }

  // Fallback to basic AI
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = engine.getBoardState()[r][c];
      if (p && p.color === 'black') {
        const moves = engine.generateMoves(r, c);
        if (moves.length > 0) {
          const move = moves[0];
          engine.movePiece({ r, c }, move);
          renderBoard();
          return;
        }
      }
    }
  }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  initBoard();
  document.getElementById('side-menu').hidden = true;
  document.getElementById('side-menu').setAttribute('aria-hidden', 'true');
  // Initialize engine
  if (window.chessEngine) {
    window.chessEngine.resetGame();
  }
});
