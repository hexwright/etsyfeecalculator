/* ════════════════════════════════════════════════════════════
   KeyFlow — Typing Tutor  |  script.js
   ════════════════════════════════════════════════════════════ */

// ── Text Bank ───────────────────────────────────────────────
const TEXT_BANK = {
  easy: [
    "The sun is warm and the sky is blue. Birds sing in the trees each morning.",
    "She likes to read books and drink tea. The cat sits on the soft couch by the window.",
    "He walks to the park every day. The grass is green and the flowers are red.",
    "They eat lunch at noon. The food is good and the juice is cold and sweet.",
    "My dog loves to play in the yard. He runs fast and jumps over the small fence.",
    "We go to school by bus each day. The ride is short and the seats are warm.",
    "The rain falls on the roof at night. I sleep well when I hear the soft drops.",
    "She bakes a cake for the party. It smells sweet and looks very nice on the plate.",
    "He reads the news in the morning. He drinks black coffee and eats toast with jam.",
    "The moon shines bright on a clear night. Stars fill the dark sky above the hills.",
    "Open the door and step outside. The fresh air is cool and the breeze feels nice.",
    "Put the book on the shelf when done. Keep your room neat and your desk clear.",
  ],
  medium: [
    "The quick brown fox jumps over the lazy dog near the riverbank at dusk.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "In the middle of every difficulty lies opportunity waiting to be discovered and seized.",
    "The only way to do great work is to love what you do and never stop learning.",
    "Technology is best when it brings people together across vast distances and cultures.",
    "A reader lives a thousand lives before he dies; a man who never reads lives only one.",
    "The universe is under no obligation to make sense to you, yet here we are questioning it.",
    "Science is not only a disciple of reason but also one of romance and passion.",
    "Not all those who wander are lost; sometimes they are simply mapping uncharted territory.",
    "Two roads diverged in a wood, and I took the one less traveled by, and that has made the difference.",
    "You miss one hundred percent of the shots you never take — so take aim and fire.",
    "The measure of intelligence is the ability to change your habits and adapt quickly.",
    "Simplicity is the ultimate sophistication, stripping away the unnecessary to reveal truth.",
    "An investment in knowledge pays the best interest, compounding silently over a lifetime.",
  ],
  hard: [
    "Simultaneously juggling asynchronous JavaScript callbacks, Promise chains, and async/await syntax requires meticulous attention to execution context and error propagation.",
    "The Byzantine generals problem illustrates the fundamental challenge of achieving consensus in distributed systems where participants may behave arbitrarily or maliciously.",
    "Quantum entanglement, whereby two particles instantaneously influence each other regardless of spatial separation, fundamentally challenges classical notions of locality and causality.",
    "Cryptographic hash functions exhibit avalanche effects: a single-bit modification in the plaintext precipitates dramatically different digest outputs, ensuring collision resistance.",
    "Epigenetic modifications — DNA methylation, histone acetylation, and chromatin remodeling — regulate transcriptional activity without altering the underlying nucleotide sequence.",
    "The Dunning-Kruger effect describes a metacognitive phenomenon wherein individuals with limited competence systematically overestimate their own capabilities and knowledge.",
    "Neurophenomenology integrates first-person phenomenological accounts of consciousness with third-person neuroscientific observations, bridging the explanatory gap.",
    "Anthropological fieldwork necessitates reflexivity: researchers must continuously interrogate how their positionality, assumptions, and presence influence the communities they study.",
    "Predicate logic extends propositional logic by introducing quantifiers, variables, and predicates, enabling more expressive formal representations of complex relationships.",
    "The thermodynamic arrow of time — entropy's inexorable increase toward maximum disorder — distinguishes the past from the future in ways microscopic physics cannot explain.",
    "Recursive algorithms elegantly decompose complex problems into self-similar subproblems, though they risk stack overflow when termination conditions are insufficiently constrained.",
    "Phenomenological reduction — epoché — suspends all preconceived assumptions about external reality, directing consciousness back to pure, unmediated experiential phenomena.",
  ]
};

// ── State ───────────────────────────────────────────────────
let state = {
  text:        '',
  chars:       [],
  input:       '',
  started:     false,
  finished:    false,
  startTime:   null,
  timerMode:   60,
  timeLeft:    60,
  difficulty:  'medium',
  errors:      0,
  errorSet:    new Set(),
  totalTyped:  0,
  intervalId:  null,
  soundOn:     true,
  isFocused:   false,
};

