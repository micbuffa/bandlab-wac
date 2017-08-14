import Lfo from './Lfo';

export default function Chorus(audioContext) {
  const node = audioContext.createGain();
  node.channelCountMode = 'explicit';
  node.channelCount = 2;

  const attenuator = audioContext.createGain();
  const splitter = audioContext.createChannelSplitter(2);
  const delayL = audioContext.createDelay();
  const delayR = audioContext.createDelay();
  const feedbackGainNodeLR = audioContext.createGain();
  const feedbackGainNodeRL = audioContext.createGain();
  const merger = audioContext.createChannelMerger(2);

  delayL.delayTime.value = 0;
  delayR.delayTime.value = 0;

  const lfoL = new Lfo(audioContext, {
    frequency: metadata.rate.default,
    amplitude: metadata.delay.max - metadata.delay.min,
    phase: 0
  });
  const lfoR = new Lfo(audioContext, {
    frequency: metadata.rate.default,
    amplitude: metadata.delay.max - metadata.delay.min,
    phase: 180
  });

  lfoL.connect(delayL);
  lfoR.connect(delayR);

  let depth = 0;

  node.connect(attenuator);
  attenuator.connect(output);
  attenuator.connect(splitter);
  splitter.connect(delayL, 0);
  plitter.connect(delayR, 1);
  delayL.connect(feedbackGainNodeLR);
  delayR.connect(feedbackGainNodeRL);
  feedbackGainNodeLR.connect(delayR);
  feedbackGainNodeRL.connect(delayL);
  delayL.connect(merger, 0, 0);
  delayR.connect(merger, 0, 1);
  merger.connect(output);

  // Override super class method to manage LFO
  this.connect = function(target) {
    output.connect(target && target.input ? target.input : target);
    lfoL.start();
    lfoR.start();
  };
  this.disconnect = function() {
    output.disconnect();
    lfoL.stop();
    lfoR.stop();
  };
  Object.defineProperties(node, {
    delay: {
      get: function() {
        return this._delay;
      },
      set: function(delayTime) {
        this._delay = delayTime / 10; // Big delay values make sound broken, Tuna has strange implementation: 0.0002 * (Math.pow(10, delayTime) * 2);
        this.depth = this._depth;
      }
    },
    /**
     * The depth of the effect [0..1]. A depth of 1 makes the delayTime
     * modulate between 0 and 2*delayTime (centered around the delayTime).
     */
    depth: {
      get: function() {
        return this._depth;
      },
      set: function(depth) {
        this._depth = depth;
        this.delayL.delayTime.value = this._delay;
        this.lfoL.amplitude = this._delay * this._depth;
        this.delayR.delayTime.value = this._delay;
        this.lfoR.amplitude = this._delay * this._depth;
      }
    },
    feedback: {
      enumerable: true,
      get: function() {
        return this._feedback;
      },
      set: function(value) {
        this._feedback = value;
        this.feedbackGainNodeLR.gain.value = this._feedback;
        this.feedbackGainNodeRL.gain.value = this._feedback;
      }
    },
    rate: {
      enumerable: true,
      get: function() {
        return this._rate;
      },
      set: function(value) {
        this._rate = value;
        this.lfoL.frequency = this._rate;
        this.lfoR.frequency = this._rate;
      }
    }
  });

  node.connect = output.connect.bind(output);
  node.disconnect = output.disconnect.bind(output);

  return node;
}
