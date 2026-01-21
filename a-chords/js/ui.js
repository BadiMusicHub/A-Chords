// =========================
// UI.JS
// =========================

function formatNoteHTML(note) {
    const letter = note[0];
    const acc = note.slice(1);

    const accMap = {
        '#': '♯',
        'b': '♭',
        '##': '𝄪',
        'bb': '𝄫'
    };

    return `
        <span class="note-letter">${letter}</span>
        <span class="note-accidental">${accMap[acc] || ''}</span>
    `;
}

// =========================
// TABLERO
// =========================

function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    const size = state.boardSize;
    board.style.gridTemplateColumns = `repeat(${size}, auto)`;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = state.board[row][col];
            const div = document.createElement('div');
            div.className = 'cell';

            if (cell.fixed) div.classList.add('fixed');
            if (cell.note) div.innerHTML = formatNoteHTML(cell.note);

            div.onclick = () => {
                if (!cell.fixed) {
                    state.activeCell = cell;
                    updateBoardUI();
                }
            };

            board.appendChild(div);
        }
    }

    updateBoardUI();
}

function updateBoardUI() {
    const cells = document.querySelectorAll('.cell');
    let i = 0;

    for (let row = 0; row < state.boardSize; row++) {
        for (let col = 0; col < state.boardSize; col++) {
            const cell = state.board[row][col];
            const el = cells[i++];

            el.innerHTML = cell.note ? formatNoteHTML(cell.note) : '';
            el.classList.toggle('active', cell === state.activeCell);
            el.classList.remove('error', 'correct');
        }
    }
}

// =========================
// GUÍA DE GRADOS
// =========================

function renderDegreeLabels() {
    const c = document.getElementById('degree-labels');
    c.innerHTML = '';

    [...state.chordDegrees].reverse().forEach(d => {
        const div = document.createElement('div');
        div.className = 'degree-label';
        div.textContent = d;
        c.appendChild(div);
    });
}

// =========================
// PALETA DE NOTAS (FIX CLAVE)
// =========================

function renderNotePalette() {
    const container = document.getElementById('note-palette');
    container.innerHTML = '';

    const letters = ['C','D','E','F','G','A','B'];
    const rows = ['##', '#', '', 'b', 'bb'];

    rows.forEach(acc => {
        letters.forEach(letter => {
            const note = letter + acc;
            const cell = document.createElement('div');

            if (!NOTE_VALUES.hasOwnProperty(note)) {
                cell.className = 'palette-placeholder';
                container.appendChild(cell);
                return;
            }

            cell.classList.add('palette-note');

            // === CLASIFICACIÓN VISUAL ===
            if (acc === '') {
                cell.classList.add('natural');
            } else if (acc.length === 1) {
                cell.classList.add('accidental-1');
            } else {
                cell.classList.add('accidental-2');
            }

            cell.innerHTML = formatNoteHTML(note);

            cell.onclick = () => {
                insertNote(note);
            };

            container.appendChild(cell);
        });
    });
}

// =========================
// VALIDACIÓN VISUAL
// =========================

function showErrors(errors) {
    errors.forEach(c => {
        const idx = c.row * state.boardSize + c.col;
        document.querySelectorAll('.cell')[idx]
            .classList.add('error');
    });
}

function showSuccess() {
    document.querySelectorAll('.cell').forEach(el => {
        if (!el.classList.contains('fixed')) {
            el.classList.add('correct');
        }
    });
}

// =========================
// CRONO
// =========================

function updateTimerUI(ms, finished = false) {
    const el = document.getElementById('timer');
    if (!el) return;

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    el.textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;

    el.classList.toggle('finished', finished);
}