// ── DOM ─────────────────────────────────────────────────────
const textDisplay    = document.getElementById('textDisplay');
const inputBox       = document.getElementById('inputBox');
const timerDisplay   = document.getElementById('timerDisplay');
const liveWpm        = document.getElementById('liveWpm');
const liveAcc        = document.getElementById('liveAcc');
const restartBtn     = document.getElementById('restartBtn');
const configBar      = document.getElementById('configBar');
const cursorHint     = document.getElementById('cursorHint');
const resultsOverlay = document.getElementById('resultsOverlay');
const scoresOverlay  = document.getElementById('scoresOverlay');
const newRecord      = document.getElementById('newRecord');
const scoresList     = document.getElementById('scoresList');
const themeToggle    = document.getElementById('themeToggle');
const soundToggle    = document.getElementById('soundToggle');

// ── Audio ───────────────────────────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playError() {
  if (!state.soundOn) return;
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch(e) {}
}

function playFinish() {
  if (!state.soundOn) return;
  try {
    const ctx = getAudio();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.1 + 0.2);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.2);
    });
  } catch(e) {}
}

// ── High Scores ─────────────────────────────────────────────
function getScores(mode) {
  return JSON.parse(localStorage.getItem(`kf_scores_${mode}`) || '[]');
}

function saveScore(mode, entry) {
  const scores = getScores(mode);
  scores.push(entry);
  scores.sort((a, b) => b.wpm - a.wpm);
  scores.splice(10); // keep top 10
  localStorage.setItem(`kf_scores_${mode}`, JSON.stringify(scores));
}

function getBestWpm(mode) {
  const scores = getScores(mode);
  return scores.length ? scores[0].wpm : null;
}

