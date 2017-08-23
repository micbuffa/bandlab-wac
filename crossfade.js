import { audioCtx } from './sampler.js';

const SAMPLE_RATE = audioCtx.sampleRate;

export function includeCrossfade(audioBuffer, { loopStart, loopEnd, crossfade }) {
}

// Pre-process the sample for playback
function createCrossfade(arrayBuffer, { loopStart, loopEnd, crossfade }) {
}

function secondsToSamples(seconds) {
  return Math.round(seconds * SAMPLE_RATE);
}

function fadeIn(arrayBuffer, start, end) {
  for (let i = start; i < end; i++) {
    arrayBuffer[i] = arrayBuffer[i] * Math.sin(((i - start) * (Math.PI / ((end - start) * 2))));
  }
}

function fadeOut(arrayBuffer, start, end) {
  for (let i = start; i < end; i++) {
    arrayBuffer[i] = arrayBuffer[i] * Math.cos(((i - start) * (Math.PI / ((end - start) * 2))));
  }
}
