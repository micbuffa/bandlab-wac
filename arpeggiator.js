import { audioCtx } from './sampler.js';

const ARP_QUALITY = {
  "basic" : [0, 7],
  "major" : [0, 4, 7],
  "minor" : [0, 3, 7],
  "dominant" : [0, 4, 7, 10],
  "diminished" : [0, 3, 6, 9]
}

let arpStep = 0;
let stepUp = true;
let midiNote = 0;

const ARP_TYPE = { // Sequence of how notes are played
	ascend: function(noteArray) {
		midiNote = noteArray[arpStep];
		arpStep++;
		if (arpStep === noteArray.length) arpStep = 0;
	},
	descend: function(noteArray) {
    midiNote = noteArray[noteArray.length - (arpStep + 1)];
    arpStep++;
    if (arpStep === noteArray.length) arpStep = 0;
	},
	upDown: function(noteArray) {
		if (stepUp) {
			midiNote = noteArray[arpStep];
			arpStep++;
      if (arpStep === noteArray.length - 1) stepUp = false;
		} else {
      midiNote = noteArray[arpStep];
      arpStep--;
      if (arpStep === 0) stepUp = true;
    }
	},
	random: function(noteArray) {
		midiNote = noteArray[Math.floor(Math.random() * (noteArray.length))];
	}
}

const RANGE = 1; // Number of octaves to be arpeggiated

let startTime;
let tempo = 120;
let arpNote;

function bpm2Seconds(bpm) {
  return 60 / bpm;
}

function parseSubDivision(bpm, subdivision) {
  return bpm / subdivision;
}

function genArpArray(arpQuality) { // generate array of notes to be played
	arpArray = ARP_QUALITY[arpQuality];
	if (RANGE > 1) {
		for (let i = 1; i <= RANGE; i++) {
			arpArray = arpArray
        .concat(ARP_QUALITY[arpQuality].map(x => x + (i * 12)));
		}
    arpArray.push(arpArray[0] + 12 * (RANGE + 1));
    return arpArray;
	} else {
		arpArray.push(arpArray[0] + 12);
		return arpArray;
	}
}

function Arpeggiator() {
}

Arpeggiator.prototype = {
  start : function() {
  },
  stop : function() {
  },
  range : 1,
  type : "ascend",
  tempo : 120
}
// FOR TESTING
// for (let i = 0; i < 25; i++) {
//   ARP_TYPE.descend(x);
//   console.log(midiNote);
// }
