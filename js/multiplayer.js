/* WARCHESS 2 — Multiplayer Mode (Invite Link + Supabase Realtime architecture) */

const MP = {
  roomId: null,
  playerColor: 'white', // white is host, black is invitee
  connected: false,
  channel: null
};

function generateRoomId() {
  return Math.random().toString(36).slice(2, 10);
}

function createInviteLink() {
  const roomId = MP.roomId || generateRoomId();
  MP.roomId = roomId;
  const url = window.location.origin + window.location.pathname + '?room=' + roomId;
  return url;
}

function getRoomFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
}

function startMultiplayer(isHost) {
  MP.roomId = isHost ? generateRoomId() : getRoomFromUrl();
  MP.playerColor = isHost ? 'white' : 'black';
  MP.connected = true;

  // Initialize engine
  if (window.chessEngine) {
    window.chessEngine.resetGame();
    window.chessEngine.turn = 'white';
  }

  // Update status
  const status = document.getElementById('game-status');
  if (status) {
    status.textContent = isHost ? 'ОЖИДАНИЕ СОПЕРНИКА (комната: ' + MP.roomId + ')' : 'ПОДКЛЮЧЕНО К КОМНАТЕ: ' + MP.roomId;
  }

  // Copy invite link to clipboard for host
  if (isHost) {
    const url = createInviteLink();
    navigator.clipboard.writeText(url).then(() => {
      alert('Пригласительная ссылка скопирована: ' + url);
    });
  }

  // Initialize board
  if (window.initBoard && window.renderBoard) {
    window.initBoard();
    window.renderBoard();
  }

  // Setup basic synchronization through URL/hash updates (basic mechanism)
  // For full Supabase Realtime, replace the below with Supabase client
  setupBasicSync();
}

function setupBasicSync() {
  // Basic turn synchronization using URL hash for demonstration
  // In production, connect to Supabase Realtime here:
  // const { createClient } = supabase;
  // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // supabase.channel('room-' + MP.roomId)
  //   .on('broadcast', { event: 'move' }, payload => { ... })
  //   .subscribe();

  // For now: basic local turn tracking
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#turn=')) {
      const turnColor = hash.replace('#turn=', '');
      if (window.chessEngine) window.chessEngine.turn = turnColor;
      if (window.renderBoard) window.renderBoard();
    }
  });
}

function syncMove(move, from, to) {
  // Broadcast the move
  // For basic demonstration, update URL hash
  const newTurn = MP.playerColor === 'white' ? 'black' : 'white';
  window.location.hash = 'turn=' + newTurn;

  // If Supabase is configured, send through realtime channel here:
  // if (MP.channel) MP.channel.send({ type: 'broadcast', event: 'move', payload: { from, to, turn: newTurn } });

  if (window.chessEngine && window.renderBoard) {
    window.renderBoard();
  }
}

function getPlayerColor() {
  return MP.playerColor;
}

function isConnected() {
  return MP.connected;
}

function getRoomId() {
  return MP.roomId;
}

if (typeof window !== 'undefined') {
  window.multiplayer = {
    MP,
    generateRoomId,
    createInviteLink,
    getRoomFromUrl,
    startMultiplayer,
    syncMove,
    getPlayerColor,
    isConnected,
    getRoomId
  };
}
