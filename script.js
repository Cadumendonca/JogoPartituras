/**
 * Mestre da Partitura - Motor do Jogo
 * Desenvolvido por Antigravity
 */

// --- Configurações Iniciais e Estado ---
const state = {
    currentScore: 0,
    bestScore: localStorage.getItem('bestScore') || 0,
    interval: 5000, 
    timeout: 3000,  
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
        { name: 'Dó', y: 70, ledger: true, clef: 'sol' },   // C4
        { name: 'Ré', y: 65, ledger: false, clef: 'sol' },  // D4
        { name: 'Mi', y: 60, ledger: false, clef: 'sol' },  // E4
        { name: 'Fá', y: 55, ledger: false, clef: 'sol' },  // F4
        { name: 'Sol', y: 50, ledger: false, clef: 'sol' }, // G4
        { name: 'Lá', y: 45, ledger: false, clef: 'sol' },  // A4
        { name: 'Si', y: 40, ledger: false, clef: 'sol' },  // B4
        { name: 'Dó', y: 35, ledger: false, clef: 'sol' },  // C5
        { name: 'Ré', y: 30, ledger: false, clef: 'sol' },  // D5
        { name: 'Mi', y: 25, ledger: false, clef: 'sol' },  // E5
        { name: 'Fá', y: 20, ledger: false, clef: 'sol' },  // F5
        { name: 'Sol', y: 15, ledger: false, clef: 'sol' }, // G5
        { name: 'Lá', y: 10, ledger: true, clef: 'sol' },   // A5
    ],
    fa: [
        { name: 'Mi', y: 70, ledger: true, clef: 'fa' },    // E2
        { name: 'Fá', y: 65, ledger: false, clef: 'fa' },   // F2
        { name: 'Sol', y: 60, ledger: false, clef: 'fa' },  // G2
        { name: 'Lá', y: 55, ledger: false, clef: 'fa' },   // A2
        { name: 'Si', y: 50, ledger: false, clef: 'fa' },   // B2
        { name: 'Dó', y: 45, ledger: false, clef: 'fa' },   // C3
        { name: 'Ré', y: 40, ledger: false, clef: 'fa' },   // D3
        { name: 'Mi', y: 35, ledger: false, clef: 'fa' },   // E3
        { name: 'Fá', y: 30, ledger: false, clef: 'fa' },   // F3
        { name: 'Sol', y: 25, ledger: false, clef: 'fa' },  // G3
        { name: 'Lá', y: 20, ledger: false, clef: 'fa' },   // A3
        { name: 'Si', y: 15, ledger: false, clef: 'fa' },   // B3
        { name: 'Dó', y: 10, ledger: true, clef: 'fa' },    // C4
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
    restartBtn: document.getElementById('restart-btn'),
    finalScoreText: document.getElementById('final-score-text'),
    intervalInput: document.getElementById('interval-input'),
    timeoutInput: document.getElementById('timeout-input'),
    intervalValue: document.getElementById('interval-value'),
    timeoutValue: document.getElementById('timeout-value'),
    feedbackOverlay: document.getElementById('feedback-overlay'),
    staffCard: document.getElementById('staff-container'),
    clefInputs: document.querySelectorAll('input[name="clef-type"]'),
    themeInputs: document.querySelectorAll('input[name="theme-type"]')
};

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
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// --- Lógica do Jogo ---

function startGame() {
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
    clearTimeout(state.responseTimerId);
    clearInterval(state.gameLoopId);

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
    const clef = state.isPlaying && state.currentNote ? state.currentNote.clef : (state.selectedClef === 'both' ? 'sol' : state.selectedClef);
    const svg = createStaffBase(clef);
    elements.staffVisual.innerHTML = svg;
}

