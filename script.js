/**
 * Mestre da Partitura - Motor do Jogo
 * Desenvolvido por Antigravity
 */

// --- Configurações Iniciais e Estado ---
const state = {
    currentScore: 0,
    bestScore: localStorage.getItem('bestScore') || 0,
    interval: 2000, 
    timeout: 5000,  
    isPlaying: false,
    currentNote: null,
    gameLoopId: null,
    responseTimerId: null,
    lastNoteId: null,
    selectedClef: 'sol', // 'sol', 'fa', or 'both'
    theme: localStorage.getItem('theme') || 'dark'
};

const notesDatabase = {
    sol: [
        { name: 'Dó', y: 70, ledger: true, clef: 'sol', freq: 261.63 },   // C4
        { name: 'Ré', y: 65, ledger: false, clef: 'sol', freq: 293.66 },  // D4
        { name: 'Mi', y: 60, ledger: false, clef: 'sol', freq: 329.63 },  // E4
        { name: 'Fá', y: 55, ledger: false, clef: 'sol', freq: 349.23 },  // F4
        { name: 'Sol', y: 50, ledger: false, clef: 'sol', freq: 392.00 }, // G4
        { name: 'Lá', y: 45, ledger: false, clef: 'sol', freq: 440.00 },  // A4
        { name: 'Si', y: 40, ledger: false, clef: 'sol', freq: 493.88 },  // B4
        { name: 'Dó', y: 35, ledger: false, clef: 'sol', freq: 523.25 },  // C5
        { name: 'Ré', y: 30, ledger: false, clef: 'sol', freq: 587.33 },  // D5
        { name: 'Mi', y: 25, ledger: false, clef: 'sol', freq: 659.25 },  // E5
        { name: 'Fá', y: 20, ledger: false, clef: 'sol', freq: 698.46 },  // F5
        { name: 'Sol', y: 15, ledger: false, clef: 'sol', freq: 783.99 }, // G5
        { name: 'Lá', y: 10, ledger: true, clef: 'sol', freq: 880.00 },   // A5
    ],
    fa: [
        { name: 'Mi', y: 70, ledger: true, clef: 'fa', freq: 82.41 },    // E2
        { name: 'Fá', y: 65, ledger: false, clef: 'fa', freq: 87.31 },   // F2
        { name: 'Sol', y: 60, ledger: false, clef: 'fa', freq: 98.00 },  // G2
        { name: 'Lá', y: 55, ledger: false, clef: 'fa', freq: 110.00 },  // A2
        { name: 'Si', y: 50, ledger: false, clef: 'fa', freq: 123.47 },  // B2
        { name: 'Dó', y: 45, ledger: false, clef: 'fa', freq: 130.81 },  // C3
        { name: 'Ré', y: 40, ledger: false, clef: 'fa', freq: 146.83 },  // D3
        { name: 'Mi', y: 35, ledger: false, clef: 'fa', freq: 164.81 },  // E3
        { name: 'Fá', y: 30, ledger: false, clef: 'fa', freq: 174.61 },  // F3
        { name: 'Sol', y: 25, ledger: false, clef: 'fa', freq: 196.00 },  // G3
        { name: 'Lá', y: 20, ledger: false, clef: 'fa', freq: 220.00 },   // A3
        { name: 'Si', y: 15, ledger: false, clef: 'fa', freq: 246.94 },   // B3
        { name: 'Dó', y: 10, ledger: true, clef: 'fa', freq: 261.63 },    // C4
    ]
};

