import { audioCtx } from './sampler.js';

// -------------------------------------------------------------------------------------------------
// Play position starts at zero, proceeds to loop end, then goes back to loop start.
// During the crossfade, starting crossfade samples before loopEnd, we fade out at the play
// position, and fade in before loopStart.
//
//
//          loopStart   crossfadeStart
//             |          |
//             |__________|
//             /          \ loopEnd
//            /            \ |
//           /              \|
//  ________/________________\______
//                        |  |
//            crossfade ->|  |<-
//
// -------------------------------------------------------------------------------------------------

const SAMPLE_RATE = audioCtx.sampleRate;

export function includeCrossfade(audioBuffer, { loopStart, loopEnd, crossfade }) {
}

// Pre-process the sample for playback
function createCrossfade(arrayBuffer, { loopStart, loopEnd, crossfade }) {
}

function secondsToSamples(seconds) {
  return Math.round(seconds * SAMPLE_RATE);
}
