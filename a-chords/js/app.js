// =========================
// APP.JS (MENÚ + JUEGO)
// =========================

const state = {
    family: null,
    chordType: null,
    diagonalNote: null,
    chordDegrees: null,
    boardSize: 3,

    board: [],
    activeCell: null,

    startTime: null,
    timerInterval: null,
    elapsedTime: 0
};

// =========================
// DEFINICIÓN MUSICAL (CAT)
// =========================

const TRIADS = [
    { key: 'major', label: 'M', degrees: ['1','3','5'] },
    { key: 'minor', label: 'm', degrees: ['1','♭3','5'] },
    { key: 'augmented', label: '+', degrees: ['1','3','♯5'] },
    { key: 'diminished', label: 'º', degrees: ['1','♭3','♭5'] }
];

const TETRADS = [
    { key: 'maj7', label: 'maj7', degrees: ['1','3','5','7'] },
    { key: '7', label: '7', degrees: ['1','3','5','♭7'] },
    { key: 'm7', label: 'm7', degrees: ['1','♭3','5','♭7'] },
    { key: 'm7b5', label: 'm7(b5)', degrees: ['1','♭3','♭5','♭7'] }
];


// =========================
// INIT
// =========================

document.addEventListener('DOMContentLoaded', () => {
    bindWelcome();
    setupFamilyMenu();
    bindNext();
    bindDiagonal();
    bindStart();
    bindValidate();
    bindSoundToggle();
});

// =========================
// MENÚS
// =========================

function bindWelcome() {
    document.getElementById('btn-welcome').onclick = () => {
        showScreen('screen-menu');
    };
}

function setupFamilyMenu() {
    document.querySelectorAll('#family-buttons button')
        .forEach(btn => {
            btn.onclick = () => {
                state.family = btn.dataset.family;
                markSelected(btn, 'family-buttons');
                showChordTypes();
            };
        });
}

function showChordTypes() {
    const container = document.getElementById('chord-buttons');
    container.innerHTML = '';

    const source = state.family === 'triad' ? TRIADS : TETRADS;

    source.forEach(item => {
        const btn = document.createElement('button');
        btn.innerHTML = item.label;
        btn.onclick = () => {
            state.chordType = item.key;
            state.chordDegrees = item.degrees;
            state.boardSize = item.degrees.length;
            markSelected(btn, 'chord-buttons');
        };
        container.appendChild(btn);
    });
}

function bindNext() {
    document.getElementById('btn-next').onclick = () => {
        if (!state.family || !state.chordType) return;
        showScreen('screen-diagonal');
        renderDiagonalButtons();
    };
}

// =========================
// DIAGONAL
// =========================

function renderDiagonalButtons() {
    const container = document.getElementById('diagonal-buttons');
    container.innerHTML = '';

    const letters = ['C','D','E','F','G','A','B'];
    const alterations = ['','#','b'];

    letters.forEach(l =>
        alterations.forEach(a => {
            const note = l + a;
            const btn = document.createElement('button');
            btn.textContent = note;
            btn.onclick = () => {
                state.diagonalNote = note;
                markSelected(btn, 'diagonal-buttons');
            };
            container.appendChild(btn);
        })
    );
}

function bindDiagonal() {
    document.getElementById('btn-random').onclick = () => {
        const buttons = document.querySelectorAll('#diagonal-buttons button');
        buttons[Math.floor(Math.random() * buttons.length)].click();
    };
}

// =========================
// JUEGO
// =========================

function bindStart() {
    document.getElementById('btn-start').onclick = () => {
        if (!state.diagonalNote) return;
        showScreen('screen-game');
        startGame();
    };
}

function startGame() {
    createBoard();
    setFirstActiveCell();
    renderBoard();
    renderDegreeLabels();
    renderNotePalette();
    startTimer();
}

// =========================
// VALIDACIÓN
// =========================

function bindValidate() {
    document.getElementById('btn-validate').onclick = () => {
        const errors = validateBoard();
        if (errors.length === 0) {
            stopTimer();
            showSuccess();
            playAllColumns();
            showFinalScreen();
        } else {
            showErrors(errors);
        }
    };
}

function bindSoundToggle() {
    document.getElementById('btn-sound').onclick = () => {
        const enabled = toggleSound();
        document.getElementById('btn-sound').textContent =
            enabled ? '🔊 So' : '🔇 So';
    };
}

// =========================
// CRONO
// =========================

function startTimer() {
    state.startTime = Date.now();
    state.elapsedTime = 0;

    state.timerInterval = setInterval(() => {
        state.elapsedTime = Date.now() - state.startTime;
        updateTimerUI(state.elapsedTime);
    }, 100);
}

function stopTimer() {
    clearInterval(state.timerInterval);
    updateTimerUI(state.elapsedTime, true);
}

// =========================
// PANTALLA FINAL (ANIMACIÓN SOLO TEXTO)
// =========================

function showFinalScreen() {
    const ms = state.elapsedTime;
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    document.getElementById('final-time').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const totalSoundTime = state.boardSize * 1200 + 300;

    setTimeout(() => {
        showScreen('screen-final');

        const title = document.getElementById('final-title');
        title.classList.remove('animate');
        void title.offsetWidth;
        title.classList.add('animate');

    }, totalSoundTime);
}

// =========================
// UTILS
// =========================

function showScreen(id) {
    document.querySelectorAll('.screen')
        .forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function markSelected(btn, groupId) {
    document.querySelectorAll(`#${groupId} button`)
        .forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// =========================
// BOTONES FINALES
// =========================

document.getElementById('btn-repeat').onclick = () => {
    showScreen('screen-game');
    startGame();
};

document.getElementById('btn-new').onclick = () => {
    // Reset total de estado
    state.family = null;
    state.chordType = null;
    state.diagonalNote = null;
    state.chordDegrees = null;
    state.boardSize = 3;

    // Limpiar selecciones visuales
    document.querySelectorAll('button.selected')
        .forEach(b => b.classList.remove('selected'));

    // Volver al menú principal
    showScreen('screen-menu');
};
