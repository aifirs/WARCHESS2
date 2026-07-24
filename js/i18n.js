/* WARCHESS 2 — Full Translations: Russian / English */
const i18n = {
  ru: {
    subtitle: "ВОЙНА ЭПОХ",
    heroTitle: "АЛЕКСАНДР <span class=\"hero-vs\">VS</span> ЦЕЗАРЬ",
    heroDesc: "Эпическая битва империй. Рим. Македония. Греция.",
    modeTraining: "ОБУЧЕНИЕ",
    modeTrainingDesc: "Изучи правила и тактику",
    modeAI: "AI MODE",
    modeAIDesc: "Против машины",
    mode1v1: "ОДИН НА ОДИН",
    mode1v1Desc: "Пригласительная ссылка",
    btnMenu: "МЕНЮ",
    btnNew: "НОВАЯ ПАРТИЯ",
    btnInvite: "ПРИГЛАСИТЬ",
    btnLang: "СМЕНИТЬ ЯЗЫК",
    btnTrain: "ОБУЧЕНИЕ",
    btnAI: "AI MODE",
    btn1v1: "ОДИН НА ОДИН",
    btnClose: "ЗАКРЫТЬ",
    menuTitle: "НАСТРОЙКИ",
    playerRome: "РИМ (ЦЕЗАРЬ)",
    playerMacedonia: "МАКЕДОНИЯ (АЛЕКСАНДР)",
    statusReady: "Готов к битве",
    statusNewGame: "НОВАЯ ПАРТИЯ",
    statusTraining: "ОБУЧЕНИЕ",
    statusAIMode: "AI MODE",
    statusOneVsOne: "ОДИН НА ОДИН",
    statusTurnWhite: "Ход: РИМ (ЦЕЗАРЬ)",
    statusTurnBlack: "Ход: МАКЕДОНИЯ (АЛЕКСАНДР)",
    statusInviteCopied: "Пригласительная ссылка скопирована",
    aiEasy: "ЛЁГКО",
    aiMedium: "СРЕДНЕ",
    aiHard: "СЛОЖНО",
    aiDifficulty: "AI СЛОЖНОСТЬ:"
  },
  en: {
    subtitle: "WAR OF EPOCH",
    heroTitle: "ALEXANDER <span class=\"hero-vs\">VS</span> CAESAR",
    heroDesc: "Epic battle of empires. Rome. Macedonia. Greece.",
    modeTraining: "TRAINING",
    modeTrainingDesc: "Learn rules and tactics",
    modeAI: "AI MODE",
    modeAIDesc: "Against the machine",
    mode1v1: "ONE VS ONE",
    mode1v1Desc: "Invite link",
    btnMenu: "MENU",
    btnNew: "NEW GAME",
    btnInvite: "INVITE",
    btnLang: "CHANGE LANG",
    btnTrain: "TRAINING",
    btnAI: "AI MODE",
    btn1v1: "ONE VS ONE",
    btnClose: "CLOSE",
    menuTitle: "SETTINGS",
    playerRome: "ROME (CAESAR)",
    playerMacedonia: "MACEDONIA (ALEXANDER)",
    statusReady: "Ready for battle",
    statusNewGame: "NEW GAME",
    statusTraining: "TRAINING",
    statusAIMode: "AI MODE",
    statusOneVsOne: "ONE VS ONE",
    statusTurnWhite: "Turn: ROME (CAESAR)",
    statusTurnBlack: "Turn: MACEDONIA (ALEXANDER)",
    statusInviteCopied: "Invite link copied",
    aiEasy: "EASY",
    aiMedium: "MEDIUM",
    aiHard: "HARD",
    aiDifficulty: "AI DIFFICULTY:"
  }
};

let currentLang = 'ru';

function toggleLang() {
  currentLang = currentLang === 'ru' ? 'en' : 'ru';
  document.documentElement.lang = currentLang;

  // Update elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[currentLang][key]) {
      el.innerHTML = i18n[currentLang][key];
    }
  });

  // Update player names
  const romeCard = document.querySelector('.player-card.player-rome h4');
  if (romeCard) romeCard.textContent = i18n[currentLang].playerRome;
  const macedoniaCard = document.querySelector('.player-card.player-macedonia h4');
  if (macedoniaCard) macedoniaCard.textContent = i18n[currentLang].playerMacedonia;

  // Update game status text for turn
  const status = document.getElementById('game-status');
  if (status && status.textContent) {
    const engine = window.chessEngine;
    if (engine) {
      const turnText = engine.getTurn() === 'white' ? i18n[currentLang].statusTurnWhite : i18n[currentLang].statusTurnBlack;
      // Only update if it looks like a turn message
      if (status.textContent.includes('Ход:') || status.textContent.includes('Turn:')) {
        status.textContent = turnText;
      }
    }
  }

  // Update AI difficulty labels if present
  document.querySelectorAll('.side-menu-inner button').forEach(btn => {
    if (btn.textContent && btn.textContent.includes('ЛЁГКО') || btn.textContent.includes('EASY')) {
      // Already handled by data-i18n or manual replacements
    }
  });
}

function getText(key) {
  return i18n[currentLang][key] || i18n['ru'][key] || key;
}

// Initialize language on load
window.addEventListener('DOMContentLoaded', () => {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang === 'en' || urlLang === 'ru') {
    currentLang = urlLang;
    document.documentElement.lang = currentLang;
  }
  toggleLang();
});
