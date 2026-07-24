/* WARCHESS 2 — Training Mode */

const TRAINING_STEPS = [
  {
    id: 'pawn_forward',
    title: { ru: 'Пешка вперёд', en: 'Pawn forward' },
    desc: { ru: 'Пешка ходит вперёд на одну клетку. Нажми на пешку, затем на клетку перед ней.', en: 'Pawn moves forward one square. Click the pawn, then the square ahead.' },
    setup: () => {
      // Only one white pawn at a6 and empty board around it
      const engine = window.chessEngine;
      engine.resetGame();
      // Clear board and place only pawn
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
          engine.board[r][c] = null;
      engine.board[6][3] = { type: 'pawn', color: 'white' };
      engine.turn = 'white';
    },
    checkMove: (from, to) => {
      return from.r === 6 && from.c === 3 && to.r === 5 && to.c === 3;
    },
    completeMsg: { ru: 'Отлично! Пешка идёт вперёд.', en: 'Great! Pawn moves forward.' }
  },
  {
    id: 'pawn_capture',
    title: { ru: 'Пешка и взятие', en: 'Pawn capture' },
    desc: { ru: 'Пешка может брать фигуру по диагонали. Нажми на пешку и возьми чёрную фигуру.', en: 'Pawn can capture diagonally. Click the pawn and take the black piece.' },
    setup: () => {
      const engine = window.chessEngine;
      engine.resetGame();
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
          engine.board[r][c] = null;
      engine.board[6][3] = { type: 'pawn', color: 'white' };
      engine.board[5][2] = { type: 'pawn', color: 'black' };
      engine.turn = 'white';
    },
    checkMove: (from, to) => {
      return from.r === 6 && from.c === 3 && to.r === 5 && to.c === 2;
    },
    completeMsg: { ru: 'Верно! Пешка взяла фигуру по диагонали.', en: 'Correct! Pawn captured diagonally.' }
  },
  {
    id: 'rook_line',
    title: { ru: 'Ладья — прямая линия', en: 'Rook — straight line' },
    desc: { ru: 'Ладья ходит по прямой линии. Попробуй переместить ладью вдоль доски.', en: 'Rook moves in straight lines. Try moving the rook across the board.' },
    setup: () => {
      const engine = window.chessEngine;
      engine.resetGame();
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
          engine.board[r][c] = null;
      engine.board[7][0] = { type: 'rook', color: 'white' };
      engine.turn = 'white';
    },
    checkMove: (from, to) => {
      const p = window.chessEngine.getBoardState()[from.r][from.c];
      return p && p.type === 'rook' && p.color === 'white' && (from.r === to.r || from.c === to.c);
    },
    completeMsg: { ru: 'Отлично! Ладья идёт по прямой.', en: 'Great! Rook moves in straight lines.' }
  },
  {
    id: 'king_safe',
    title: { ru: 'Король — осторожно', en: 'King — be careful' },
    desc: { ru: 'Король ходит на одну клетку в любом направлении. Не ставь его под удар!', en: 'King moves one square in any direction. Don\'t put it in danger!' },
    setup: () => {
      const engine = window.chessEngine;
      engine.resetGame();
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
          engine.board[r][c] = null;
      engine.board[7][4] = { type: 'king', color: 'white' };
      engine.turn = 'white';
    },
    checkMove: (from, to) => {
      const p = window.chessEngine.getBoardState()[from.r][from.c];
      return p && p.type === 'king' && p.color === 'white' && Math.abs(from.r - to.r) <= 1 && Math.abs(from.c - to.c) <= 1;
    },
    completeMsg: { ru: 'Король в безопасности. Отличная работа!', en: 'King is safe. Excellent work!' }
  }
];

let currentStep = 0;

function startTraining() {
  currentStep = 0;
  loadStep(currentStep);
}

function loadStep(index) {
  if (index >= TRAINING_STEPS.length) {
    document.getElementById('game-status').textContent = 'ОБУЧЕНИЕ ЗАВЕРШЕНО!';
    return;
  }
  const step = TRAINING_STEPS[index];
  step.setup();
  window.chessEngine.resetGame();
  step.setup(); // re-apply after reset to ensure board state
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
  document.getElementById('game-status').textContent = step.title[lang] + ' — ' + step.desc[lang];
  window.chessEngine.selected = null;
  window.chessEngine.validMoves = [];
  renderBoard();
}

function checkTrainingMove(from, to) {
  if (!currentStep || currentStep < 0 || currentStep >= TRAINING_STEPS.length) return false;
  const step = TRAINING_STEPS[currentStep];
  const ok = step.checkMove(from, to);
  if (ok) {
    // Show success briefly
    document.getElementById('game-status').textContent = step.completeMsg[document.documentElement.lang === 'en' ? 'en' : 'ru'];
    currentStep++;
    setTimeout(() => loadStep(currentStep), 1200);
  } else {
    document.getElementById('game-status').textContent = 'Попробуй ещё раз. ' + step.desc[document.documentElement.lang === 'en' ? 'en' : 'ru'];
  }
  return ok;
}

// Export
if (typeof window !== 'undefined') {
  window.trainingMode = {
    startTraining, loadStep, checkTrainingMove,
    getStep: () => currentStep,
    getSteps: () => TRAINING_STEPS
  };
}
