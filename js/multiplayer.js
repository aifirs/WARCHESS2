/* WARCHESS 2 — Multiplayer Mode (Invite Link + Supabase Realtime architecture)
   Enhanced: optional Supabase Realtime integration with graceful fallback to URL/hash sync.
   - If runtime provides SUPABASE_URL and SUPABASE_ANON_KEY (window.SUPABASE_URL / window.SUPABASE_ANON_KEY), the client will dynamically load @supabase/supabase-js module and use a realtime channel 'room-<id>' to broadcast/receive moves.
   - Falls back to the previous hash-based synchronization when Supabase is not configured or an error occurs.
*/

const MP = {
  roomId: null,
  playerColor: 'white', // white is host, black is invitee
  connected: false,
  channel: null,
  supabase: null
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

async function startMultiplayer(isHost) {
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
    }).catch(() => {
      // ignore clipboard errors
    });
  }

  // Initialize board
  if (window.initBoard && window.renderBoard) {
    window.initBoard();
    window.renderBoard();
  }

  // Try to initialize Supabase realtime if credentials are available at runtime
  try {
    await tryInitSupabaseRealtime();
  } catch (err) {
    console.warn('Multiplayer: Supabase realtime init failed, falling back to hash-sync', err);
  }

  // Setup basic synchronization through URL/hash updates as a fallback
  setupBasicSync();
}

function setupBasicSync() {
  // Basic turn synchronization using URL hash for demonstration / fallback
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#turn=')) {
      const turnColor = hash.replace('#turn=', '');
      if (window.chessEngine) window.chessEngine.turn = turnColor;
      if (window.renderBoard) window.renderBoard();
    }
  });
}

async function tryInitSupabaseRealtime() {
  // Runtime-provided credentials: prefer explicit globals
  const SUPABASE_URL = window.SUPABASE_URL || (window.__WARCHESS__ && window.__WARCHESS__.SUPABASE_URL) || null;
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || (window.__WARCHESS__ && window.__WARCHESS__.SUPABASE_ANON_KEY) || null;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Not configured — nothing to do
    return;
  }

  // If already initialized for a different room, unsubscribe first
  if (MP.channel && MP.supabase) {
    try { MP.channel.unsubscribe(); } catch (e) { /* ignore */ }
    MP.channel = null;
    MP.supabase = null;
  }

  // Dynamically import supabase JS module (modern browsers)
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/module/index.mjs');
    const { createClient } = mod;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    MP.supabase = supabase;

    // Create or join channel for the room
    const chanName = 'room-' + MP.roomId;

    // Realtime v2: channel API
    try {
      const channel = supabase.channel(chanName, { config: { broadcast: { ack: false } } });

      channel.on('broadcast', { event: 'move' }, ({ payload }) => {
        try {
          if (!payload) return;
          const { from, to, turn } = payload;
          // Apply the move safely
          if (window.chessEngine && from && to) {
            // attempt to perform the move if it isn't already applied
            try { window.chessEngine.movePiece(from, to); } catch (e) { /* ignore if cannot apply */ }
            if (turn && window.chessEngine) window.chessEngine.turn = turn;
            if (window.renderBoard) window.renderBoard();
          }
        } catch (e) {
          console.warn('Multiplayer: error applying incoming move', e);
        }
      });

      const subscribed = await channel.subscribe();
      MP.channel = channel;
      console.log('Multiplayer: subscribed to Supabase channel', chanName, subscribed);
      return;
    } catch (errChan) {
      console.warn('Multiplayer: channel subscribe failed, trying legacy broadcast API', errChan);
      // fallthrough to legacy attempt
    }

    // Legacy / alternative: attempt to use simple broadcast send if available
    try {
      const channel = supabase.channel(chanName);
      MP.channel = channel;
      // Not all builds expose send; keep as best-effort
      return;
    } catch (e) {
      console.warn('Multiplayer: fallback supabase channel init failed', e);
    }
  } catch (err) {
    console.warn('Multiplayer: dynamic import of supabase-js failed', err);
    // If dynamic import fails, do not throw — fallback remains
  }
}

function syncMove(from, to) {
  // Broadcast the move
  const newTurn = MP.playerColor === 'white' ? 'black' : 'white';

  // Try to send via Supabase channel if configured
  try {
    if (MP.channel && typeof MP.channel.send === 'function') {
      // legacy broadcast-like API
      MP.channel.send({ type: 'broadcast', event: 'move', payload: { from, to, turn: newTurn } });
      return;
    }
    // Realtime v2: use supabase.send or channel.send via module — attempt generic API
    if (MP.supabase && MP.channel && typeof MP.channel.broadcast === 'function') {
      MP.channel.broadcast({ type: 'broadcast', event: 'move', payload: { from, to, turn: newTurn } });
      return;
    }
    if (MP.supabase && typeof MP.supabase.send === 'function') {
      MP.supabase.send({ type: 'broadcast', event: 'move', payload: { from, to, turn: newTurn } });
      return;
    }
  } catch (err) {
    console.warn('Multiplayer: sending via Supabase failed, falling back to hash', err);
  }

  // Fallback: use URL hash to signal turn change (original simple mechanism)
  try {
    window.location.hash = 'turn=' + newTurn;
  } catch (e) {
    // ignore
  }

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