// --- Elementos do DOM ---
const elements = {
    currentScore: document.getElementById('current-score'),
    bestScore: document.getElementById('best-score'),
    staffVisual: document.getElementById('staff-visual'),
    timerBar: document.getElementById('timer-bar'),
    messageDisplay: document.getElementById('message-display'),
    noteButtons: document.querySelectorAll('.note-btn'),
    startScreen: document.getElementById('start-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    settingsPanel: document.getElementById('settings-panel'),
    settingsToggle: document.getElementById('settings-toggle'),
    settingsClose: document.getElementById('settings-close'),
    startBtn: document.getElementById('start-btn'),
    settingsStartBtn: document.getElementById('settings-start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    settingsGameoverBtn: document.getElementById('settings-gameover-btn'),
    finalScoreText: document.getElementById('final-score-text'),
    intervalInput: document.getElementById('interval-input'),
    timeoutInput: document.getElementById('timeout-input'),
    intervalValue: document.getElementById('interval-value'),
    timeoutValue: document.getElementById('timeout-value'),
    feedbackOverlay: document.getElementById('feedback-overlay'),
    staffCard: document.getElementById('staff-container'),
    clefInputs: document.querySelectorAll('input[name="clef-type"]'),
    themeInputs: document.querySelectorAll('input[name="theme-type"]'),
    soundToggle: document.getElementById('sound-toggle'),
    labelsToggle: document.getElementById('labels-toggle'),
    pianoKeyboard: document.getElementById('piano-keyboard')
};

// --- Áudio ---
let audioCtx;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(freq) {
    if (!elements.soundToggle.checked || !freq) return;
    const ctx = getAudioContext();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 1.0);
}

// --- Inicialização ---
function init() {
    elements.bestScore.textContent = state.bestScore;
    applyTheme(state.theme);
    setupEventListeners();
    renderEmptyStaff();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.restartBtn.addEventListener('click', startGame);
    
    elements.noteButtons.forEach(btn => {
        btn.addEventListener('click', () => handleUserInput(btn.dataset.note));
    });

    elements.settingsToggle.addEventListener('click', () => elements.settingsPanel.classList.toggle('active'));
    elements.settingsClose.addEventListener('click', () => elements.settingsPanel.classList.remove('active'));
    
    // Abrir configurações a partir dos popups
    elements.settingsStartBtn.addEventListener('click', () => elements.settingsPanel.classList.add('active'));
    elements.settingsGameoverBtn.addEventListener('click', () => elements.settingsPanel.classList.add('active'));

    // Configurações
    elements.intervalInput.addEventListener('input', (e) => {
        state.interval = parseInt(e.target.value);
        elements.intervalValue.textContent = `${state.interval}ms`;
    });

    elements.timeoutInput.addEventListener('input', (e) => {
        state.timeout = parseInt(e.target.value);
        elements.timeoutValue.textContent = `${state.timeout}ms`;
    });

    elements.clefInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            state.selectedClef = e.target.value;
            renderEmptyStaff();
        });
    });

    elements.themeInputs.forEach(input => {
        if (input.value === state.theme) input.checked = true;
        input.addEventListener('change', (e) => {
            state.theme = e.target.value;
            applyTheme(state.theme);
        });
    });

    elements.labelsToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            elements.pianoKeyboard.classList.remove('hide-labels');
        } else {
            elements.pianoKeyboard.classList.add('hide-labels');
        }
    });

    // Estado inicial dos rótulos
    if (!elements.labelsToggle.checked) {
        elements.pianoKeyboard.classList.add('hide-labels');
    }
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// --- Lógica do Jogo ---

function startGame() {
    getAudioContext(); // Desbloqueia o áudio no primeiro clique do usuário
    state.isPlaying = true;
    state.currentScore = 0;
    elements.currentScore.textContent = '0';
    elements.startScreen.classList.remove('active');
    elements.gameOverScreen.classList.remove('active');
    elements.messageDisplay.textContent = 'Identifique a nota!';
    
    nextTurn();
}

function nextTurn() {
    if (!state.isPlaying) return;

    // Limpar timers anteriores
    cancelAnimationFrame(state.responseTimerId);

    // Escolher nova nota
    let pool = [];
    if (state.selectedClef === 'sol') pool = notesDatabase.sol;
    else if (state.selectedClef === 'fa') pool = notesDatabase.fa;
    else pool = [...notesDatabase.sol, ...notesDatabase.fa];

    let newNote;
    do {
        newNote = pool[Math.floor(Math.random() * pool.length)];
    } while (newNote === state.currentNote && pool.length > 1);

    state.currentNote = newNote;
    renderNote(newNote);
    
    // Timer de Resposta (Visual e Lógico)
    startResponseTimer();
}

function startResponseTimer() {
    const startTime = Date.now();
    elements.timerBar.style.width = '100%';
    elements.timerBar.style.background = 'var(--primary)';

    const updateTimer = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, state.timeout - elapsed);
        const percentage = (remaining / state.timeout) * 100;
        
        elements.timerBar.style.width = `${percentage}%`;

        if (percentage < 30) {
            elements.timerBar.style.background = 'var(--error)';
        }

        if (remaining <= 0) {
            gameOver('Tempo esgotado!');
        } else if (state.isPlaying) {
            state.responseTimerId = requestAnimationFrame(updateTimer);
        }
    };

    state.responseTimerId = requestAnimationFrame(updateTimer);
}

