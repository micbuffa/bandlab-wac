import { audioCtx } from './sampler.js';

// const SAMPLE_LIST = '/soundbanks/string-orchestra/string-orchestra.json';
const SAMPLE_LIST = '/soundbanks/dry-kit/dry-kit.json';
// const SAMPLE_LIST = '/soundbanks/rhodes/rhodes.json';

export async function downloadSoundbank() {
  return fetch(SAMPLE_LIST)
    .then(res => res.json())
    .then(json => {
      const promises = json.samples.map(sample => {
        return fetch(sample.urls.ogg)
          .then(res => res.arrayBuffer())
          .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
          .then(audioBuffer => sample.buffer = audioBuffer);
      });
      return Promise.all(promises)
        .then(() => json);
    });
}
