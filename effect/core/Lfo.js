/**
 * Simple low-frequency oscillator
 *
 * @param {AudioContext} audioContext Web Audio API context
 * @param {Object} params Parameters to construct the node
 * @param {Number} params.frequency Frequency
 * @param {Number} params.phase Phase
 * @param {Number} params.amplitude Amplitude
 * @constructor
 */
function Lfo(audioContext, params) {
  this.context = audioContext;
  this.rangeScaler = audioContext.createGain();
  this.rangeScaler.channelCount = 1;
  this.rangeScaler.channelCountMode = 'explicit';

  this._frequency = params.frequency === void 0 ? this.metadata.frequency.default : params.frequency;
  this._phase = params.phase === void 0 ? this.metadata.phase.default : params.phase; // the phase of the oscillator between 0 - 360º
  this._amplitude = params.amplitude === void 0 ? this.metadata.amplitude.default : params.amplitude;
}

Lfo.prototype = Object.create(null, {
  connect: {
    value: function(targetParam) {
      this.rangeScaler.connect(targetParam);
    }
  },
  start: {
    value: function() {
      this.oscillator = this.context.createOscillator();

      this.frequency = this._frequency;
      this.phase = this._phase;
      this.amplitude = this._amplitude;

      this.oscillator.setPeriodicWave(this._wave);
      this.oscillator.connect(this.rangeScaler);
      this.oscillator.start();
    }
  },
  stop: {
    value: function() {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
    }
  },
  destroy: {
    value: function() {
      if (this.oscillator) {
        this.stop();
      }
      this.rangeScaler.disconnect();
      this.rangeScaler = null;
    }
  },
  /**
   * phase in degrees from 0 to 360
   */
  phase: {
    get: function() {
      return this._phase;
    },
    set: function(value) {
      this._phase = value;

      var coefficients = getRealImaginary(this._phase * Math.PI / 180);
      this._wave = this.context.createPeriodicWave(coefficients.real, coefficients.image, { disableNormalization: true });

      if (this.oscillator) {
        this.oscillator.setPeriodicWave(this._wave);
      }
    }
  },
  frequency: {
    get: function() {
      return this._frequency;
    },
    set: function(value) {
      this._frequency = value;

      if (this.oscillator) {
        this.oscillator.frequency.value = this._frequency;
      }
    }
  },
  amplitude: {
    get: function() {
      return this.rangeScaler.gain.value;
    },
    set: function(value) {
      this._amplitude = value;
      this.rangeScaler.gain.value = this._amplitude;
    }
  },
  metadata: {
    value: {
      frequency: {
        default: 1,
        min: 0,
        max: 20,
        automatable: false,
        type: 'float'
      },
      amplitude: {
        default: 1,
        type: 'float'
      },
      phase: {
        default: 0,
        min: 0,
        max: 360,
        automatable: false,
        type: 'float'
      }
    }
  }
});

/**
 * @param {Number} phase Phase
 *  @returns {Object} inverted Fourier coefficients
 */
function getRealImaginary(phase) {
  return {
    real: new Float32Array([0, Math.sin(phase)]),
    image: new Float32Array([0, Math.cos(phase)])
  };
}
