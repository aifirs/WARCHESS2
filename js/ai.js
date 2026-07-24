/* WARCHESS 2 — Enhanced AI Mode (Min-Max with depth) */

const AI_DEPTHS = { easy: 1, medium: 2, hard: 3 };
let aiDifficulty = 'medium';

function getMaterialValue(type) {
  const values = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };
  return values[type] || 0;
}

function evaluateBoard(boardState) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = boardState[r][c];
      if (p) {
        const val = getMaterialValue(p.type);
        score += p.color === 'black' ? val : -val; // Positive for black (AI)
      }
    }
  }
  return score;
}

function cloneBoard(boardState) {
  return boardState.map(row => row.map(cell => cell ? { ...cell } : null));
}

function getAllMoves(boardState, color) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = boardState[r][c];
      if (p && p.color === color) {
        // Use engine's generateMoves logic simplified here
        // For simplicity, we'll rely on the engine's move generation if available
        // But for AI evaluation, we'll implement a basic move generator
        const basicMoves = generateBasicMoves(boardState, r, c);
        for (const to of basicMoves) {
          moves.push({ from: { r, c }, to: { ...to }, piece: { ...p } });
        }
      }
    }
  }
  return moves;
}

function generateBasicMoves(boardState, r, c) {
  // Simplified basic move generator for AI evaluation
  const p = boardState[r][c];
  if (!p) return [];
  const moves = [];
  const inBounds = (rr, cc) => rr >= 0 && rr < 8 && cc >= 0 && cc < 8;
  const add = (rr, cc) => {
    if (!inBounds(rr, cc)) return;
    const target = boardState[rr][cc];
    if (!target) moves.push({ r: rr, c: cc });
    else if (target.color !== p.color) moves.push({ r: rr, c: cc });
  };

  if (p.type === 'pawn') {
    const dir = p.color === 'white' ? -1 : 1;
    const startRow = p.color === 'white' ? 6 : 1;
    if (inBounds(r + dir, c) && !boardState[r + dir][c]) {
      moves.push({ r: r + dir, c });
      if (r === startRow && !boardState[r + 2 * dir][c]) moves.push({ r: r + 2 * dir, c });
    }
    for (const dc of [-1, 1]) {
      if (inBounds(r + dir, c + dc)) {
        const target = boardState[r + dir][c + dc];
        if (target && target.color !== p.color) moves.push({ r: r + dir, c: c + dc });
      }
    }
  } else if (p.type === 'rook' || p.type === 'queen') {
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      for (let i = 1; ; i++) {
        const rr = r + dr * i, cc = c + dc * i;
        if (!inBounds(rr, cc)) break;
        const target = boardState[rr][cc];
        if (!target) moves.push({ r: rr, c: cc });
        else { if (target.color !== p.color) moves.push({ r: rr, c: cc }); break; }
      }
    }
  } else if (p.type === 'bishop' || p.type === 'queen') {
    for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
      for (let i = 1; ; i++) {
        const rr = r + dr * i, cc = c + dc * i;
        if (!inBounds(rr, cc)) break;
        const target = boardState[rr][cc];
        if (!target) moves.push({ r: rr, c: cc });
        else { if (target.color !== p.color) moves.push({ r: rr, c: cc }); break; }
      }
    }
  } else if (p.type === 'knight') {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])
      moves.push({ r: r + dr, c: c + dc });
  } else if (p.type === 'king') {
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]])
      moves.push({ r: r + dr, c: c + dc });
  }
  return moves.filter(m => inBounds(m.r, m.c));
}

function applyMoveToState(boardState, move) {
  const newState = cloneBoard(boardState);
  newState[move.to.r][move.to.c] = newState[move.from.r][move.from.c];
  newState[move.from.r][move.from.c] = null;
  return newState;
}

function minMax(boardState, depth, maximizing) {
  if (depth === 0) return evaluateBoard(boardState);
  const currentColor = maximizing ? 'black' : 'white';
  const moves = getAllMoves(boardState, currentColor);
  if (moves.length === 0) {
    // Checkmate or stalemate simplified
    return maximizing ? -100 : 100;
  }
  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = applyMoveToState(boardState, move);
      const evalScore = minMax(newState, depth - 1, false);
      maxEval = Math.max(maxEval, evalScore);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = applyMoveToState(boardState, move);
      const evalScore = minMax(newState, depth - 1, true);
      minEval = Math.min(minEval, evalScore);
    }
    return minEval;
  }
}

function findBestMove(boardState, color) {
  const depth = AI_DEPTHS[aiDifficulty] || AI_DEPTHS.medium;
  const moves = getAllMoves(boardState, color);
  if (moves.length === 0) return null;
  let bestMove = moves[0];
  let bestScore = -Infinity;
  for (const move of moves) {
    const newState = applyMoveToState(boardState, move);
    const score = minMax(newState, depth - 1, false); // After AI move, it's opponent's turn (minimizing for AI)
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

function setDifficulty(level) {
  if (AI_DEPTHS[level] !== undefined) aiDifficulty = level;
}

function getDifficulty() { return aiDifficulty; }

if (typeof window !== 'undefined') {
  window.aiEngine = {
    findBestMove, setDifficulty, getDifficulty,
    AI_DEPTHS, aiDifficulty,
    evaluateBoard, getAllMoves, applyMoveToState
  };
}
