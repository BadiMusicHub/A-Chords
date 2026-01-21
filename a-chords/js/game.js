// =========================
// GAME.JS
// =========================

// =========================
// GRADOS → SEMITONS
// =========================

const DEGREE_TO_SEMITONES = {
    '1': 0,
    '♭3': 3,
    '3': 4,
    '♭5': 6,
    '5': 7,
    '♯5': 8,
    '♭7': 10,
    '7': 11
};

// =========================
// NOTES → VALORS
// =========================

const NOTE_VALUES = {
    C:0, D:2, E:4, F:5, G:7, A:9, B:11,

    'C#':1,'Db':1,
    'D#':3,'Eb':3,
    'E#':5,'Fb':4,
    'F#':6,'Gb':6,
    'G#':8,'Ab':8,
    'A#':10,'Bb':10,
    'B#':0,'Cb':11,

    'C##':2,'Dbb':0,
    'D##':4,'Ebb':2,
    'F##':7,'Gbb':5,
    'G##':9,'Abb':7,
    'A##':11,'Bbb':9
};

function noteToValue(note) {
    return NOTE_VALUES[note];
}

// =========================
// TABLERO
// =========================

function createBoard() {
    const size = state.boardSize;
    state.board = [];

    for (let row = 0; row < size; row++) {
        const rowData = [];
        for (let col = 0; col < size; col++) {
            const isDiagonal = col === (size - 1 - row);
            rowData.push({
                row,
                col,
                fixed: isDiagonal,
                note: isDiagonal ? state.diagonalNote : null
            });
        }
        state.board.push(rowData);
    }
}

// =========================
// RECORRIDO
// =========================

function getTraversalOrder() {
    const order = [];
    for (let col = 0; col < state.boardSize; col++) {
        for (let row = state.boardSize - 1; row >= 0; row--) {
            const cell = state.board[row][col];
            if (!cell.fixed) order.push(cell);
        }
    }
    return order;
}

function setFirstActiveCell() {
    state.activeCell = getTraversalOrder()[0] || null;
}

// =========================
// INSERCIÓN (🔊 SONIDO AQUÍ)
// =========================

function insertNote(note) {
    if (!state.activeCell) return;

    const cell = state.board[state.activeCell.row][state.activeCell.col];
    if (cell.fixed) return;

    cell.note = note;

    // 🔊 sonido correcto al clicar
    playNote(note);

    moveToNextCell();
}


function moveToNextCell() {
    const next = getTraversalOrder().find(c => !c.note);
    if (next) state.activeCell = next;
    updateBoardUI();
}

// =========================
// MOTOR MUSICAL
// =========================

function getColumnRootValue(col) {
    for (let row = 0; row < state.boardSize; row++) {
        const cell = state.board[row][col];
        if (cell.fixed) {
            const degree = state.chordDegrees[state.boardSize - 1 - row];
            return (noteToValue(cell.note) - DEGREE_TO_SEMITONES[degree] + 12) % 12;
        }
    }
    return null;
}

function getExpectedValue(row, col) {
    const root = getColumnRootValue(col);
    const degree = state.chordDegrees[state.boardSize - 1 - row];
    return (root + DEGREE_TO_SEMITONES[degree]) % 12;
}

// =========================
// VALIDACIÓN
// =========================

const NOTE_LETTERS = ['C','D','E','F','G','A','B'];

function getNoteLetter(note) {
    return note[0];
}

function getColumnRootLetter(col) {
    for (let row = 0; row < state.boardSize; row++) {
        const cell = state.board[row][col];
        if (cell.fixed) {
            const degree = state.chordDegrees[state.boardSize - 1 - row];
            const stepsMap = {
                '1': 0,
                '♭3': -2, '3': -2,
                '♭5': -4, '5': -4, '♯5': -4,
                '♭7': -6, '7': -6
            };

            const fixedLetter = getNoteLetter(cell.note);
            const fixedIndex = NOTE_LETTERS.indexOf(fixedLetter);
            const steps = stepsMap[degree];

            const rootIndex = (fixedIndex + steps + 7) % 7;
            return NOTE_LETTERS[rootIndex];
        }
    }
    return null;
}

function getExpectedLetter(row, col) {
    const degree = state.chordDegrees[state.boardSize - 1 - row];

    const degreeSteps = {
        '1': 0,
        '♭3': 2, '3': 2,
        '♭5': 4, '5': 4, '♯5': 4,
        '♭7': 6, '7': 6
    };

    const rootLetter = getColumnRootLetter(col);
    const rootIndex = NOTE_LETTERS.indexOf(rootLetter);

    const steps = degreeSteps[degree];
    return NOTE_LETTERS[(rootIndex + steps) % 7];
}



function validateBoard() {
    const errors = [];

    for (let col = 0; col < state.boardSize; col++) {
        for (let row = 0; row < state.boardSize; row++) {
            const cell = state.board[row][col];
            if (cell.fixed) continue;

            if (!cell.note) {
                errors.push(cell);
                continue;
            }

            // 1️⃣ comprobación sonora
            const expectedValue = getExpectedValue(row, col);
            const actualValue = noteToValue(cell.note);

            if (actualValue !== expectedValue) {
                errors.push(cell);
                continue;
            }

            // 2️⃣ comprobación ortográfica
            const expectedLetter = getExpectedLetter(row, col);
            const actualLetter = getNoteLetter(cell.note);

            if (actualLetter !== expectedLetter) {
                errors.push(cell);
            }
        }
    }

    return errors;
}