// ── Text Selection ──────────────────────────────────────────
function getRandomText(difficulty) {
  const pool = TEXT_BANK[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Render Text ─────────────────────────────────────────────
function renderText() {
  textDisplay.innerHTML = '';
  state.chars = state.text.split('').map((ch, i) => {
    const span = document.createElement('span');
    span.className = 'char' + (i === 0 ? ' current' : '');
    span.textContent = ch;
    span.dataset.index = i;
    textDisplay.appendChild(span);
    return span;
  });
}

// ── Update Display ──────────────────────────────────────────
function updateDisplay() {
  const typed = state.input;
  let errorCount = 0;

  state.chars.forEach((span, i) => {
    span.className = 'char';
    if (i < typed.length) {
      if (typed[i] === state.text[i]) {
        span.classList.add('correct');
      } else {
        span.classList.add('incorrect');
        errorCount++;
        state.errorSet.add(i);
      }
    } else if (i === typed.length) {
      span.classList.add('current');
    }
  });

  state.errors = state.errorSet.size;
}

// ── WPM & Accuracy ──────────────────────────────────────────
function calcWpm() {
  if (!state.startTime) return 0;
  const elapsed = (Date.now() - state.startTime) / 1000 / 60;
  if (elapsed === 0) return 0;
  const correctChars = state.input.split('').filter((ch, i) => ch === state.text[i]).length;
  return Math.round((correctChars / 5) / elapsed);
}

function calcAcc() {
  if (state.totalTyped === 0) return 100;
  const correct = state.input.split('').filter((ch, i) => ch === state.text[i]).length;
  return Math.round((correct / state.totalTyped) * 100);
}

// ── Timer ───────────────────────────────────────────────────
function startTimer() {
  if (state.intervalId) return;
  configBar.classList.add('locked');
  cursorHint.classList.add('hidden');

  state.intervalId = setInterval(() => {
    state.timeLeft--;
    timerDisplay.textContent = state.timeLeft;

    // color warning
    if (state.timeLeft <= 10) {
      timerDisplay.classList.add('warning');
      timerDisplay.classList.remove('active');
    } else {
      timerDisplay.classList.add('active');
    }

    // update progress bar
    const pct = (state.timeLeft / state.timerMode) * 100;
    const fill = document.querySelector('.progress-fill');
    if (fill) {
      fill.style.width = pct + '%';
      fill.classList.toggle('danger', state.timeLeft <= 10);
    }

    // live stats
    const wpm = calcWpm();
    const acc = calcAcc();
    liveWpm.textContent = wpm;
    liveWpm.classList.add('active');
    liveAcc.textContent = acc + '%';
    liveAcc.classList.add('active');

    if (state.timeLeft <= 0) finishTest();
  }, 1000);
}

function stopTimer() {
  clearInterval(state.intervalId);
  state.intervalId = null;
}

// ── Progress Bar ────────────────────────────────────────────
function buildProgressBar() {
  if (document.querySelector('.progress-bar')) return;
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.innerHTML = '<div class="progress-fill"></div>';
  const container = document.querySelector('.typing-container');
  container.parentNode.insertBefore(bar, container);
}

// ── Finish ──────────────────────────────────────────────────
function finishTest() {
  stopTimer();
  state.finished = true;
  inputBox.blur();
  playFinish();

  const elapsed = state.timerMode - state.timeLeft;
  const wpm = calcWpm();
  const acc = calcAcc();
  const chars = state.totalTyped;
  const errors = state.errors;

  // Save score
  const best = getBestWpm(state.timerMode);
  saveScore(state.timerMode, {
    wpm, acc, difficulty: state.difficulty,
    date: new Date().toLocaleDateString()
  });

  // Show results
  document.getElementById('resWpm').textContent    = wpm;
  document.getElementById('resAcc').textContent    = acc + '%';
  document.getElementById('resChars').textContent  = chars;
  document.getElementById('resErrors').textContent = errors;
  document.getElementById('resTime').textContent   = elapsed + 's';
  document.getElementById('resBest').textContent   = getBestWpm(state.timerMode) + ' wpm';

  if (!best || wpm > best) {
    newRecord.classList.add('show');
  } else {
    newRecord.classList.remove('show');
  }

  setTimeout(() => resultsOverlay.classList.add('visible'), 200);
}

// ── Input Handler ───────────────────────────────────────────
inputBox.addEventListener('input', (e) => {
  if (state.finished) return;

  const val = inputBox.value;

  // Start timer on first keystroke
  if (!state.started && val.length > 0) {
    state.started = true;
    state.startTime = Date.now();
    startTimer();
    buildProgressBar();
  }

  // Track total typed
  if (val.length > state.input.length) {
    state.totalTyped++;
  }

  // Error detection on new char
  if (val.length > state.input.length) {
    const i = val.length - 1;
    if (val[i] !== state.text[i]) {
      playError();
      textDisplay.classList.remove('shake');
      void textDisplay.offsetWidth; // reflow
      textDisplay.classList.add('shake');
      setTimeout(() => textDisplay.classList.remove('shake'), 300);
    }
  }

  state.input = val;
  updateDisplay();

  // Auto-complete: if user typed the full text
  if (val.length >= state.text.length) {
    finishTest();
  }
});

// ── Focus Management ────────────────────────────────────────
document.querySelector('.typing-container').addEventListener('click', () => {
  if (!state.finished) inputBox.focus();
});

inputBox.addEventListener('focus', () => {
  state.isFocused = true;
  textDisplay.classList.add('focused');
  cursorHint.classList.add('hidden');
});

inputBox.addEventListener('blur', () => {
  state.isFocused = false;
  textDisplay.classList.remove('focused');
  if (!state.started) cursorHint.classList.remove('hidden');
});

// Global key focus
document.addEventListener('keydown', (e) => {
  // Tab+Enter restart
  if (e.key === 'Enter' && e.target === document.body) {
    restart();
    return;
  }
  // Focus on any keypress (except Tab, Shift, Ctrl, etc.)
  const ignore = ['Tab','Shift','Control','Alt','Meta','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','Escape'];
  if (!ignore.includes(e.key) && !state.finished && !state.isFocused) {
    inputBox.focus();
  }
});

// ── Restart ─────────────────────────────────────────────────
function restart(newText = false) {
  stopTimer();
  resultsOverlay.classList.remove('visible');

  // Remove progress bar
  const pb = document.querySelector('.progress-bar');
  if (pb) pb.remove();

  state = {
    ...state,
    text:       newText ? getRandomText(state.difficulty) : (state.text || getRandomText(state.difficulty)),
    chars:      [],
    input:      '',
    started:    false,
    finished:   false,
    startTime:  null,
    timeLeft:   state.timerMode,
    errors:     0,
    errorSet:   new Set(),
    totalTyped: 0,
    intervalId: null,
  };

  // Reset text display
  renderText();

  // Reset input
  inputBox.value = '';

  // Reset stats
  timerDisplay.textContent = state.timerMode;
  timerDisplay.classList.remove('active', 'warning');
  liveWpm.textContent = '—';
  liveWpm.classList.remove('active');
  liveAcc.textContent = '—';
  liveAcc.classList.remove('active');

  // Unlock config
  configBar.classList.remove('locked');
  cursorHint.classList.remove('hidden');

  // Focus
  setTimeout(() => inputBox.focus(), 100);
}

restartBtn.addEventListener('click', () => restart(false));

// Results buttons
document.getElementById('tryAgainBtn').addEventListener('click', () => {
  state.text = state.text; // same text
  restart(false);
});

document.getElementById('newTextBtn').addEventListener('click', () => {
  state.text = getRandomText(state.difficulty);
  restart(false);
});

// ── Config: Difficulty ──────────────────────────────────────
document.getElementById('difficultyGroup').addEventListener('click', (e) => {
  const pill = e.target.closest('.pill');
  if (!pill || state.started) return;
  document.querySelectorAll('#difficultyGroup .pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  state.difficulty = pill.dataset.value;
  state.text = getRandomText(state.difficulty);
  restart(false);
});

// ── Config: Timer Mode ──────────────────────────────────────
document.getElementById('timerGroup').addEventListener('click', (e) => {
  const pill = e.target.closest('.pill');
  if (!pill || state.started) return;
  document.querySelectorAll('#timerGroup .pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  state.timerMode = parseInt(pill.dataset.value);
  state.timeLeft  = state.timerMode;
  restart(false);
});

// ── Theme Toggle ────────────────────────────────────────────
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? 'light' : 'dark';
  localStorage.setItem('kf_theme', html.dataset.theme);
});

// Load saved theme
const savedTheme = localStorage.getItem('kf_theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

// ── Sound Toggle ────────────────────────────────────────────
soundToggle.addEventListener('click', () => {
  state.soundOn = !state.soundOn;
  soundToggle.style.opacity = state.soundOn ? '1' : '0.4';
  localStorage.setItem('kf_sound', state.soundOn ? '1' : '0');
});

// Load saved sound pref
if (localStorage.getItem('kf_sound') === '0') {
  state.soundOn = false;
  soundToggle.style.opacity = '0.4';
}

// ── High Scores Modal ────────────────────────────────────────
let scoresTab = 60;

function renderScores(mode) {
  const scores = getScores(mode);
  if (scores.length === 0) {
    scoresList.innerHTML = '<div class="scores-empty">no scores yet for this mode</div>';
    return;
  }
  scoresList.innerHTML = scores.map((s, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const medals = ['🥇','🥈','🥉'];
    const rank = i < 3 ? medals[i] : `#${i+1}`;
    return `
      <div class="score-row">
        <span class="score-rank ${rankClass}">${rank}</span>
        <span class="score-wpm">${s.wpm}</span>
        <span class="score-acc">${s.acc}%</span>
        <span class="score-diff">${s.difficulty} · ${mode}s · ${s.date}</span>
      </div>
    `;
  }).join('');
}

document.getElementById('highScoreBtn').addEventListener('click', () => {
  renderScores(scoresTab);
  scoresOverlay.classList.add('visible');
});

document.getElementById('closeScores').addEventListener('click', () => {
  scoresOverlay.classList.remove('visible');
});

scoresOverlay.addEventListener('click', (e) => {
  if (e.target === scoresOverlay) scoresOverlay.classList.remove('visible');
});

document.querySelector('.scores-tabs').addEventListener('click', (e) => {
  const pill = e.target.closest('.pill');
  if (!pill) return;
  document.querySelectorAll('.scores-tabs .pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  scoresTab = parseInt(pill.dataset.tab);
  renderScores(scoresTab);
});

document.getElementById('clearScores').addEventListener('click', () => {
  if (confirm('Clear all high scores?')) {
    [30, 60, 120].forEach(m => localStorage.removeItem(`kf_scores_${m}`));
    renderScores(scoresTab);
  }
});

// ── Init ─────────────────────────────────────────────────────
function init() {
  state.text = getRandomText(state.difficulty);
  renderText();
  timerDisplay.textContent = state.timerMode;
  setTimeout(() => inputBox.focus(), 200);
}

init();
