'use strict';

// LowpassCombfilter for freeverb
//
//
//
//                     ┌─────────┐
// x(n)─────[+]────────│   z^-N  │───────┬──-> y(n)
//           ↑         └─────────┘       │
//           │         ┌─────────┐       │
//           └─────────│ lowpass │───────┘
//               f     └─────────┘
//
// f : feedback gain
//

module.exports = LowpassCombFilter;

const processBufferDelay = 128 / 44100; // Webkit processing buffer size

function LowpassCombFilter(context) {
  const node = context.createDelay(0.1);
  var adjDelay = context.createDelay(0.01);
  adjDelay.delayTime.value = processBufferDelay;
  const lowpass = context.createBiquadFilter();
  const feedback = context.createGain();

  // this magic number seems to fix everything in Chrome 53
  // see https://github.com/livejs/freeverb/issues/1#issuecomment-249080213
  lowpass.Q.value = -3.0102999566398125;
  lowpass.type = 'lowpass';

  // delay path with delay time compensation
  node.connect(adjDelay);

  // feedback path
  node.connect(lowpass);
  lowpass.connect(feedback);
  feedback.connect(node);

  // parameters
  node.dampening = lowpass.frequency;
  node.feedback = feedback.gain;

  // initial parameter settings
  node.dampening.value = 8000;
  node.delayTime.value = 0.05;
  node.feedback.value = 0.5;

  node.setDelayTime = function(value) {
    node.delayTime.value = value - processBufferDelay;
  };

  node.connect = adjDelay.connect.bind(adjDelay);
  node.disconnect = adjDelay.disconnect.bind(adjDelay);

  return node;
}
