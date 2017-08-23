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
  const crossfadingAudioBuffer = audioCtx.createBuffer(audioBuffer.numberOfChannels, loopEnd * SAMPLE_RATE, SAMPLE_RATE);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const crossfadingChannel = createCrossfade(audioBuffer.getChannelData(channel), { loopStart, loopEnd, crossfade });
    crossfadingAudioBuffer.copyToChannel(crossfadingChannel, channel);
  }

  return crossfadingAudioBuffer;
}

// Pre-process the sample for playback
function createCrossfade(arrayBuffer, { loopStart, loopEnd, crossfade }) {

  // Convert loopStart, loopEnd, crossfade to samples for sanity purposes
  loopStart = secondsToSamples(loopStart);
  loopEnd = secondsToSamples(loopEnd);
  crossfade = secondsToSamples(crossfade);

  const fadeOutStart = loopEnd - crossfade;

  const newBuffer = arrayBuffer.slice(0, loopEnd);
  fadeOut(newBuffer, fadeOutStart, loopEnd);

  const fadeInBuffer = arrayBuffer.slice(loopStart - crossfade, loopStart);
  fadeIn(fadeInBuffer, 0, fadeInBuffer.length);

  // Sum fade in and fade out
  for (let i = 0; i < crossfade; i++) {
    newBuffer[fadeOutStart + i] = newBuffer[fadeOutStart + i] + fadeInBuffer[i];
  }

  return newBuffer;
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
