import { keyboard } from './instrument.js';
import { generateRootHarmony } from './harmonizer.js';

export const audioCtx = new AudioContext();

const MAX_VELOCITY = 128;

const HARMONY_TYPE = "thirds";

const CODE_TO_KEY = {
  8: 'Backspace',
  9: 'Tab',
  13: 'Enter',
  16: 'Shift',
  17: 'Ctrl',
  18: 'Alt',
  20: 'Caps Lock',
  27: 'Esc',
  32: 'Space',
  37: 'Left',
  38: 'Up',
  39: 'Right',
  40: 'Down',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  65: 'A',
  66: 'B',
  67: 'C',
  68: 'D',
  69: 'E',
  70: 'F',
  71: 'G',
  72: 'H',
  73: 'I',
  74: 'J',
  75: 'K',
  76: 'L',
  77: 'M',
  78: 'N',
  79: 'O',
  80: 'P',
  81: 'Q',
  82: 'R',
  83: 'S',
  84: 'T',
  85: 'U',
  86: 'V',
  87: 'W',
  88: 'X',
  89: 'Y',
  90: 'Z',
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: '\''
};

function keyCode2MidiNote(keyCode) {
  return keyboard.includes(CODE_TO_KEY[keyCode]) ?
    keyboard.indexOf(CODE_TO_KEY[keyCode]) + 24 :
    0;
}

function getPlaybackRate(shift) {
  const SEMITONES_PER_OCTAVE = 12;
  return Math.pow(2, shift / SEMITONES_PER_OCTAVE);
}

export function useSoundbank(soundbank, pianoEl) {

  document.addEventListener('keydown', function({ keyCode }) {
  });

  document.addEventListener('keyup', function({ keyCode }) {
  });

  function playNote(midiNote) {
  }

  function stopNote(midiNote) {
  }

  function createBufferSource(midiNote, velocity = MAX_VELOCITY) {
  }
}
