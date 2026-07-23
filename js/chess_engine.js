/* WARCHESS 2 — Chess Engine (Vanilla JS) */

const PIECES = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
};

const TYPES = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];

// Board representation: 8 rows x 8 cols, row 0 = top (black side), row 7 = bottom (white side)
function initialBoard() {
  const b = Array(8).fill(null).map(() => Array(8).fill(null));
  const setupRow = (row, color) => {
    b[row][0] = { type: 'rook', color: color };
    b[row][1] = { type: 'knight', color: color };
    b[row][2] = { type: 'bishop', color: color };
    b[row][3] = { type: 'queen', color: color };
    b[row][4] = { type: 'king', color: color };
    b[row][5] = { type: 'bishop', color: color };
    b[row][6] = { type: 'knight', color: color };
    b[row][7] = { type: 'rook', color: color };
  };
  setupRow(0, 'black');
  setupRow(7, 'white');
  for (let c = 0; c < 8; c++) {
    b[1][c] = { type: 'pawn', color: 'black' };
    b[6][c] = { type: 'pawn', color: 'white' };
  }
  return b;
}

let board = initialBoard();
let turn = 'white';  // white starts
let selected = null; // {r, c}
let validMoves = [];

function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

function getPiece(r, c) { return inBounds(r, c) ? board[r][c] : null; }

function movePiece(from, to) {
  const piece = getPiece(from.r, from.c);
  if (!piece) return false;
  if (piece.color !== turn) return false;
  const valid = validMoves.some(m => m.r === to.r && m.c === to.c);
  if (!valid) return false;
  board[to.r][to.c] = piece;
  board[from.r][from.c] = null;
  turn = turn === 'white' ? 'black' : 'white';
  selected = null;
  validMoves = [];
  return true;
}

function generateMoves(r, c) {
  const p = getPiece(r, c);
  if (!p || p.color !== turn) return [];
  const moves = [];
  const add = (rr, cc) => {
    if (!inBounds(rr, cc)) return;
    const target = getPiece(rr, cc);
    if (!target) moves.push({ r: rr, c: cc });
    else if (target.color !== p.color) moves.push({ r: rr, c: cc });
  };

  if (p.type === 'pawn') {
    const dir = p.color === 'white' ? -1 : 1; // white moves up (row decreases), black moves down
    const startRow = p.color === 'white' ? 6 : 1;
    // Forward
    if (inBounds(r + dir, c) && !getPiece(r + dir, c)) {
      add(r + dir, c);
      if (r === startRow && !getPiece(r + 2 * dir, c)) add(r + 2 * dir, c);
    }
    // Captures
    for (const dc of [-1, 1]) {
      if (inBounds(r + dir, c + dc)) {
        const target = getPiece(r + dir, c + dc);
        if (target && target.color !== p.color) add(r + dir, c + dc);
      }
    }
  }

  if (p.type === 'rook' || p.type === 'queen') {
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      for (let i = 1; ; i++) {
        const rr = r + dr * i, cc = c + dc * i;
        if (!inBounds(rr, cc)) break;
        const target = getPiece(rr, cc);
        if (!target) moves.push({ r: rr, c: cc });
        else { if (target.color !== p.color) moves.push({ r: rr, c: cc }); break; }
      }
    }
  }

  if (p.type === 'bishop' || p.type === 'queen') {
    for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
      for (let i = 1; ; i++) {
        const rr = r + dr * i, cc = c + dc * i;
        if (!inBounds(rr, cc)) break;
        const target = getPiece(rr, cc);
        if (!target) moves.push({ r: rr, c: cc });
        else { if (target.color !== p.color) moves.push({ r: rr, c: cc }); break; }
      }
    }
  }

  if (p.type === 'knight') {
    const jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (const [dr, dc] of jumps) add(r + dr, c + dc);
  }

  if (p.type === 'king') {
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      add(r + dr, c + dc);
    }
  }

  return moves;
}

function isCheckmate() {
  // Simplified: if current player has no valid moves at all → checkmate (not fully accurate but sufficient for basic AI)
  const color = turn;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = getPiece(r, c);
      if (p && p.color === color) {
        const moves = generateMoves(r, c);
        if (moves.length > 0) return false;
      }
    }
  }
  return true; // No moves = checkmate/stalemate for this basic engine
}

function resetGame() {
  board = initialBoard();
  turn = 'white';
  selected = null;
  validMoves = [];
}

function getBoardState() {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

function getTurn() { return turn; }

function selectCell(r, c) {
  const p = getPiece(r, c);
  if (!p || p.color !== turn) {
    // Try to move selected piece
    if (selected) {
      const moved = movePiece(selected, { r, c });
      if (!moved) {
        selected = null;
        validMoves = [];
      }
      return moved;
    }
    selected = null;
    validMoves = [];
    return false;
  }
  selected = { r, c };
  validMoves = generateMoves(r, c);
  return true;
}

// Export for browser
if (typeof window !== 'undefined') {
  window.chessEngine = {
    board, turn, selected, validMoves,
    initialBoard, getBoardState, getTurn,
    selectCell, movePiece, resetGame,
    generateMoves, isCheckmate,
    PIECES, TYPES
  };
}