function handleUserInput(selectedNote) {
    if (!state.isPlaying) return;

    cancelAnimationFrame(state.responseTimerId);

    if (selectedNote === state.currentNote.name) {
        handleCorrectAnswer();
    } else {
        gameOver(`Errado! Era ${state.currentNote.name}`);
    }
}

function handleCorrectAnswer() {
    state.currentScore++;
    elements.currentScore.textContent = state.currentScore;
    showFeedback('correct');
    
    // Tocar o som da nota
    if (state.currentNote && state.currentNote.freq) {
        playSound(state.currentNote.freq);
    }
    
    // Aguardar o intervalo configurado antes da próxima nota
    state.isPlaying = false; // Pausa temporária para o delay
    elements.timerBar.style.width = '0%';
    elements.messageDisplay.textContent = 'Boa! Aguarde...';

    setTimeout(() => {
        state.isPlaying = true;
        nextTurn();
    }, 1000); // Pequena pausa fixa para feedback visual
}

function gameOver(reason) {
    state.isPlaying = false;
    cancelAnimationFrame(state.responseTimerId);
    showFeedback('wrong');
    elements.staffCard.classList.add('shake');
    setTimeout(() => elements.staffCard.classList.remove('shake'), 500);

    // Atualizar Melhor Recorde
    if (state.currentScore > state.bestScore) {
        state.bestScore = state.currentScore;
        localStorage.setItem('bestScore', state.bestScore);
        elements.bestScore.textContent = state.bestScore;
    }

    elements.finalScoreText.textContent = `Sua sequência: ${state.currentScore}`;
    elements.messageDisplay.textContent = reason;
    elements.gameOverScreen.classList.add('active');
}

// --- Renderização SVG ---

function renderEmptyStaff() {
    const clef = state.selectedClef === 'both' ? 'sol' : state.selectedClef;
    const svg = createStaffBase(clef);
    elements.staffVisual.innerHTML = svg;
}

function createStaffBase(clefType = 'sol') {
    const color = 'var(--staff-fg)';
    let clefPath = '';

    if (clefType === 'sol') {
        // Clave de Sol (Unicode: 𝄞)
        clefPath = `<text x="15" y="62" font-size="65" font-family="serif" fill="${color}">&#119070;</text>`;
    } else {
        // Clave de Fá (Unicode: 𝄢)
        clefPath = `<text x="15" y="60" font-size="65" font-family="serif" fill="${color}">&#119074;</text>`;
    }

    return `
        <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Linhas da Pauta -->
            <line x1="10" y1="20" x2="190" y2="20" stroke="${color}" stroke-width="0.5" />
            <line x1="10" y1="30" x2="190" y2="30" stroke="${color}" stroke-width="0.5" />
            <line x1="10" y1="40" x2="190" y2="40" stroke="${color}" stroke-width="0.5" />
            <line x1="10" y1="50" x2="190" y2="50" stroke="${color}" stroke-width="0.5" />
            <line x1="10" y1="60" x2="190" y2="60" stroke="${color}" stroke-width="0.5" />
            
            ${clefPath}
            
            <g id="note-layer"></g>
        </svg>
    `;
}

function renderNote(note) {
    // Redesenhar a pauta sempre para garantir a clave correta
    const svg = createStaffBase(note.clef);
    elements.staffVisual.innerHTML = svg;

    let content = '';
    const color = 'var(--staff-fg)';
    
    // Linha suplementar se necessário
    if (note.ledger) {
        content += `<line x1="90" y1="${note.y}" x2="110" y2="${note.y}" stroke="${color}" stroke-width="0.8" />`;
    }

    // Cabeça da nota
    content += `<ellipse cx="100" cy="${note.y}" rx="5" ry="3.5" fill="${color}" transform="rotate(-20, 100, ${note.y})" />`;

    // Haste da nota
    const stemUp = note.y > 40;
    if (stemUp) {
        content += `<line x1="104.5" y1="${note.y}" x2="104.5" y2="${note.y - 25}" stroke="${color}" stroke-width="0.8" />`;
    } else {
        content += `<line x1="95.5" y1="${note.y}" x2="95.5" y2="${note.y + 25}" stroke="${color}" stroke-width="0.8" />`;
    }

    document.getElementById('note-layer').innerHTML = content;
}

function showFeedback(type) {
    elements.feedbackOverlay.className = `feedback-overlay ${type}`;
    setTimeout(() => {
        elements.feedbackOverlay.className = 'feedback-overlay';
    }, 500);
}

// Iniciar
init();
