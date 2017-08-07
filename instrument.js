export const keyboard = [
  'Z', 'S', 'X', 'D', 'C', 'V', 'G', 'B', 'H', 'N', 'J', 'M', ',', 'L', '.',
  '1', 'Q', 'W', '3', 'E', '4', 'R', '5', 'T', 'Y', '7', 'U', '8', 'I', 'O', '0', 'P'
];

export function renderInstrument() {
  const keysEl = keyboard.reduce((acc, key, index) => {

    // Note colors, white for flat ones and and black for sharps ones
    const color = [1, 3, 6, 8, 10].includes(index % 12) ? 'black' : 'white';

    // Based on C0 note = code Midi 24
    const midiNote = index + 24;

    return `${acc}
      <div data-key="${key}" data-midi-note="${midiNote}" class="virtual-piano-${color}">
        <span>${key} ${midiNote}</span>
      </div>
    `;
  }, '');

  const pianoEl = document.createElement('div');
  pianoEl.innerHTML = keysEl;
  return pianoEl;
}
