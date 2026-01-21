// =========================
// ESTADO GLOBAL DEL JUEGO
// =========================

const state = {

    // Pantalla actual
    currentScreen: 'difficulty', 
    // difficulty | diagonal | game

    // Configuración del ejercicio
    structure: null,        // 'triad' | 'tetrad'
    chordType: null,        // ej: 'major', 'minor', 'm7', etc.
    boardSize: null,        // 3 o 4

    // Nota de la diagonal
    diagonalNote: null,     // ej: 'C', 'F#', 'Bb'
    diagonalMode: null,     // 'manual' | 'random'

    // Tablero
    board: [],              // matriz de casillas
    activeCell: null,       // { row, col }

    // Tiempo
    startTime: null,
    elapsedTime: 0,

    // Audio
    soundEnabled: true
};
