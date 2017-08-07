import { audioCtx } from './sampler.js';

const SAMPLE_LIST = '/soundbank/string-orchestra/samples.json';

export async function downloadSoundbank() {
  const soundbankStore = new Map();
  return fetch(SAMPLE_LIST)
    .then(res => res.json())
    .then(list => {
      const promises = list.map(sample => {
        return fetch(sample.url)
          .then(res => res.arrayBuffer())
          .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
          .then(audioBuffer => soundbankStore.set(sample.midiNote, audioBuffer));
      });
      return Promise.all(promises);
    })
    .then(() => soundbankStore);
}
