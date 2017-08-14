import AllpassFilter from './AllpassFilter';
import LowpassCombFilter from './LowpassCombFilter';

// All delay times in the below filter tunings must be bigger numbers than 128/44100
const combFilterTunings = [1557 / 44100, 1617 / 44100, 1491 / 44100, 1422 / 44100, 1277 / 44100, 1356 / 44100, 1188 / 44100, 1116 / 44100];
const allpassFilterTunings = [225 / 44100, 556 / 44100, 441 / 44100, 341 / 44100];

export default function Freeverb(audioContext) {
  const node = audioContext.createGain();
  node.channelCountMode = 'explicit';
  node.channelCount = 2;

  let spread = 23 / 44100; // for stereo spread

  const output = audioContext.createGain();
  const merger = audioContext.createChannelMerger(2);
  const splitter = audioContext.createChannelSplitter(2);

  const wet = audioContext.createGain();
  const dry = audioContext.createGain();
  wet.gain.value = 1;
  dry.gain.value = 0;

  node.connect(dry);
  node.connect(splitter);
  merger.connect(wet);
  wet.connect(output);
  dry.connect(output);

  const combFiltersL = [];
  const combFiltersR = [];
  const allpassFiltersL = [];
  const allpassFiltersR = [];
  let roomSize = 0.8;
  let dampening = 3000;

  // make the allpass filters on the left
  for (let l = 0; l < allpassFilterTunings.length; l++) {
    let allpassL = new AllpassFilter(audioContext);
    allpassL.setDelayTime(allpassFilterTunings[l]);
    allpassFiltersL.push(allpassL);

    if (allpassFiltersL[l - 1]) {
      allpassFiltersL[l - 1].connect(allpassL);
    }
  }

  // make the allpass filters on the right
  for (let r = 0; r < allpassFilterTunings.length; r++) {
    let allpassR = new AllpassFilter(audioContext);
    allpassR.setDelayTime(allpassFilterTunings[r]);
    allpassFiltersR.push(allpassR);

    if (allpassFiltersR[r - 1]) {
      allpassFiltersR[r - 1].connect(allpassR);
    }
  }

  allpassFiltersL[allpassFiltersL.length - 1].connect(merger, 0, 0);
  allpassFiltersR[allpassFiltersR.length - 1].connect(merger, 0, 1);

  // Comb Left
  for (let c = 0; c < combFilterTunings.length; c++) {
    let lfpf = new LowpassCombFilter(audioContext);
    lfpf.setDelayTime(combFilterTunings[c]);
    splitter.connect(lfpf, 0);
    lfpf.connect(allpassFiltersL[0]);
    combFiltersL.push(lfpf);
  }

  // Comb Right
  for (let c = 0; c < combFilterTunings.length; c++) {
    let lfpf = new LowpassCombFilter(audioContext);
    lfpf.setDelayTime(combFilterTunings[c] + spread);
    splitter.connect(lfpf, 1);
    lfpf.connect(allpassFiltersR[0]);
    combFiltersR.push(lfpf);
  }

  Object.defineProperties(node, {
    roomSize: {
      get: function() {
        return roomSize;
      },
      set: function(value) {
        roomSize = value;
        refreshFilters();
      }
    },
    dampening: {
      get: function() {
        return dampening;
      },

      set: function(value) {
        dampening = value;
        refreshFilters();
      }
    },
    spread: {
      get: function() {
        return spread;
      },
      set: function(value) {
        spread = value;

        // Right
        for (var c = 0; c < combFilterTunings.length; c++) {
          combFiltersR[c].setDelayTime(combFilterTunings[c] + spread);
        }
      }
    },
    wetDryMix: {
      get: function() {
        return wet.gain.value;
      },

      set: function(value) {
        wet.gain.value = value;
        dry.gain.value = 1 - value;
      }
    },
    wet: {
      get: function() {
        return wet.gain.value;
      },

      set: function(value) {
        wet.gain.value = value;
      }
    },
    dry: {
      get: function() {
        return dry.gain.value;
      },

      set: function(value) {
        dry.gain.value = value;
      }
    }
  });

  refreshFilters();

  node.connect = output.connect.bind(output);
  node.disconnect = output.disconnect.bind(output);

  return node;

  // scoped
  function refreshFilters() {
    for (let i = 0; i < combFiltersL.length; i++) {
      combFiltersL[i].feedback.value = roomSize;
      combFiltersL[i].dampening.value = dampening;
    }

    for (let i = 0; i < combFiltersR.length; i++) {
      combFiltersR[i].feedback.value = roomSize;
      combFiltersR[i].dampening.value = dampening;
    }
  }
}
