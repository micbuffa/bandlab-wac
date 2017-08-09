// Allpass filer for freeverb
//
//                    -g
//         ┌──────────────────────┐
//         │      ┌──────────┐    ↓
// x(n)────┴─[+]──│   z^-N   │───[+]─┬──-> y(n)
//            ↑   └──────────┘       │
//            └──────────────────────┘
//                     g
//

module.exports = AllpassFilter;

const processBufferDelay = 128 / 44100; // Webkit processing buffer size

function AllpassFilter(context) {
  const node = context.createGain();
  const delay = context.createDelay(0.05);
  const adjDelay = context.createDelay(0.01);
  adjDelay.delayTime.value = processBufferDelay;
  const direct = context.createGain();
  const feedback = context.createGain();
  const output = context.createGain();

  var g = 0.5; // from the original freeverb

  // delay line path
  node.connect(delay);

  // delay time compensation
  delay.connect(adjDelay);
  adjDelay.connect(output);

  // generating direct path
  node.connect(direct);
  direct.connect(output);
  direct.gain.value = -g; // set -g
  direct.connect(feedback);

  // generating feedback path
  delay.connect(feedback);
  feedback.connect(delay);
  feedback.gain.value = g; // set g

  node.setDelayTime = function(value) {

    // remove processing buffer delay from feedback
    // this will be compensated by adjDelay node
    delay.delayTime.value = value - processBufferDelay;
  };

  node.setCoefficient = function(value) {
    direct.gain.value = -value; // set -g
    feedback.gain.value = value; // set g
  };

  node.connect = output.connect.bind(output);
  node.disconnect = output.disconnect.bind(output);

  return node;
}
