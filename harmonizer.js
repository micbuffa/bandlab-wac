const noteTable = {
  0 : "C",
  1 : "C#",
  2 : "D",
  3 : "D#",
  4 : "E",
  5 : "F",
  6 : "F#",
  7 : "G",
  8 : "G#",
  9 : "A",
  10 : "A#",
  11 : "B"
};

// Defines the basic chord qualities for each root note within a major scale
const ROOT_CHART = {
  0 : "major",
  1 : "minor",
  2 : "minor",
  3 : "minor",
  4 : "minor",
  5 : "major",
  6 : "diminished",
  7 : "dominant",
  8 : "minor",
  9 : "minor",
  10 : "minor",
  11 : "diminished"
}

// ---Two note, three note, and four note haromonies---
// Thirds: https://en.wikipedia.org/wiki/Third
// Triads: https://en.wikipedia.org/wiki/Triad_(music)
// Sevenths: https://en.wikipedia.org/wiki/Seventh_chord
const CHORD_TYPE = {
 "thirds" : 1,
 "triads" : 2,
 "sevenths" : 3,
}

const CHORD_QUALITY = {
  "minor" : [0, 3, 7, 10],
  "major" : [0, 4, 7, 11],
  "dominant" : [0, 4, 7, 10],
  "diminished" : [0, 4, 6, 10]
}

function midiBase(n) {
  return n % 12;
}

// Calculate simple root harmonies based on incoming midi note
function generateRootHarmony(root, type, key, scaleType) {
  let chordArray = [];
  for (let i = 0; i <= CHORD_TYPE[type]; i++) {
    // First we find the base MIDI note (0-12) -> midiBase(root)
    // Then we derive which chord quality to generate in a give scale -> ROOT_CHART[midiBase(root)]
    // Then we add the basic chord quality array to the root note
    chordArray.push(root + CHORD_QUALITY[ROOT_CHART[midiBase(root)]][i]);
  }
  return chordArray;
}
