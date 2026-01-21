// =========================
// AUDIO.JS
// Piano warm (sintético)
// =========================

let audioCtx = null;
let soundEnabled = true;

// Octava base de la fundamental
const BASE_OCTAVE = 3;

// Ajustes globales de timbre
const PIANO_SETTINGS = {
    volume: 0.22,
    attack: 0.02,
    release: 0.30,
    filterFreq: 1400,   // cuanto más bajo, más “warm”
    filterQ: 0.7
};

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function midiFromNote(note, octave) {
    return 12 * (octave + 1) + noteToValue(note);
}

function freqFromMidi(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

// =========================
// MOTOR DE NOTA (WARM PIANO)
// =========================

function playMidi(midi, duration = 0.5) {
    if (!soundEnabled) return;
    initAudio();

    const now = audioCtx.currentTime;
    const freq = freqFromMidi(midi);

    // Osciladores
    const oscMain = audioCtx.createOscillator();
    const oscSoft = audioCtx.createOscillator();

    oscMain.type = 'triangle'; // cuerpo
    oscSoft.type = 'sine';     // suavidad

    oscMain.frequency.value = freq;
    oscSoft.frequency.value = freq;

    // Mezcla
    const gainMain = audioCtx.createGain();
    const gainSoft = audioCtx.createGain();
    gainMain.gain.value = 0.7;
    gainSoft.gain.value = 0.3;

    // Filtro warm
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = PIANO_SETTINGS.filterFreq;
    filter.Q.value = PIANO_SETTINGS.filterQ;

    // Envolvente
    const gainEnv = audioCtx.createGain();
    gainEnv.gain.setValueAtTime(0.0001, now);
    gainEnv.gain.linearRampToValueAtTime(
        PIANO_SETTINGS.volume,
        now + PIANO_SETTINGS.attack
    );
    gainEnv.gain.linearRampToValueAtTime(
        0.0001,
        now + duration + PIANO_SETTINGS.release
    );

    // Conexiones
    oscMain.connect(gainMain);
    oscSoft.connect(gainSoft);

    gainMain.connect(filter);
    gainSoft.connect(filter);

    filter.connect(gainEnv);
    gainEnv.connect(audioCtx.destination);

    oscMain.start(now);
    oscSoft.start(now);

    oscMain.stop(now + duration + PIANO_SETTINGS.release);
    oscSoft.stop(now + duration + PIANO_SETTINGS.release);
}

// =========================
// NOTA SUELTA (PALETA)
// =========================

function playNote(note) {
    const midi = midiFromNote(note, BASE_OCTAVE);
    playMidi(midi);
}

// =========================
// COLUMNA (ACORDE)
// =========================

function playColumn(col) {
    const size = state.boardSize;

    // notas de abajo arriba
    const notes = [];
    for (let row = size - 1; row >= 0; row--) {
        notes.push(state.board[row][col].note);
    }

    // apilado ascendente correcto
    let currentMidi = midiFromNote(notes[0], BASE_OCTAVE);
    const midiNotes = [currentMidi];

    for (let i = 1; i < notes.length; i++) {
        let midi = midiFromNote(notes[i], BASE_OCTAVE);
        while (midi <= currentMidi) midi += 12;
        midiNotes.push(midi);
        currentMidi = midi;
    }

    midiNotes.forEach((midi, i) => {
        setTimeout(() => playMidi(midi), i * 120);
    });
}

// =========================
// TODAS LAS COLUMNAS
// =========================

function playAllColumns() {
    let delay = 0;
    for (let col = 0; col < state.boardSize; col++) {
        setTimeout(() => playColumn(col), delay);
        delay += 1100;
    }
}

// =========================
// TOGGLE SONIDO
// =========================

function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
}