function createStaffBase(clefType = 'sol') {
    const color = 'var(--staff-fg)';
    let clefPath = '';

    if (clefType === 'sol') {
        // Clave de Sol
        clefPath = `<path d="M22.5,65.3c-0.2,0-0.4,0-0.6-0.1c-1.3-0.5-2.2-1.9-2.2-3.6c0-1.2,0.5-2.5,1.4-3.7c1-1.3,2.4-2.5,3.9-3.5 c0.3-0.2,0.6-0.4,0.9-0.6c0.5-0.3,0.9-0.6,1.4-0.9c0.9-0.6,1.6-1.1,2.1-1.5c1-0.9,1.6-1.8,1.6-2.9c0-1.3-0.8-2.3-2-2.3 c-0.8,0-1.6,0.5-2.1,1.3c-0.5,0.8-0.7,1.7-0.7,2.4c0,0.4,0.3,0.7,0.7,0.7c0.4,0,0.7-0.3,0.7-0.7c0-0.5,0.1-1.1,0.4-1.6 c0.3-0.4,0.7-0.7,1-0.7c0.4,0,0.6,0.3,0.6,0.9c0,0.8-0.5,1.5-1.4,2.3c-0.5,0.4-1.2,0.9-2,1.5c-0.5,0.3-0.9,0.6-1.4,0.9 c-0.3,0.2-0.6,0.4-0.9,0.6c-1.7,1.1-3.2,2.5-4.4,4.1c-1.1,1.5-1.7,3.2-1.7,4.8c0,2.3,1.3,4.2,3.1,4.9c0.2,0.1,0.4,0.1,0.6,0.1 c0.4,0,0.7-0.3,0.7-0.7C23.3,65.6,22.9,65.3,22.5,65.3z M30.9,47.4c-0.5,0.3-0.9,0.6-1.4,0.9c-0.3,0.2-0.6,0.4-0.9,0.6 c-1.7,1.1-3.2,2.5-4.4,4.1c-1.1,1.5-1.7,3.2-1.7,4.8c0,2.3,1.3,4.2,3.1,4.9c0.2,0.1,0.4,0.1,0.6,0.1c0.4,0,0.7-0.3,0.7-0.7 c0-0.4-0.3-0.7-0.7-0.7c-0.2,0-0.4,0-0.6-0.1c-1.3-0.5-2.2-1.9-2.2-3.6c0-1.2,0.5-2.5,1.4-3.7c1-1.3,2.4-2.5,3.9-3.5 c0.3-0.2,0.6-0.4,0.9-0.6c0.5-0.3,0.9-0.6,1.4-0.9c0.9-0.6,1.6-1.1,2.1-1.5c1-0.9,1.6-1.8,1.6-2.9c0-1.3-0.8-2.3-2-2.3 c-0.8,0-1.6,0.5-2.1,1.3c-0.5,0.8-0.7,1.7-0.7,2.4c0,0.4,0.3,0.7,0.7,0.7c0.4,0,0.7-0.3,0.7-0.7c0-0.5,0.1-1.1,0.4-1.6 c0.3-0.4,0.7-0.7,1-0.7c0.4,0,0.6,0.3,0.6,0.9c0,0.8-0.5,1.5-1.4,2.3C32.1,46.5,31.4,47,30.9,47.4z" fill="${color}" transform="scale(1.5) translate(-5, -5)" />`;
    } else {
        // Clave de Fá
        clefPath = `
            <g transform="scale(1.3) translate(12, 18)" fill="${color}">
                <path d="M0,12c0,0,0-12,12-12s12,10,12,10s0,15-15,25" fill="none" stroke="${color}" stroke-width="3" />
                <circle cx="3" cy="12" r="3" />
                <circle cx="28" cy="8" r="2" />
                <circle cx="28" cy="16" r="2" />
            </g>`;
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
    const noteLayer = document.getElementById('note-layer');
    if (!noteLayer) {
        renderEmptyStaff();
        return renderNote(note);
    }

    // Redesenhar a pauta com a clave correta se estivermos no modo "ambas"
    if (state.selectedClef === 'both') {
        const svg = createStaffBase(note.clef);
        elements.staffVisual.innerHTML = svg;
    }

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
