import './clock.js';

import { downloadSoundbank } from './soundbank.js';
import { renderInstrument } from './instrument.js';
import { useSoundbank } from './sampler.js';

(async function() {
  const piano = renderInstrument();
  document.querySelector('main').append(piano);

  const soundbankStore = await downloadSoundbank();
  useSoundbank(soundbankStore, piano);
})();
